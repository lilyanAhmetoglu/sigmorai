/**
 * Clerk's `__client_uat` cookie (not HttpOnly; `__client_uat_<suffix>` on
 * newer instances) holds the last sign-in time in seconds, or 0 when signed
 * out. A value above 0 means a player is probably signed in. Only a hint for
 * what to show while Clerk loads; never an auth check.
 */
const CLIENT_UAT = /(?:^|;\s*)__client_uat(?:_[\w-]+)?=([1-9]\d*)(?:;|$)/;

export const hasClerkSessionHint = (cookie: string): boolean => CLIENT_UAT.test(cookie);
