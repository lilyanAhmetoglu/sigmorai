import 'server-only';
import type { Dirent } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { eq, inArray, sql } from 'drizzle-orm';
import type { NeonDatabase } from 'drizzle-orm/neon-serverless';
import type * as schema from '@/db/schema';
import { mentorChunks } from '@/db/schema';
import {
  CONTENT_DIR,
  LESSON_FILE,
  MENTOR_EMBED_BATCH,
  MENTOR_EMBED_USD_PER_MTOK,
  MENTOR_FETCH_CONCURRENCY,
} from '@/lib/constants';
import { pageFetch } from '@/lib/content/docs-watch';
import { fetchPageWithFallback, type FetchFn } from '@/lib/content/fetch-page';
import { parseExerciseId } from '@/lib/content/ids';
import { contentPath, parseMdx } from '@/lib/content/load';
import { exerciseFile } from '@/lib/content/paths';
import { urlKey } from '@/lib/content/source-urls';
import {
  LessonFrontmatterSchema,
  type LessonFrontmatter,
  type MentorChunkDraft,
} from '@/lib/types';
import { chunkLesson, chunkSource } from './chunk';
import type { EmbedResult } from './embed';

/**
 * Mentor index, steps 2–8 (docs/plans/mentor-design-plan.md → Indexing
 * pipeline): collect lessons and their cited pages, chunk, diff each document
 * against `mentor_chunks` by content_hash, embed only new chunks, write one
 * transaction per document.
 *
 * Fairness: the ONLY files this module opens are `lesson.mdx` files (the walk
 * below lists nothing else). case.json, quick-check.json and outline.json are
 * never read, so a graded answer cannot reach the index. Tests guard this.
 *
 * Network, DB and the embedder are passed in, so tests run with fakes.
 */

// ── Lessons ───────────────────────────────────────────────────────────────

/** Every `lesson.mdx` under `root`, as paths relative to it, sorted. Opens no file. */
export async function lessonFiles(root = CONTENT_DIR): Promise<string[]> {
  const base = contentPath(root, '.');
  const found: string[] = [];
  async function walk(dir: string) {
    const entries: Dirent[] = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(abs);
      else if (entry.isFile() && entry.name === LESSON_FILE) {
        found.push(path.relative(base, abs).split(path.sep).join('/'));
      }
    }
  }
  await walk(base);
  return found.sort();
}

export type IndexLesson = {
  id: string;
  title: string;
  /** The MDX body after the frontmatter (DialogBox blocks still in; chunkLesson strips them). */
  body: string;
  sources: LessonFrontmatter['sources'];
};

/**
 * Reads every lesson file. The id comes from the frontmatter and must match
 * the file's place (the same rule loadLesson enforces), so a bad file throws
 * instead of indexing under a wrong id.
 */
export async function collectLessons(root = CONTENT_DIR): Promise<IndexLesson[]> {
  const lessons: IndexLesson[] = [];
  for (const rel of await lessonFiles(root)) {
    const file = path.join(root, rel);
    const { raw, body } = parseMdx(await readFile(contentPath(root, rel), 'utf8'), file);
    const result = LessonFrontmatterSchema.safeParse(raw);
    if (!result.success) throw new Error(`${file}: invalid lesson frontmatter`);
    const { id, title, sources } = result.data;
    const ref = parseExerciseId(id);
    if (!ref || exerciseFile(ref) !== rel) throw new Error(`${file}: id ${id} does not match`);
    lessons.push({ id, title, body, sources });
  }
  return lessons.sort((a, b) => a.id.localeCompare(b.id));
}

/** Every lesson's chunks, keyed by lesson id. No embedding, no IO. */
export function lessonChunks(lessons: readonly IndexLesson[]): Map<string, MentorChunkDraft[]> {
  return new Map(lessons.map((lesson) => [lesson.id, chunkLesson(lesson)]));
}

/** Every cited page by urlKey, with the title the first citing lesson gives it. */
export function citedSources(
  lessons: readonly IndexLesson[],
): Map<string, { url: string; title: string }> {
  const cited = new Map<string, { url: string; title: string }>();
  for (const lesson of lessons) {
    for (const source of lesson.sources) {
      const key = urlKey(source.url);
      if (key && !cited.has(key)) cited.set(key, { url: `https://${key}`, title: source.title });
    }
  }
  return new Map([...cited].sort(([a], [b]) => a.localeCompare(b)));
}

// ── Diff ──────────────────────────────────────────────────────────────────

/** What the indexer needs from a stored row. */
export type StoredChunk = { id: number; docKey: string; contentHash: string; ord: number };
export type NewChunk = MentorChunkDraft & { embedding: number[] };

