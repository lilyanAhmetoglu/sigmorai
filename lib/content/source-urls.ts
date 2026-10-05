/**
 * Is a cited URL under an official entry of content/sources.yaml? Pure: no IO.
 * Compared on a normalised key: host lowercased, a leading `www.` dropped,
 * query, hash and trailing slash ignored. Only https counts.
 */

/** `https://www.Anthropic.com/engineering/x/?a=1#b` → `anthropic.com/engineering/x`. Null when not https. */
export function urlKey(url: string): string | null {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  if (u.protocol !== 'https:') return null;
  const host = u.hostname.toLowerCase().replace(/^www\./, '');
  return `${host}${u.pathname.replace(/\/+$/, '')}`;
}

/** True when `url` is a base itself or a page below one (path-segment boundary). */
export function isUnderBase(url: string, bases: readonly string[]): boolean {
  const key = urlKey(url);
  if (!key) return false;
  return bases.some((base) => {
    const b = urlKey(base);
    return b !== null && (key === b || key.startsWith(`${b}/`));
  });
}
