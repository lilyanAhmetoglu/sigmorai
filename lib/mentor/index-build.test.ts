import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  CASE_FILE,
  CONTENT_DIR,
  LESSON_FILE,
  OUTLINE_FILE,
  QUICK_CHECK_FILE,
} from '@/lib/constants';
import { CaseSchema, QuickCheckSchema, type MentorChunkDraft } from '@/lib/types';
import type { EmbedResult } from './embed';
import {
  buildIndex,
  collectLessons,
  formatSummary,
  lessonChunks,
  lessonFiles,
  planDoc,
  type DocChange,
  type MentorIndexStore,
  type StoredChunk,
} from './index-build';

// ── Fairness guards over the REAL content tree ─────────────────────────────

const FORBIDDEN = [CASE_FILE, QUICK_CHECK_FILE, OUTLINE_FILE];
/** Distinct option / explanation texts a lesson repeats word for word (see the test). */
const KNOWN_LESSON_OVERLAPS = 38;

describe('real content/: the indexer reads lessons only', () => {
  test('the file walk lists only lesson.mdx files, never a case, quick check or outline', async () => {
    const files = await lessonFiles(CONTENT_DIR);
    expect(files.length).toBeGreaterThan(100);
    for (const file of files) {
      expect(path.basename(file)).toBe(LESSON_FILE);
      for (const bad of FORBIDDEN) expect(file).not.toContain(bad);
      expect(file.startsWith('blog/')).toBe(false);
    }
  });

  test('every lesson.mdx on disk is in the walk', async () => {
    const all = await Array.fromAsync(new Bun.Glob(`**/${LESSON_FILE}`).scan(CONTENT_DIR));
    expect((await lessonFiles(CONTENT_DIR)).sort()).toEqual(all.sort());
  });

  test('no case or quick-check option text or explanation (≥ 30 chars) is in any chunk', async () => {
    // The TEST reads the graded files; the indexer never does.
    const secrets = new Set<string>();
    const graded = [
      ...(await Array.fromAsync(new Bun.Glob(`**/${CASE_FILE}`).scan(CONTENT_DIR))).map((f) => ({
        f,
        schema: CaseSchema,
      })),
      ...(await Array.fromAsync(new Bun.Glob(`**/${QUICK_CHECK_FILE}`).scan(CONTENT_DIR))).map(
        (f) => ({ f, schema: QuickCheckSchema }),
      ),
    ];
    expect(graded.length).toBeGreaterThan(100);
    for (const { f, schema } of graded) {
      const data = schema.parse(JSON.parse(await readFile(path.join(CONTENT_DIR, f), 'utf8')));
      for (const q of data.questions) {
        for (const o of q.options) {
          for (const text of [o.text, o.explanation]) {
            const t = text.trim().toLowerCase();
            if (t.length >= 30) secrets.add(t);
          }
        }
      }
    }
    expect(secrets.size).toBeGreaterThan(100);

    const lessons = await collectLessons(CONTENT_DIR);
    const lessonFileText = new Map(lessons.map((l) => [l.id, l.body.toLowerCase()]));
    const chunks = [...lessonChunks(lessons).values()].flat();
    expect(chunks.length).toBeGreaterThan(500);
    /** In a chunk, and NOT written in that lesson's own file: text from somewhere else. */
    const leaks: string[] = [];
    /** In a chunk because the lesson itself states it word for word (an authoring overlap). */
    const overlaps = new Set<string>();
    for (const c of chunks) {
      const fields = [c.body, c.title, c.heading ?? ''].map((s) => s.toLowerCase());
      for (const secret of secrets) {
        if (!fields.some((field) => field.includes(secret))) continue;
        if (lessonFileText.get(c.docKey)?.includes(secret)) overlaps.add(secret);
        else leaks.push(`${c.docKey}: "${secret}"`);
      }
    }
    expect(leaks).toEqual([]);
    // KNOWN DEBT (2026-10-08): some lessons state a case's option text word for
    // word (mostly the correct one), so the spec's "no option text in any chunk"
    // can't hold until that content is reworded. This ratchet stops new
    // overlaps; lower it as lessons or cases are fixed, never raise it.
    // `MENTOR_KNOWN_OVERLAPS=1 bun test lib/mentor` prints the list.
    if (process.env.MENTOR_KNOWN_OVERLAPS) console.log([...overlaps].sort().join('\n'));
    expect(overlaps.size).toBeLessThanOrEqual(KNOWN_LESSON_OVERLAPS);
  });

  test('no chunk carries an NPC DialogBox or frontmatter', async () => {
    const chunks = [...lessonChunks(await collectLessons(CONTENT_DIR)).values()].flat();
    for (const c of chunks) {
      expect(c.body).not.toContain('<DialogBox');
      expect(c.body.startsWith('---')).toBe(false);
    }
  });
});