/** One document's writes. `apply` runs them in ONE transaction. */
export type DocChange = {
  docKey: string;
  insert: NewChunk[];
  deleteIds: number[];
  reorder: { id: number; ord: number }[];
};

export type DocPlan = {
  insert: MentorChunkDraft[];
  deleteIds: number[];
  reorder: { id: number; ord: number }[];
};

/** Stored rows vs fresh drafts of one document. Same hash = keep (ord fixed if the section moved). Pure. */
export function planDoc(
  stored: readonly StoredChunk[],
  drafts: readonly MentorChunkDraft[],
): DocPlan {
  const byHash = new Map(stored.map((row) => [row.contentHash, row]));
  const fresh = new Set(drafts.map((d) => d.contentHash));
  return {
    insert: drafts.filter((d) => !byHash.has(d.contentHash)),
    deleteIds: stored.filter((row) => !fresh.has(row.contentHash)).map((row) => row.id),
    reorder: drafts.flatMap((d) => {
      const row = byHash.get(d.contentHash);
      return row && row.ord !== d.ord ? [{ id: row.id, ord: d.ord }] : [];
    }),
  };
}

const isEmptyPlan = (plan: DocPlan) =>
  plan.insert.length === 0 && plan.deleteIds.length === 0 && plan.reorder.length === 0;

// ── Store ─────────────────────────────────────────────────────────────────

export interface MentorIndexStore {
  /** Every stored row (no body, no vector). */
  list(): Promise<StoredChunk[]>;
  /** One document's changes, in one transaction. */
  apply(change: DocChange): Promise<void>;
  /** Removes every row of these documents. Returns the rows deleted. */
  deleteDocs(docKeys: readonly string[]): Promise<number>;
}

export type MentorDb = NeonDatabase<typeof schema>;

/** The real store: `mentor_chunks` through Drizzle. */
export function drizzleStore(db: MentorDb): MentorIndexStore {
  return {
    list: () =>
      db
        .select({
          id: mentorChunks.id,
          docKey: mentorChunks.docKey,
          contentHash: mentorChunks.contentHash,
          ord: mentorChunks.ord,
        })
        .from(mentorChunks),
    apply: (change) =>
      db.transaction(async (tx) => {
        if (change.deleteIds.length > 0) {
          await tx.delete(mentorChunks).where(inArray(mentorChunks.id, change.deleteIds));
        }
        for (const { id, ord } of change.reorder) {
          await tx
            .update(mentorChunks)
            .set({ ord, indexedAt: sql`now()` })
            .where(eq(mentorChunks.id, id));
        }
        if (change.insert.length > 0) {
          await tx.insert(mentorChunks).values(
            change.insert.map((c) => ({
              kind: c.kind,
              docKey: c.docKey,
              title: c.title,
              heading: c.heading,
              ord: c.ord,
              body: c.body,
              contentHash: c.contentHash,
              embedding: c.embedding,
            })),
          );
        }
      }),
    deleteDocs: async (docKeys) => {
      if (docKeys.length === 0) return 0;
      const rows = await db
        .delete(mentorChunks)
        .where(inArray(mentorChunks.docKey, [...docKeys]))
        .returning({ id: mentorChunks.id });
      return rows.length;
    },
  };
}

// ── Build ─────────────────────────────────────────────────────────────────

export type IndexSummary = {
  lessons: number;
  sources: number;
  /** Source pages that could not be fetched: their old rows are kept. */
  failed: { url: string; error: string }[];
  /** Source pages cut at MENTOR_SOURCE_MAX_CHUNKS. */
  capped: { url: string; dropped: number }[];
  docsChanged: number;
  docsRemoved: number;
  chunksAdded: number;
  chunksDeleted: number;
  chunksReordered: number;
  tokens: number;
  costUsd: number;
};

export type BuildOptions = {
  store: MentorIndexStore;
  /** Embeds document chunks in order (embedTexts with input_type `document`). */
  embed: (texts: string[]) => Promise<EmbedResult>;
  root?: string;
  fetchFn?: FetchFn;
  concurrency?: number;
  log?: (line: string) => void;
};

/** `fn` over `items`, at most `limit` at a time; results in input order. */
async function mapLimit<T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

