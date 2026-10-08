import { describe, expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import {
  MENTOR_CHARS_PER_TOKEN,
  MENTOR_CHUNK_MAX_TOKENS,
  MENTOR_CHUNK_TARGET_TOKENS,
  MENTOR_EMBED_DIM,
  MENTOR_EMBED_MODEL,
  MENTOR_SOURCE_MAX_CHUNKS,
} from '@/lib/constants';
import {
  chunkHash,
  chunkLesson,
  chunkSource,
  estimateTokens,
  lessonText,
  markdownPieces,
  textWindows,
} from './chunk';

/** A paragraph of about `tokens` estimated tokens. */
const words = (tokens: number, word = 'alpha') =>
  Array.from(
    { length: Math.ceil((tokens * MENTOR_CHARS_PER_TOKEN) / (word.length + 1)) },
    () => word,
  )
    .join(' ')
    .slice(0, tokens * MENTOR_CHARS_PER_TOKEN);

const section = (heading: string, tokens: number, word?: string) =>
  `## ${heading}\n\n${words(tokens, word)}\n`;

describe('lessonText', () => {
  test('drops frontmatter and both DialogBox forms', () => {
    const raw = [
      '---',
      'id: builder/r0/c1/lesson',
      'title: T',
      '---',
      'Intro.',
      '<DialogBox npc="oracle">The Hallucinant stirs.</DialogBox>',
      '<DialogBox npc="oracle" line="Latentia" />',
      '## A',
      'Body.',
    ].join('\n');
    const text = lessonText(raw);
    expect(text).not.toContain('id: builder');
    expect(text).not.toContain('Hallucinant');
    expect(text).not.toContain('Latentia');
    expect(text).not.toContain('DialogBox');
    expect(text).toContain('Intro.');
    expect(text).toContain('## A');
  });

  test('a multi-line DialogBox is removed whole', () => {
    expect(lessonText('a\n<DialogBox npc="x">\nline one\n\nline two\n</DialogBox>\nb')).toBe(
      'a\n\nb',
    );
  });
});

describe('markdownPieces', () => {
  test('one piece per ## section, ### children stay inside', () => {
    const md = `${section('One', 100)}\n### Child\n\n${words(90)}\n\n${section('Two', 100)}`;
    const pieces = markdownPieces(md);
    expect(pieces.map((p) => p.heading)).toEqual(['One', 'Two']);
    expect(pieces[0].text).toContain('### Child');
    expect(pieces[0].text).not.toContain('## One');
  });

  test('a ## inside a code fence is not a split', () => {
    const md = `${section('One', 100)}\n\`\`\`md\n## not a heading\n\`\`\`\n`;
    const pieces = markdownPieces(md);
    expect(pieces).toHaveLength(1);
    expect(pieces[0].text).toContain('## not a heading');
  });

  test('a small section joins the next one; a small last one joins the one before', () => {
    const md = section('Tiny', 10) + section('Big', 200) + section('Big2', 200) + section('End', 5);
    const pieces = markdownPieces(md);
    expect(pieces.map((p) => p.heading)).toEqual(['Tiny', 'Big2']);
    expect(pieces[0].text).toContain('## Big');
    expect(pieces[1].text).toContain('## End');
  });

  test('a section over the max splits at paragraph breaks, each piece within the max', () => {
    const paras = Array.from({ length: 12 }, () => words(150)).join('\n\n');
    const pieces = markdownPieces(`## Long\n\n${paras}\n`);
    expect(pieces.length).toBeGreaterThan(1);
    for (const p of pieces) {
      expect(p.heading).toBe('Long');
      expect(estimateTokens(p.text)).toBeLessThanOrEqual(MENTOR_CHUNK_MAX_TOKENS);
    }
  });
});

describe('chunkLesson', () => {
  const lesson = {
    id: 'builder/r0/c1/lesson',
    title: 'Tokens',
    body: section('What a token is', 120) + section('Why tokens matter', 120, 'beta'),
  };

  test('header is "Lesson: <title> › <heading>" with no path, realm or id', () => {
    const chunks = chunkLesson(lesson);
    expect(chunks.map((c) => c.embedText.split('\n')[0])).toEqual([
      'Lesson: Tokens › What a token is',
      'Lesson: Tokens › Why tokens matter',
    ]);
    for (const c of chunks) {
      const header = c.embedText.split('\n')[0];
      for (const bad of ['builder', 'r0', 'c1', '/', 'realm', 'Bootstrap']) {
        expect(header).not.toContain(bad);
      }
      expect(c.embedText).toBe(`${header}\n${c.body}`);
      expect(c.kind).toBe('lesson');
      expect(c.docKey).toBe(lesson.id);
    }
    expect(chunks.map((c) => c.ord)).toEqual([0, 1]);
  });

  test('a shared chapter hashes the same on every path', () => {
    const a = chunkLesson(lesson).map((c) => c.contentHash);
    const b = chunkLesson({ ...lesson, id: 'strategist/r0/c1/lesson' }).map((c) => c.contentHash);
    expect(b).toEqual(a);
  });

  test('a repeated chunk inside one document is kept once (first wins), ord stays dense', () => {
    const body = section('Same', 120) + section('Other', 120, 'beta') + section('Same', 120);
    const chunks = chunkLesson({ ...lesson, body });
    expect(chunks.map((c) => c.heading)).toEqual(['Same', 'Other']);
    expect(chunks.map((c) => c.ord)).toEqual([0, 1]);
  });
});

describe('chunkHash', () => {
  test('is sha256 over model:dim, header and text, and stable', () => {
    const expected = createHash('sha256')
      .update(`${MENTOR_EMBED_MODEL}:${MENTOR_EMBED_DIM}\nLesson: T › H\nbody`)
      .digest('hex');
    expect(chunkHash('Lesson: T › H', 'body')).toBe(expected);
    expect(chunkHash('Lesson: T › H', 'body')).toBe(chunkHash('Lesson: T › H', 'body'));
  });

  test('changes when the header or the text changes', () => {
    const base = chunkHash('Lesson: T › H', 'body');
    expect(chunkHash('Lesson: T › H2', 'body')).not.toBe(base);
    expect(chunkHash('Lesson: T › H', 'body!')).not.toBe(base);
  });
});

describe('chunkSource', () => {
  const page = {
    docKey: 'platform.claude.com/docs/en/x',
    url: 'https://www.Platform.claude.com/docs/en/x',
    title: 'X docs',
  };

  test('Markdown chunks by heading, header is "Source: <title> — <host>"', () => {
    const { chunks, dropped } = chunkSource({
      ...page,
      contentType: 'text/markdown',
      text: `# X\n\n${section('A', 120)}${section('B', 120, 'beta')}`,
    });
    expect(dropped).toBe(0);
    expect(chunks.map((c) => c.heading)).toEqual(['A', 'B']);
    for (const c of chunks) {
      expect(c.embedText.split('\n')[0]).toBe('Source: X docs — platform.claude.com');
      expect(c.kind).toBe('source');
    }
  });

  test('HTML text is cut into overlapping windows', () => {
    const text = Array.from({ length: 600 }, (_, i) => `w${i}`).join(' ');
    const { chunks } = chunkSource({ ...page, contentType: 'text/html', text });
    expect(chunks.length).toBeGreaterThan(1);
    for (const c of chunks) expect(c.heading).toBeNull();
    // Overlap: the next window starts before the previous one ends.
    const firstEnd = chunks[0].body.split(' ').at(-1)!;
    expect(chunks[1].body.split(' ')).toContain(firstEnd);
  });

  test('a huge page keeps only the first MENTOR_SOURCE_MAX_CHUNKS chunks', () => {
    const text = Array.from({ length: 30_000 }, (_, i) => `w${i}`).join(' ');
    const { chunks, dropped } = chunkSource({ ...page, contentType: 'text/html', text });
    expect(chunks).toHaveLength(MENTOR_SOURCE_MAX_CHUNKS);
    expect(dropped).toBeGreaterThan(0);
    expect(chunks.at(-1)!.ord).toBe(MENTOR_SOURCE_MAX_CHUNKS - 1);
  });
});

describe('textWindows', () => {
  test('covers the whole text, each window at most the target size', () => {
    const text = Array.from({ length: 2_000 }, (_, i) => `w${i}`).join(' ');
    const windows = textWindows(text);
    for (const w of windows) {
      expect(w.length).toBeLessThanOrEqual(MENTOR_CHUNK_TARGET_TOKENS * MENTOR_CHARS_PER_TOKEN);
    }
    expect(windows[0].startsWith('w0 ')).toBe(true);
    expect(windows.at(-1)!.endsWith('w1999')).toBe(true);
  });

  test('short text is one window', () => {
    expect(textWindows('a b c')).toEqual(['a b c']);
  });
});
