/**
 * Fetch one official page as normalised text. Shared by docs-watch
 * (scripts/docs-watch.ts hashes it) and the mentor index (lib/mentor chunks
 * it). `fetchFn` is a test seam: tests never touch the network.
 */
import { DOCS_WATCH_TIMEOUT_MS, DOCS_WATCH_USER_AGENT } from '@/lib/constants';
import { normalise } from './docs-watch';

export type FetchFn = (input: string, init?: RequestInit) => Promise<Response>;

/** HTTP 404: the URL is gone, so a fallback URL may be tried. */
export class PageNotFound extends Error {}

/** A fetched page: its media type (no parameters, lower case) and its normalised text. */
export type FetchedPage = { contentType: string; text: string };

/** One URL → normalised text, or throws with a short reason. */
export async function fetchPage(url: string, fetchFn: FetchFn = fetch): Promise<FetchedPage> {
  const res = await fetchFn(url, {
    headers: { 'user-agent': DOCS_WATCH_USER_AGENT },
    redirect: 'follow',
    signal: AbortSignal.timeout(DOCS_WATCH_TIMEOUT_MS),
  });
  if (res.status === 404) throw new PageNotFound('HTTP 404');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const header = res.headers.get('content-type') ?? '';
  return {
    contentType: header.split(';')[0].trim().toLowerCase(),
    text: normalise(header, await res.text()),
  };
}

/**
 * `fetchUrl`, then `fallbackUrl` when the first is a 404 or normalises to
 * nothing (a moved page's `.md`, a repo with no releases). Throws when both
 * fail or the page is empty.
 */
export async function fetchPageWithFallback(
  target: { fetchUrl: string; fallbackUrl?: string },
  fetchFn: FetchFn = fetch,
): Promise<FetchedPage> {
  const empty: FetchedPage = { contentType: '', text: '' };
  let page = await fetchPage(target.fetchUrl, fetchFn).catch((err: unknown) => {
    if (err instanceof PageNotFound && target.fallbackUrl) return empty;
    throw err;
  });
  if (page.text === '' && target.fallbackUrl) page = await fetchPage(target.fallbackUrl, fetchFn);
  if (page.text === '') throw new Error('empty page after normalising');
  return page;
}
