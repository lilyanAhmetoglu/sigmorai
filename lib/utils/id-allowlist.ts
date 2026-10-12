/**
 * An env list of ids ("user_a, user_b") as a set. Each part is trimmed and
 * empty parts are dropped; case is kept (Clerk ids are case-sensitive).
 * Unset or blank gives an empty set. Pure.
 */
export function parseIdAllowlist(raw: string | undefined): ReadonlySet<string> {
  if (!raw) return new Set();
  return new Set(
    raw
      .split(',')
      .map((part) => part.trim())
      .filter((part) => part.length > 0),
  );
}