// ── planDoc ────────────────────────────────────────────────────────────────

const draft = (hash: string, ord: number): MentorChunkDraft => ({
  kind: 'lesson',
  docKey: 'd',
  title: 'T',
  heading: null,
  ord,
  body: hash,
  embedText: hash,
  contentHash: hash,
});

describe('planDoc', () => {
  test('keeps same hashes, inserts new, deletes gone, fixes ord on moved rows', () => {
    const stored: StoredChunk[] = [
      { id: 1, docKey: 'd', contentHash: 'a', ord: 0 },
      { id: 2, docKey: 'd', contentHash: 'b', ord: 1 },
      { id: 3, docKey: 'd', contentHash: 'c', ord: 2 },
    ];
    const plan = planDoc(stored, [draft('c', 0), draft('a', 1), draft('n', 2)]);
    expect(plan.insert.map((d) => d.contentHash)).toEqual(['n']);
    expect(plan.deleteIds).toEqual([2]);
    expect(plan.reorder).toEqual([
      { id: 3, ord: 0 },
      { id: 1, ord: 1 },
    ]);
  });

  test('no change → empty plan', () => {
    const plan = planDoc([{ id: 1, docKey: 'd', contentHash: 'a', ord: 0 }], [draft('a', 0)]);
    expect(plan).toEqual({ insert: [], deleteIds: [], reorder: [] });
  });
});

// ── buildIndex with fakes (temp content tree, in-memory store, fake fetch) ─

/** An in-memory mentor_chunks. */
function memoryStore() {
  const rows: (StoredChunk & { embedding: number[] })[] = [];
  let nextId = 1;
  const applied: DocChange[] = [];
  const store: MentorIndexStore = {
    list: async () =>
      rows.map(({ id, docKey, contentHash, ord }) => ({ id, docKey, contentHash, ord })),
    apply: async (change) => {
      applied.push(change);
      for (const id of change.deleteIds)
        rows.splice(
          rows.findIndex((r) => r.id === id),
          1,
        );
      for (const { id, ord } of change.reorder) rows.find((r) => r.id === id)!.ord = ord;
      for (const c of change.insert) {
        if (rows.some((r) => r.docKey === c.docKey && r.contentHash === c.contentHash)) {
          throw new Error('unique (doc_key, content_hash) violated');
        }
        rows.push({
          id: nextId++,
          docKey: c.docKey,
          contentHash: c.contentHash,
          ord: c.ord,
          embedding: c.embedding,
        });
      }
    },
    deleteDocs: async (keys) => {
      const before = rows.length;
      for (let i = rows.length - 1; i >= 0; i--)
        if (keys.includes(rows[i].docKey)) rows.splice(i, 1);
      return before - rows.length;
    },
  };
  return { rows, applied, store };
}

function fakeEmbed() {
  const calls: string[][] = [];
  const embed = async (texts: string[]): Promise<EmbedResult> => {
    calls.push(texts);
    return { embeddings: texts.map(() => [1, 0, 0]), tokens: texts.length * 10 };
  };
  return { calls, embed };
}

const lessonMdx = (id: string, title: string, url: string, body: string) =>
  `---\nid: ${id}\ntitle: ${title}\nminutes: 5\nsources:\n  - kind: docs\n    title: Page ${title}\n    url: ${url}\n---\n\n${body}`;

const para = (word: string) => Array.from({ length: 120 }, () => word).join(' ');

