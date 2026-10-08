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
 * 2026-10-08). `enabled` true is the layout's own yes: the (app) layout's
 * server auth(), the (auth) group. Otherwise (a public page, or an (app)
 * layout whose server render saw no session) it opens on `hint`: the
 * `__client_uat` cookie read after hydration (useSessionHint), so the
 * server HTML and the first client render match. The (app) case matters
 * because Next keeps a layout on client navigation: a player who signed in
 * in another tab still gets Clerk on /profile. A visitor gets no Clerk.
 */
export const decideClerk = (enabled: boolean | undefined, hint: boolean): boolean =>
  enabled === true || hint;
