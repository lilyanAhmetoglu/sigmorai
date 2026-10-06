import 'server-only';
import { eq, sql } from 'drizzle-orm';
import type { Tx } from '@/db';
import { progress, users, xpEvents } from '@/db/schema';
import { XP_REWARDS } from '@/lib/constants';
import type { XpOutcome, XpReason } from '@/lib/types';
import { nextStreak } from '@/lib/xp/streak';
import { xpOutcome } from './case';

/**
 * The writes of a pass, shared by every quest action (case, boss, lesson and,
 * in Phase C, quick check). Runs inside the caller's transaction:
 *   progress row (once) → xp_events row (award once) → users.xp += amount
 *   only if that row was new → streak + last_active_at (any pass, replays too).
 */
export async function recordClear(
  tx: Tx,
  userId: string,
  exerciseId: string,
  reason: XpReason,
  now: Date,
): Promise<XpOutcome> {
  const [user] = await tx
    .select({ xp: users.xp, streak: users.streak, lastActiveAt: users.lastActiveAt })
    .from(users)
    .where(eq(users.id, userId))
    .for('update');
  // The caller checked the row exists; a missing one now is a bug, so roll back.
  if (!user) throw new Error('recordClear: no users row for the locked user');

  await tx.insert(progress).values({ userId, exerciseId, completedAt: now }).onConflictDoNothing();

  const amount = XP_REWARDS[reason];
  // Award once: xp_events_award_once_idx (user, exercise, reason). No row back = already earned.
  const inserted = await tx
    .insert(xpEvents)
    .values({ userId, exerciseId, reason, amount, createdAt: now })
    .onConflictDoNothing()
    .returning({ id: xpEvents.id });
  const awarded = inserted.length > 0 ? amount : 0;

  await tx
    .update(users)
    .set({
      ...(awarded > 0 && { xp: sql`${users.xp} + ${awarded}` }),
      streak: nextStreak(user.streak, user.lastActiveAt, now),
      lastActiveAt: now,
    })
    .where(eq(users.id, userId));

  return xpOutcome(user.xp, awarded);
}
