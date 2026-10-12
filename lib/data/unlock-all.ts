import 'server-only';
import { parseIdAllowlist } from '@/lib/utils';

/**
 * A tester sees every realm and chapter open: no tier lock, no chapter or
 * floor order. True only when the session user's Clerk id is on the
 * UNLOCK_ALL_USER_IDS list (server-only env). No network call, no DB change,
 * no fake progress, no XP: the tester still earns XP the normal way.
 * Pass only the id from auth(), never one from the request.
 */
export function isUnlockAll(userId: string): boolean {
  return parseIdAllowlist(process.env.UNLOCK_ALL_USER_IDS).has(userId);
}
