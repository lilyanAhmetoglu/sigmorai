/**
 * Mentor index, step 1: text → chunks (docs/plans/mentor-design-plan.md →
 * Indexing pipeline, amendments 2026-10-08). Pure: no IO, no network.
 *
 * - A lesson splits at every `##` (postSections from lib/content/blog.ts, so
 *   a `##` inside a code fence is not a split). Frontmatter and NPC
 *   `<DialogBox>` blocks are removed first: lore must not reach the mentor.
 * - A section under MENTOR_CHUNK_MIN_TOKENS joins the next one; a section
 *   over MENTOR_CHUNK_MAX_TOKENS splits at paragraph breaks into
 *   ~MENTOR_CHUNK_TARGET_TOKENS pieces.
 * - A Markdown source page chunks like a lesson; an HTML page (already flat
 *   text after htmlText) is cut into overlapping windows.
 * - Header line: `Lesson: <title> › <heading>` / `Source: <title> — <host>`.
 *   No path or realm, so a shared chapter hashes the same on every path.
 * - The same chunk twice inside one document is kept once (first wins).
 */
import {
  MENTOR_CHARS_PER_TOKEN,
  MENTOR_CHUNK_MAX_TOKENS,
  MENTOR_CHUNK_MIN_TOKENS,
  MENTOR_CHUNK_OVERLAP_TOKENS,
  MENTOR_CHUNK_TARGET_TOKENS,
  MENTOR_EMBED_DIM,
  MENTOR_EMBED_MODEL,
  MENTOR_SOURCE_MAX_CHUNKS,
} from '@/lib/constants';
import { postSections } from '@/lib/content/blog';
import { hostOf, sha256 } from '@/lib/content/docs-watch';
import type { MentorChunkDraft, MentorChunkKind } from '@/lib/types';

/** A piece of a document before it gets a header and a hash. */
type Piece = { heading: string | null; text: string };

