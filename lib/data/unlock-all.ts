import 'server-only';
import { currentUser } from '@clerk/nextjs/server';
import { cache } from 'react';
import { UNLOCK_ALL_EMAILS_ENV } from '@/lib/constants';
import { isOnEmailAllowlist, parseEmailAllowlist } from '@/lib/utils';

/**
 * A tester sees every realm and chapter open: no tier lock, no chapter or
 * floor order. True only when the session user's PRIMARY email is VERIFIED
 * and on the UNLOCK_ALL_EMAILS list (server-only env). No DB change, no fake
 * progress, no XP: the tester still earns XP the normal way.
 *
 * Pass only the id from auth(). An unset or empty list returns false with no
 * Clerk call. A Clerk error returns false (the normal locks apply). Cached
 * per request: one Clerk call at most.
 */
export const isUnlockAll = cache(async (userId: string): Promise<boolean> => {
  const allowlist = parseEmailAllowlist(process.env[UNLOCK_ALL_EMAILS_ENV]);
  if (allowlist.size === 0) return false;
  let user: Awaited<ReturnType<typeof currentUser>>;
  try {
    user = await currentUser();
  } catch (err) {
    console.error('[isUnlockAll] currentUser', err instanceof Error ? err.name : typeof err);
    return false;
  }
  // currentUser() reads the same session as auth(); the id check is a guard.
  if (!user || user.id !== userId) return false;
  const primary = user.primaryEmailAddress;
  if (!primary || primary.verification?.status !== 'verified') return false;
  return isOnEmailAllowlist(allowlist, primary.emailAddress);
});
