import 'server-only';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema';

/**
 * Whether this request has a signed-in Clerk user. auth() reads the headers
 * the proxy set: no DB, no network. The (app) layout uses it to mount Clerk
 * only for a player (ClerkGate).
 */
export async function hasSession(): Promise<boolean> {
  const { userId } = await auth();
  return Boolean(userId);
}

/**
 * Whether this Clerk user has a users row (picked a track). Pass only the id
 * from auth(), never one from the request.
 */
export async function isOnboarded(userId: string): Promise<boolean> {
  const [row] = await db.select({ id: users.id }).from(users).where(eq(users.id, userId)).limit(1);
  return Boolean(row);
}
