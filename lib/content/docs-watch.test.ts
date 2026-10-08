import { describe, expect, test } from 'bun:test';
import { CONTENT_DIR } from '@/lib/constants';
import type { DocsWatchState, DocsWatchTarget, KbSource } from '@/lib/types';
import {
  citedPages,
  EMPTY_DOCS_WATCH_STATE,
  feedEntries,
  fetchTargets,
  htmlText,
  markdownUrl,
  nextState,
  normalise,
  renderIssue,
  sha256,
} from './docs-watch';

const FIXTURES = `${import.meta.dir}/__fixtures__/docs-watch`;

const source = (id: string, kind: KbSource['kind'], url: string): KbSource => ({
  id,
  kind,
  title: id,
  url,
  owner: 'x',
  trustTier: 'official',
  enabled: true,
  fetchConfig: {},
});

const SOURCES: KbSource[] = [
  source('claude-docs', 'docs', 'https://platform.claude.com/docs'),
  source(
    'claude-release-notes',
    'changelog',
    'https://platform.claude.com/docs/en/release-notes/overview',
  ),
  source('anthropic-engineering', 'blog', 'https://www.anthropic.com/engineering'),
  source('mcp-spec', 'docs', 'https://modelcontextprotocol.io/specification'),
  source('gemini-docs', 'docs', 'https://ai.google.dev/gemini-api/docs'),
  source('mcp-servers', 'repo', 'https://github.com/modelcontextprotocol/servers'),
  source('elevenlabs-docs', 'docs', 'https://elevenlabs.io/docs'),
  source('elevenlabs-use-policy', 'docs', 'https://elevenlabs.io/use-policy'),
  source('storybook-docs', 'docs', 'https://storybook.js.org'),
];

describe('citedPages', () => {
  test('track + Frontier lessons, keyed by urlKey, each lesson once', async () => {
    const cited = await citedPages(FIXTURES, CONTENT_DIR);
    expect(Object.fromEntries(cited)).toEqual({
      'platform.claude.com/docs/en/prompting': [
        'builder/r0/c1/lesson',
        'frontier/2026-10-05-new-thing/lesson',
      ],
      'anthropic.com/engineering/a-post': ['builder/r0/c1/lesson'],
    });
  });

  test('no frontier folder is fine', async () => {
    const cited = await citedPages(`${import.meta.dir}/__fixtures__/valid`, CONTENT_DIR);
    expect([...cited.keys()]).toEqual(['platform.claude.com/docs']);
  });
});

describe('markdownUrl', () => {
  test('adds .md on hosts that serve Markdown, dropping query and trailing slash', () => {
    expect(markdownUrl('https://platform.claude.com/docs/en/x/?a=1#b')).toBe(
      'https://platform.claude.com/docs/en/x.md',
    );
    expect(markdownUrl('https://developers.openai.com/api/docs/guides/x')).toBe(
      'https://developers.openai.com/api/docs/guides/x.md',
    );
    expect(markdownUrl('https://code.claude.com/docs/en/hooks.md')).toBe(
      'https://code.claude.com/docs/en/hooks.md',
    );
    expect(
      markdownUrl('https://developer.ideogram.ai/api-reference/images/generate/ideogram-4-5'),
    ).toBe('https://developer.ideogram.ai/api-reference/images/generate/ideogram-4-5.md');
    expect(markdownUrl('https://elevenlabs.io/docs/overview/capabilities/text-to-dialogue')).toBe(
      'https://elevenlabs.io/docs/overview/capabilities/text-to-dialogue.md',
    );
  });

  test('a host with a path prefix covers only that path (elevenlabs.io/docs)', () => {
    expect(markdownUrl('https://elevenlabs.io/use-policy')).toBe(
      'https://elevenlabs.io/use-policy',
    );
    expect(markdownUrl('https://elevenlabs.io/docsx/a')).toBe('https://elevenlabs.io/docsx/a');
  });

  test('a /docs prefix key covers only the docs pages of its host (storybook.js.org/docs)', () => {
    expect(markdownUrl('https://storybook.js.org/docs/ai/manifests')).toBe(
      'https://storybook.js.org/docs/ai/manifests.md',
    );
    expect(markdownUrl('https://ui.shadcn.com/docs/mcp')).toBe('https://ui.shadcn.com/docs/mcp.md');
    expect(markdownUrl('https://storybook.js.org/blog/a-post')).toBe(
      'https://storybook.js.org/blog/a-post',
    );
  });

  test('ai.google.dev uses its own suffix, .md.txt', () => {
    expect(markdownUrl('https://ai.google.dev/gemini-api/docs/prompting/')).toBe(
      'https://ai.google.dev/gemini-api/docs/prompting.md.txt',
    );
  });

  test('other hosts are unchanged', () => {
    const url = 'https://www.anthropic.com/engineering/x';
    expect(markdownUrl(url)).toBe(url);
  });
});

