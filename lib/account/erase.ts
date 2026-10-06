import 'server-only';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema';

/**
 * Erase one player: a single delete of the users row. Every user-owned table
 * (progress, submissions, xp_events) cascades from it (db/CLAUDE.md invariant 2).
 * Idempotent: a second call deletes 0 rows. Returns how many rows went.
 *
 * Not a 'use server' file on purpose: every export there is a public endpoint.
 * Callers pass a trusted id only (auth() or a verified Clerk webhook).
 */
export async function eraseUser(userId: string): Promise<number> {
  const deleted = await db.delete(users).where(eq(users.id, userId)).returning({ id: users.id });
  return deleted.length;
}
