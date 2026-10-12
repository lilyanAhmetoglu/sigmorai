/**
 * An env list of emails ("a@x.com, B@y.com") as a set of trimmed, lower-case
 * addresses. Empty parts are dropped; unset or blank gives an empty set. Pure.
 */
export function parseEmailAllowlist(raw: string | undefined): ReadonlySet<string> {
  if (!raw) return new Set();
  return new Set(
    raw
      .split(',')
      .map((part) => part.trim().toLowerCase())
      .filter((part) => part.length > 0),
  );
}

/** `email` is on the list, ignoring case and outer spaces. Pure. */
export const isOnEmailAllowlist = (allowlist: ReadonlySet<string>, email: string): boolean =>
  allowlist.has(email.trim().toLowerCase());