describe('fetchTargets', () => {
  const cited = new Map([
    ['platform.claude.com/docs/en/prompting', ['b/lesson', 'a/lesson']],
    ['anthropic.com/engineering/a-post', ['a/lesson']],
  ]);
  const targets = fetchTargets(SOURCES, cited);
  const byUrl = (url: string) => targets.find((t) => t.url === url);

  test('a cited page: .md variant, the page as fallback, longest source match, sorted lessons', () => {
    expect(byUrl('https://platform.claude.com/docs/en/prompting')).toEqual({
      url: 'https://platform.claude.com/docs/en/prompting',
      fetchUrl: 'https://platform.claude.com/docs/en/prompting.md',
      fallbackUrl: 'https://platform.claude.com/docs/en/prompting',
      sourceId: 'claude-docs',
      lessons: ['a/lesson', 'b/lesson'],
    });
    expect(byUrl('https://anthropic.com/engineering/a-post')?.sourceId).toBe(
      'anthropic-engineering',
    );
  });

  test('one index per source', () => {
    expect(byUrl('https://platform.claude.com/docs/llms.txt')?.sourceId).toBe('claude-docs');
    expect(byUrl('https://platform.claude.com/docs/en/release-notes/overview')?.fetchUrl).toBe(
      'https://platform.claude.com/docs/en/release-notes/overview.md',
    );
    expect(byUrl('https://www.anthropic.com/engineering')?.fetchUrl).toBe(
      'https://www.anthropic.com/engineering',
    );
    expect(byUrl('https://modelcontextprotocol.io/specification')?.fetchUrl).toBe(
      'https://modelcontextprotocol.io/specification.md',
    );
    expect(byUrl('https://ai.google.dev/gemini-api/docs')?.fetchUrl).toBe(
      'https://ai.google.dev/gemini-api/docs.md.txt',
    );
    expect(byUrl('https://github.com/modelcontextprotocol/servers/releases.atom')).toEqual({
      url: 'https://github.com/modelcontextprotocol/servers/releases.atom',
      fetchUrl: 'https://github.com/modelcontextprotocol/servers/releases.atom',
      fallbackUrl: 'https://raw.githubusercontent.com/modelcontextprotocol/servers/HEAD/README.md',
      sourceId: 'mcp-servers',
      lessons: [],
    });
    // A path-prefix key (elevenlabs.io/docs) gets llms.txt; the same host outside it stays HTML.
    expect(byUrl('https://elevenlabs.io/docs/llms.txt')?.sourceId).toBe('elevenlabs-docs');
    expect(byUrl('https://elevenlabs.io/use-policy')?.fetchUrl).toBe(
      'https://elevenlabs.io/use-policy',
    );
    // A host-root source (storybook.js.org) reads the site's llms.txt, not /docs/llms.txt.
    expect(byUrl('https://storybook.js.org/llms.txt')?.sourceId).toBe('storybook-docs');
    expect(targets).toHaveLength(2 + SOURCES.length);
  });

  test('a disabled source has no index; a page outside every source is "unlisted"', () => {
    const off = SOURCES.map((s) => (s.id === 'mcp-servers' ? { ...s, enabled: false } : s));
    const t = fetchTargets(off, new Map([['example.org/x', ['a/lesson']]]));
    expect(t.some((x) => x.sourceId === 'mcp-servers')).toBe(false);
    expect(t.find((x) => x.url === 'https://example.org/x')?.sourceId).toBe('unlisted');
  });

  test('a URL is fetched once, compared by urlKey', () => {
    const urls = targets.map((t) => t.url);
    expect(new Set(urls).size).toBe(urls.length);
    // The cited page wins over the same index URL with www. and a slash.
    const t = fetchTargets(SOURCES, new Map([['anthropic.com/engineering', ['a/lesson']]]));
    const eng = t.filter((x) => x.sourceId === 'anthropic-engineering');
    expect(eng).toHaveLength(1);
    expect(eng[0].lessons).toEqual(['a/lesson']);
  });
});