describe('buildIndex', () => {
  let root: string;
  const pages = new Map<string, { status: number; type: string; body: string }>();
  const fetched: string[] = [];
  const fetchFn = async (url: string) => {
    fetched.push(url);
    const page = pages.get(url);
    if (!page) return new Response('nope', { status: 404 });
    return new Response(page.body, { status: page.status, headers: { 'content-type': page.type } });
  };

  beforeAll(async () => {
    root = await mkdtemp(path.join(tmpdir(), 'mentor-index-'));
    const c1 = path.join(root, 'builder/00-bootstrap-village/c1');
    const c2 = path.join(root, 'builder/00-bootstrap-village/c2');
    await mkdir(c1, { recursive: true });
    await mkdir(c2, { recursive: true });
    await writeFile(
      path.join(c1, LESSON_FILE),
      lessonMdx(
        'builder/r0/c1/lesson',
        'One',
        'https://platform.claude.com/docs/en/a',
        `## First\n\n${para('alpha')}\n\n## Second\n\n${para('beta')}\n`,
      ),
    );
    await writeFile(
      path.join(c2, LESSON_FILE),
      lessonMdx(
        'builder/r0/c2/lesson',
        'Two',
        'https://example.com/b',
        `## Only\n\n${para('gamma')}\n`,
      ),
    );
    // Graded files that must never be read: invalid JSON would throw if they were.
    await writeFile(path.join(c1, CASE_FILE), '{ not json');
    await writeFile(path.join(c1, QUICK_CHECK_FILE), '{ not json');
    await writeFile(path.join(root, 'builder', OUTLINE_FILE), '{ not json');
    pages.set('https://platform.claude.com/docs/en/a.md', {
      status: 200,
      type: 'text/markdown; charset=utf-8',
      body: `# A\n\n## Part\n\n${para('delta')}\n`,
    });
    pages.set('https://example.com/b', {
      status: 200,
      type: 'text/html',
      body: `<html><main><p>${para('epsilon')}</p></main></html>`,
    });
  });

  afterAll(async () => {
    await rm(root, { recursive: true, force: true });
  });

  test('first run inserts everything; a second run embeds 0 and writes 0', async () => {
    const { rows, applied, store } = memoryStore();
    const first = fakeEmbed();
    const s1 = await buildIndex({ root, store, embed: first.embed, fetchFn });
    expect(s1.lessons).toBe(2);
    expect(s1.sources).toBe(2);
    expect(s1.failed).toEqual([]);
    expect(s1.chunksAdded).toBe(rows.length);
    expect(rows.length).toBeGreaterThanOrEqual(4);
    expect(new Set(rows.map((r) => r.docKey))).toEqual(
      new Set([
        'builder/r0/c1/lesson',
        'builder/r0/c2/lesson',
        'platform.claude.com/docs/en/a',
        'example.com/b',
      ]),
    );
    expect(s1.tokens).toBe(rows.length * 10);
    expect(fetched).toContain('https://platform.claude.com/docs/en/a.md');

    applied.length = 0;
    const second = fakeEmbed();
    const s2 = await buildIndex({ root, store, embed: second.embed, fetchFn });
    expect(second.calls).toEqual([]);
    expect(applied).toEqual([]);
    expect(s2).toMatchObject({
      chunksAdded: 0,
      chunksDeleted: 0,
      chunksReordered: 0,
      docsChanged: 0,
      tokens: 0,
    });
    expect(formatSummary(s2)).toContain('tokens embedded: 0');
  });

  test('a failed source fetch keeps its old rows', async () => {
    const { rows, store } = memoryStore();
    await buildIndex({ root, store, embed: fakeEmbed().embed, fetchFn });
    const before = rows.filter((r) => r.docKey === 'example.com/b').length;
    expect(before).toBeGreaterThan(0);
    const saved = pages.get('https://example.com/b')!;
    pages.set('https://example.com/b', { status: 503, type: 'text/plain', body: '' });
    try {
      const s = await buildIndex({ root, store, embed: fakeEmbed().embed, fetchFn });
      expect(s.failed.map((f) => f.url)).toEqual(['https://example.com/b']);
      expect(rows.filter((r) => r.docKey === 'example.com/b')).toHaveLength(before);
      expect(s.chunksDeleted).toBe(0);
    } finally {
      pages.set('https://example.com/b', saved);
    }
  });

  test('a document that is gone (deleted lesson, uncited page) loses all its rows', async () => {
    const { rows, store } = memoryStore();
    await store.apply({
      docKey: 'builder/r9/c9/lesson',
      insert: [{ ...draft('old', 0), docKey: 'builder/r9/c9/lesson', embedding: [0] }],
      deleteIds: [],
      reorder: [],
    });
    const s = await buildIndex({ root, store, embed: fakeEmbed().embed, fetchFn });
    expect(rows.some((r) => r.docKey === 'builder/r9/c9/lesson')).toBe(false);
    expect(s.docsRemoved).toBe(1);
  });

  test('a moved section keeps its row and only its ord changes', async () => {
    const { rows, store } = memoryStore();
    await buildIndex({ root, store, embed: fakeEmbed().embed, fetchFn });
    const file = path.join(root, 'builder/00-bootstrap-village/c1', LESSON_FILE);
    const original = await readFile(file, 'utf8');
    await writeFile(
      file,
      lessonMdx(
        'builder/r0/c1/lesson',
        'One',
        'https://platform.claude.com/docs/en/a',
        `## Second\n\n${para('beta')}\n\n## First\n\n${para('alpha')}\n`,
      ),
    );
    try {
      const ids = rows
        .filter((r) => r.docKey === 'builder/r0/c1/lesson')
        .map((r) => r.id)
        .sort();
      const embed = fakeEmbed();
      const s = await buildIndex({ root, store, embed: embed.embed, fetchFn });
      expect(embed.calls).toEqual([]);
      expect(s.chunksReordered).toBe(2);
      expect(
        rows
          .filter((r) => r.docKey === 'builder/r0/c1/lesson')
          .map((r) => r.id)
          .sort(),
      ).toEqual(ids);
    } finally {
      await writeFile(file, original);
    }
  });
});