const FRONTMATTER = /^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/;
/** `<DialogBox …>…</DialogBox>` or a self-closing `<DialogBox … />`. */
const DIALOG_BOX = /<DialogBox\b[^>]*?(?:\/>|>[\s\S]*?<\/DialogBox\s*>)/g;
const FENCE = /^ {0,3}(`{3,}|~{3,})/;

/** Estimated tokens (characters ÷ 4). */
export const estimateTokens = (text: string) => Math.ceil(text.length / MENTOR_CHARS_PER_TOKEN);

/** A lesson file (or body) without frontmatter and without NPC DialogBox blocks. */
export function lessonText(raw: string): string {
  return raw.replace(/\r\n/g, '\n').replace(FRONTMATTER, '').replace(DIALOG_BOX, '').trim();
}

export const lessonHeader = (title: string, heading: string | null) =>
  heading ? `Lesson: ${title} › ${heading}` : `Lesson: ${title}`;

export const sourceHeader = (title: string, url: string) => `Source: ${title} — ${hostOf(url)}`;

/** sha256 over model:dim + header + text: a new model or dimension re-embeds every chunk. */
export const chunkHash = (header: string, text: string) =>
  sha256(`${MENTOR_EMBED_MODEL}:${MENTOR_EMBED_DIM}\n${header}\n${text}`);

/** Blocks separated by blank lines; a fenced code block stays whole. */
function paragraphs(text: string): string[] {
  const blocks: string[] = [];
  let lines: string[] = [];
  let fence: string | null = null;
  const flush = () => {
    const block = lines.join('\n').trim();
    if (block) blocks.push(block);
    lines = [];
  };
  for (const line of text.split('\n')) {
    const open = FENCE.exec(line);
    if (open) {
      const mark = open[1][0];
      if (fence === null) fence = mark;
      else if (fence === mark) fence = null;
    }
    if (fence === null && !open && line.trim() === '') flush();
    else lines.push(line);
  }
  flush();
  return blocks;
}

/**
 * Overlapping windows of ~MENTOR_CHUNK_TARGET_TOKENS over flat text, cut at a
 * space where one is near, so a word is not split.
 */
export function textWindows(text: string): string[] {
  const size = MENTOR_CHUNK_TARGET_TOKENS * MENTOR_CHARS_PER_TOKEN;
  const overlap = MENTOR_CHUNK_OVERLAP_TOKENS * MENTOR_CHARS_PER_TOKEN;
  const out: string[] = [];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(text.length, start + size);
    if (end < text.length) {
      const space = text.lastIndexOf(' ', end);
      if (space > start + size / 2) end = space;
    }
    const piece = text.slice(start, end).trim();
    if (piece) out.push(piece);
    if (end >= text.length) break;
    // Step back by the overlap, then forward to the next word start.
    let next = end - overlap;
    const space = text.indexOf(' ', next);
    if (space !== -1 && space < end) next = space + 1;
    start = Math.max(next, start + 1);
  }
  return out;
}

/** A section over the max → ~target-sized pieces, cut at paragraph breaks. */
function splitLarge(piece: Piece): Piece[] {
  if (estimateTokens(piece.text) <= MENTOR_CHUNK_MAX_TOKENS) return [piece];
  const target = MENTOR_CHUNK_TARGET_TOKENS * MENTOR_CHARS_PER_TOKEN;
  const texts: string[] = [];
  let current = '';
  for (const para of paragraphs(piece.text)) {
    if (estimateTokens(para) > MENTOR_CHUNK_MAX_TOKENS) {
      // One huge paragraph (a long table, a giant code block): windows.
      if (current) texts.push(current);
      current = '';
      texts.push(...textWindows(para));
      continue;
    }
    if (current && current.length + 2 + para.length > target) {
      texts.push(current);
      current = para;
    } else {
      current = current ? `${current}\n\n${para}` : para;
    }
  }
  if (current) texts.push(current);
  return texts.map((text) => ({ heading: piece.heading, text }));
}

/** `b` appended to `a`; `b`'s heading stays visible as a `##` line inside the text. */
const join = (a: Piece, b: Piece): Piece => ({
  heading: a.heading ?? b.heading,
  text: `${a.text}\n\n${b.heading ? `## ${b.heading}\n\n` : ''}${b.text}`,
});

/** Small sections join the next one (the last one joins the one before it). */
function mergeSmall(pieces: Piece[]): Piece[] {
  const out: Piece[] = [];
  let carry: Piece | null = null;
  for (const piece of pieces) {
    const current: Piece = carry ? join(carry, piece) : piece;
    carry = null;
    if (estimateTokens(current.text) < MENTOR_CHUNK_MIN_TOKENS) carry = current;
    else out.push(current);
  }
  if (carry) {
    if (out.length > 0) out[out.length - 1] = join(out[out.length - 1], carry);
    else out.push(carry);
  }
  return out;
}

/** Markdown → pieces: split at `##`, merge small, split large. Empty sections are dropped. */
export function markdownPieces(markdown: string): Piece[] {
  const sections = postSections(markdown)
    .map((s) => ({ heading: s.heading?.text ?? null, text: s.text.trim() }))
    .filter((s) => s.text !== '');
  return mergeSmall(sections).flatMap(splitLarge);
}

/** Pieces → drafts with header, hash and order. A repeated chunk inside one document is kept once. */
function toDrafts(
  kind: MentorChunkKind,
  docKey: string,
  title: string,
  pieces: Piece[],
  header: (heading: string | null) => string,
): MentorChunkDraft[] {
  const seen = new Set<string>();
  const drafts: MentorChunkDraft[] = [];
  for (const { heading, text } of pieces) {
    const head = header(heading);
    const contentHash = chunkHash(head, text);
    if (seen.has(contentHash)) continue;
    seen.add(contentHash);
    drafts.push({
      kind,
      docKey,
      title,
      heading,
      ord: drafts.length,
      body: text,
      embedText: `${head}\n${text}`,
      contentHash,
    });
  }
  return drafts;
}

/** One lesson → its chunks. `body` may still hold frontmatter and DialogBox blocks. */
export function chunkLesson(lesson: { id: string; title: string; body: string }) {
  return toDrafts('lesson', lesson.id, lesson.title, markdownPieces(lessonText(lesson.body)), (h) =>
    lessonHeader(lesson.title, h),
  );
}

/** Media types whose normalised text is flat (htmlText / feedEntries), not Markdown. */
const isFlat = (contentType: string) =>
  contentType === 'text/html' ||
  contentType === 'application/xhtml+xml' ||
  contentType.endsWith('/xml') ||
  contentType.endsWith('+xml');

/**
 * One fetched source page → its chunks, capped at MENTOR_SOURCE_MAX_CHUNKS
 * (`dropped` says how many were cut, for the log). `text` is the normalised
 * page (fetchPage). The header carries the page title and host only, so
 * `heading` is kept for display but the plain-text windows have none.
 */
export function chunkSource(page: {
  docKey: string;
  url: string;
  title: string;
  contentType: string;
  text: string;
}): { chunks: MentorChunkDraft[]; dropped: number } {
  const pieces: Piece[] = isFlat(page.contentType)
    ? textWindows(page.text).map((text) => ({ heading: null, text }))
    : markdownPieces(page.text);
  const header = sourceHeader(page.title, page.url);
  const all = toDrafts('source', page.docKey, page.title, pieces, () => header);
  return {
    chunks: all.slice(0, MENTOR_SOURCE_MAX_CHUNKS),
    dropped: Math.max(0, all.length - MENTOR_SOURCE_MAX_CHUNKS),
  };
}
