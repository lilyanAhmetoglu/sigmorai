import { describe, expect, test } from 'bun:test';
import { DOCS_WATCH_USER_AGENT } from '@/lib/constants';
import { pageFetch } from './docs-watch';
import { fetchPage, fetchPageWithFallback, PageNotFound, type FetchFn } from './fetch-page';

/** A fake fetch: url → [status, content-type, body]. Records every call. */
function fakeFetch(pages: Record<string, [number, string, string]>) {
  const calls: { url: string; init?: RequestInit }[] = [];
  const fn: FetchFn = async (url, init) => {
    calls.push({ url, init });
    const page = pages[url];
    if (!page) throw new TypeError('fetch failed');
    const [status, type, body] = page;
    return new Response(body, { status, headers: { 'content-type': type } });
  };
  return { fn, calls };
}

describe('fetchPage', () => {
  test('sends the docs-watch user agent and returns the bare media type + normalised text', async () => {
    const { fn, calls } = fakeFetch({
      'https://a.dev/x': [200, 'text/html; charset=utf-8', '<p>Hello <b>world</b></p>'],
    });
    const page = await fetchPage('https://a.dev/x', fn);
    expect(page).toEqual({ contentType: 'text/html', text: 'Hello world' });
    expect(new Headers(calls[0].init?.headers).get('user-agent')).toBe(DOCS_WATCH_USER_AGENT);
  });

  test('a 404 is PageNotFound; another error status is a plain Error', async () => {
    const { fn } = fakeFetch({
      'https://a.dev/gone': [404, 'text/plain', ''],
      'https://a.dev/down': [503, 'text/plain', ''],
    });
    await expect(fetchPage('https://a.dev/gone', fn)).rejects.toBeInstanceOf(PageNotFound);
    await expect(fetchPage('https://a.dev/down', fn)).rejects.toThrow('HTTP 503');
  });
});

describe('fetchPageWithFallback (the docs-watch rules)', () => {
  test('the .md copy is used when it works; the fallback is not fetched', async () => {
    const { fn, calls } = fakeFetch({
      'https://a.dev/x.md': [200, 'text/markdown', '# X\r\nbody\n'],
    });
    const page = await fetchPageWithFallback(
      { fetchUrl: 'https://a.dev/x.md', fallbackUrl: 'https://a.dev/x' },
      fn,
    );
    expect(page.text).toBe('# X\nbody');
    expect(calls.map((c) => c.url)).toEqual(['https://a.dev/x.md']);
  });

  test('a 404 on the first URL tries the fallback', async () => {
    const { fn } = fakeFetch({
      'https://a.dev/x.md': [404, 'text/plain', ''],
      'https://a.dev/x': [200, 'text/plain', 'from the page'],
    });
    const page = await fetchPageWithFallback(
      { fetchUrl: 'https://a.dev/x.md', fallbackUrl: 'https://a.dev/x' },
      fn,
    );
    expect(page.text).toBe('from the page');
  });

  test('an empty first page tries the fallback', async () => {
    const { fn } = fakeFetch({
      'https://a.dev/feed': [200, 'application/atom+xml', '<feed></feed>'],
      'https://a.dev/readme': [200, 'text/plain', 'readme'],
    });
    const page = await fetchPageWithFallback(
      { fetchUrl: 'https://a.dev/feed', fallbackUrl: 'https://a.dev/readme' },
      fn,
    );
    expect(page.text).toBe('readme');
  });

  test('a 500 on the first URL does NOT try the fallback', async () => {
    const { fn, calls } = fakeFetch({
      'https://a.dev/x.md': [500, 'text/plain', ''],
      'https://a.dev/x': [200, 'text/plain', 'ok'],
    });
    await expect(
      fetchPageWithFallback({ fetchUrl: 'https://a.dev/x.md', fallbackUrl: 'https://a.dev/x' }, fn),
    ).rejects.toThrow('HTTP 500');
    expect(calls).toHaveLength(1);
  });

  test('a 404 with no fallback throws; an empty page with no fallback throws', async () => {
    const { fn } = fakeFetch({
      'https://a.dev/gone': [404, 'text/plain', ''],
      'https://a.dev/empty': [200, 'text/plain', '   '],
    });
    await expect(fetchPageWithFallback({ fetchUrl: 'https://a.dev/gone' }, fn)).rejects.toThrow(
      'HTTP 404',
    );
    await expect(fetchPageWithFallback({ fetchUrl: 'https://a.dev/empty' }, fn)).rejects.toThrow(
      'empty page after normalising',
    );
  });
});

describe('pageFetch', () => {
  test('a Markdown host gets its .md copy with the page as fallback; other hosts fetch the page', () => {
    expect(pageFetch('https://platform.claude.com/docs/en/x')).toEqual({
      fetchUrl: 'https://platform.claude.com/docs/en/x.md',
      fallbackUrl: 'https://platform.claude.com/docs/en/x',
    });
    expect(pageFetch('https://example.com/page')).toEqual({ fetchUrl: 'https://example.com/page' });
  });
});
