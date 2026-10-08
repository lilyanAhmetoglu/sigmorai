/**
 * Clerk's `__client_uat` cookie (not HttpOnly; `__client_uat_<suffix>` on
 * newer instances) holds the last sign-in time in seconds, or 0 when signed
 * out. A value above 0 means a player is probably signed in. Only a hint for
 * what to show while Clerk loads; never an auth check.
 */
const CLIENT_UAT = /(?:^|;\s*)__client_uat(?:_[\w-]+)?=([1-9]\d*)(?:;|$)/;

export const hasClerkSessionHint = (cookie: string): boolean => CLIENT_UAT.test(cookie);

/**
 * Whether a ClerkGate mounts ClerkProvider (curriculum plan, amendments
 * 2026-10-08). `enabled` true or false is the layout's own answer: the (app)
 * layout's server auth(), the (auth) group. Undefined means a public page:
 * mount only after hydration (so the server HTML and the first client render
 * match) and only when the cookie says a player is likely. A visitor gets no
 * Clerk at all.
 */
export const decideClerk = (
  enabled: boolean | undefined,
  hydrated: boolean,
  cookie: string,
): boolean => enabled ?? (hydrated && hasClerkSessionHint(cookie));