describe('normalise', () => {
  test('Markdown and plain text: trimmed, CRLF folded', () => {
    expect(normalise('text/markdown; charset=utf-8', '\n# Hi\r\nthere  \n')).toBe('# Hi\nthere');
    expect(normalise('text/plain', ' a ')).toBe('a');
  });

  test('HTML: the article text only, no tags, scripts or extra space', () => {
    const html = `<html><head><title>T</title><script>var x=1</script></head><body>
      <nav>Menu</nav><main><article class="a"><h1>Title</h1>
      <p>It&#x27;s  <b>bold</b> &amp; <!-- note -->fine.</p><style>p{}</style></article></main>
      <footer>Build 123</footer></body></html>`;
    expect(normalise('text/html; charset=utf-8', html)).toBe("Title It's bold & fine.");
  });

  test('HTML without an article falls back to main, then the whole page', () => {
    expect(htmlText('<nav>x</nav><main><p>Body</p></main>')).toBe('Body');
    expect(htmlText('<p>Only</p>')).toBe('Only');
  });

  test('nested articles stay whole', () => {
    expect(htmlText('<article>A <article>B</article> C</article>')).toBe('A B C');
  });

  test('a feed: entry ids and update times only', () => {
    const xml = `<feed><updated>2026-10-06T00:00:00Z</updated>
      <entry><id>tag:r/1</id><updated>2026-10-01T00:00:00Z</updated><title>v1</title></entry>
      <entry><id>tag:r/2</id><updated>2026-10-02T00:00:00Z</updated></entry></feed>`;
    expect(normalise('application/atom+xml; charset=utf-8', xml)).toBe(
      'tag:r/1 2026-10-01T00:00:00Z\ntag:r/2 2026-10-02T00:00:00Z',
    );
    expect(feedEntries('<feed><title>No releases</title></feed>')).toBe('');
  });

  test('sha256 is hex and stable', () => {
    expect(sha256('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  });
});

describe('nextState', () => {
  const T0 = '2026-10-05T06:17:00.000Z';
  const T1 = '2026-10-06T06:17:00.000Z';
  const page: DocsWatchTarget = {
    url: 'https://platform.claude.com/docs/en/x',
    fetchUrl: 'https://platform.claude.com/docs/en/x.md',
    sourceId: 'claude-docs',
    lessons: ['builder/r0/c1/lesson'],
  };
  const ok = (hash: string) => ({ target: page, ok: true as const, hash });
  const H1 = 'a'.repeat(64);
  const H2 = 'b'.repeat(64);

  test('first run records hashes and reports nothing', () => {
    const { state, changed } = nextState(EMPTY_DOCS_WATCH_STATE, [ok(H1)], T0, false);
    expect(changed).toEqual([]);
    expect(state.pages[page.url]).toEqual({ hash: H1, checkedAt: T0, changedAt: T0 });
    expect(state.pending).toEqual([]);
  });

  const first = nextState(EMPTY_DOCS_WATCH_STATE, [ok(H1)], T0, false).state;

  test('same hash: only checkedAt moves', () => {
    const { state, changed } = nextState(first, [ok(H1)], T1, false);
    expect(changed).toEqual([]);
    expect(state.pages[page.url]).toEqual({ hash: H1, checkedAt: T1, changedAt: T0 });
  });

  test('a new hash is a pending change with its lessons', () => {
    const { state, changed } = nextState(first, [ok(H2)], T1, false);
    const row = { url: page.url, sourceId: 'claude-docs', changedAt: T1, lessons: page.lessons };
    expect(changed).toEqual([row]);
    expect(state.pending).toEqual([row]);
    expect(state.pages[page.url]).toEqual({ hash: H2, checkedAt: T1, changedAt: T1 });
  });

  test('an error keeps the stored hash and reports nothing', () => {
    const error = { target: page, ok: false as const, error: 'HTTP 500' };
    const { state, changed } = nextState(first, [error], T1, false);
    expect(changed).toEqual([]);
    expect(state.pages[page.url]).toEqual(first.pages[page.url]);
    expect(nextState(EMPTY_DOCS_WATCH_STATE, [error], T1, false).state.pages).toEqual({});
  });

  test('pending keeps one row per URL and survives runs until the issue closes', () => {
    const withIssue: DocsWatchState = { ...nextState(first, [ok(H2)], T1, false).state, issue: 7 };
    const later = '2026-10-07T06:17:00.000Z';
    const again = nextState(withIssue, [ok(H1)], later, false).state;
    expect(again.pending).toHaveLength(1);
    expect(again.pending[0].changedAt).toBe(later);
    expect(again.issue).toBe(7);
    expect(nextState(withIssue, [ok(H2)], later, false).state.pending).toHaveLength(1);

    const closed = nextState(withIssue, [ok(H2)], later, true).state;
    expect(closed.pending).toEqual([]);
    expect(closed.issue).toBeNull();
  });

  test('pages no target points at are dropped', () => {
    const old = {
      ...first,
      pages: { ...first.pages, 'https://gone.example/x': first.pages[page.url] },
    };
    expect(Object.keys(nextState(old, [ok(H1)], T1, false).state.pages)).toEqual([page.url]);
  });
});

const PIPE_ROW = {
  url: 'https://a.example/x|y',
  sourceId: 's',
  changedAt: '2026-10-06T06:17:00.000Z',
  lessons: [],
};

describe('renderIssue', () => {
  const body = renderIssue([
    {
      url: 'https://b.example/x',
      sourceId: 'openai-docs',
      changedAt: '2026-10-06T06:17:00.000Z',
      lessons: [],
    },
    {
      url: 'https://a.example/y',
      sourceId: 'claude-docs',
      changedAt: '2026-10-05T06:17:00.000Z',
      lessons: ['builder/r0/c1/lesson', 'strategist/r0/c2/lesson'],
    },
  ]);

  test('one row per page, oldest first, with source, date and lesson ids', () => {
    const rows = body.split('\n').filter((l) => l.startsWith('| https://'));
    expect(rows).toEqual([
      '| https://a.example/y | `claude-docs` | 2026-10-05 | `builder/r0/c1/lesson`, `strategist/r0/c2/lesson` |',
      '| https://b.example/x | `openai-docs` | 2026-10-06 | — |',
    ]);
    expect(body).toContain('**2**');
    const pipe = renderIssue([{ ...PIPE_ROW }]);
    expect(pipe).toContain('| https://a.example/x%7Cy |');
    expect(body).toContain('Close this issue');
  });
});