export async function buildIndex(options: BuildOptions): Promise<IndexSummary> {
  const { store, embed, root = CONTENT_DIR, fetchFn = fetch, log = () => {} } = options;
  const summary: IndexSummary = {
    lessons: 0,
    sources: 0,
    failed: [],
    capped: [],
    docsChanged: 0,
    docsRemoved: 0,
    chunksAdded: 0,
    chunksDeleted: 0,
    chunksReordered: 0,
    tokens: 0,
    costUsd: 0,
  };

  // 1–2. Lessons → chunks.
  const lessons = await collectLessons(root);
  const docs = lessonChunks(lessons);
  summary.lessons = lessons.length;

  // 3–4. Cited pages → chunks. A failed fetch keeps that page's old rows.
  const sources = citedSources(lessons);
  summary.sources = sources.size;
  const fetched = await mapLimit(
    [...sources],
    options.concurrency ?? MENTOR_FETCH_CONCURRENCY,
    async ([key, { url, title }]) => {
      try {
        const page = await fetchPageWithFallback(pageFetch(url), fetchFn);
        return {
          key,
          url,
          ok: true as const,
          ...chunkSource({ docKey: key, url, title, ...page }),
        };
      } catch (err) {
        const error = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
        return { key, url, ok: false as const, error };
      }
    },
  );
  for (const page of fetched) {
    if (!page.ok) {
      summary.failed.push({ url: page.url, error: page.error });
      log(`fetch failed (old chunks kept): ${page.url} ${page.error}`);
      continue;
    }
    if (page.dropped > 0) {
      summary.capped.push({ url: page.url, dropped: page.dropped });
      log(`capped: ${page.url} kept ${page.chunks.length}, dropped ${page.dropped}`);
    }
    docs.set(page.key, page.chunks);
  }

  // 6. Diff against what is stored.
  const stored = new Map<string, StoredChunk[]>();
  for (const row of await store.list()) {
    const rows = stored.get(row.docKey) ?? [];
    rows.push(row);
    stored.set(row.docKey, rows);
  }

  // 7. Embed new chunks in rounds (one request per 64 chunks), then write each document.
  let pending: { docKey: string; plan: DocPlan }[] = [];
  const flush = async () => {
    const texts = new Map<string, string>(); // hash → text: a shared chapter is embedded once
    for (const { plan } of pending) {
      for (const d of plan.insert) texts.set(d.contentHash, d.embedText);
    }
    const hashes = [...texts.keys()];
    const vectors = new Map<string, number[]>();
    if (hashes.length > 0) {
      const result = await embed([...texts.values()]);
      summary.tokens += result.tokens;
      hashes.forEach((hash, i) => vectors.set(hash, result.embeddings[i]));
    }
    for (const { docKey, plan } of pending) {
      await store.apply({
        docKey,
        insert: plan.insert.map((d) => ({ ...d, embedding: vectors.get(d.contentHash)! })),
        deleteIds: plan.deleteIds,
        reorder: plan.reorder,
      });
      summary.docsChanged++;
      summary.chunksAdded += plan.insert.length;
      summary.chunksDeleted += plan.deleteIds.length;
      summary.chunksReordered += plan.reorder.length;
    }
    pending = [];
  };
  let pendingChunks = 0;
  for (const [docKey, drafts] of docs) {
    const plan = planDoc(stored.get(docKey) ?? [], drafts);
    if (isEmptyPlan(plan)) continue;
    pending.push({ docKey, plan });
    pendingChunks += plan.insert.length;
    if (pendingChunks >= MENTOR_EMBED_BATCH) {
      await flush();
      pendingChunks = 0;
    }
  }
  await flush();

  // Documents that are gone (deleted lesson, page no longer cited). A failed fetch is still cited.
  const live = new Set([...docs.keys(), ...sources.keys()]);
  const gone = [...stored.keys()].filter((key) => !live.has(key));
  if (gone.length > 0) {
    summary.chunksDeleted += await store.deleteDocs(gone);
    summary.docsRemoved = gone.length;
  }

  summary.costUsd = (summary.tokens / 1_000_000) * MENTOR_EMBED_USD_PER_MTOK;
  return summary;
}

/** The run summary for stdout and $GITHUB_STEP_SUMMARY. URLs and counts only. */
export function formatSummary(s: IndexSummary): string {
  return [
    `mentor-index: ${s.lessons} lessons · ${s.sources} source pages · ${s.failed.length} fetch errors`,
    `documents changed: ${s.docsChanged} · removed: ${s.docsRemoved}`,
    `chunks added: ${s.chunksAdded} · deleted: ${s.chunksDeleted} · reordered: ${s.chunksReordered}`,
    `tokens embedded: ${s.tokens} · est. cost: $${s.costUsd.toFixed(4)}`,
    ...s.capped.map((c) => `  capped   ${c.url}  (dropped ${c.dropped})`),
    ...s.failed.map((f) => `  error    ${f.url}  ${f.error}`),
  ].join('\n');
}
