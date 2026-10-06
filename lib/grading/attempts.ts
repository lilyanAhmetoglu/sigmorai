import 'server-only';
import { and, eq, gte } from 'drizzle-orm';
import type { Db, Tx } from '@/db';
import { progress, submissions } from '@/db/schema';
import { hpSpentToday } from '@/lib/xp/hp';
import { utcDayStart } from '@/lib/xp/day';

/** Where a learner stands on one exercise today. */
export type AttemptState = {
  /** A progress row exists: a graded attempt now is a replay. */
  cleared: boolean;
  /** HP spent today (failed rows since 00:00 UTC). */
  spent: number;
  /** Graded rows written today (passed or failed): the quick-check daily cap. */
  tries: number;
};

/**
 * Reads the clear, today's HP-spending attempts and today's tries. `exec` is the db (quest
 * page) or the graded action's transaction, after it locked the user row. Served by the
 * progress primary key and submissions_user_exercise_idx.
 */
export async function readAttempts(
  exec: Db | Tx,
  userId: string,
  exerciseId: string,
  now: Date,
): Promise<AttemptState> {
  const [clear] = await exec
    .select({ id: progress.exerciseId })
    .from(progress)
    .where(and(eq(progress.userId, userId), eq(progress.exerciseId, exerciseId)))
    .limit(1);
  const today = await exec
    .select({ status: submissions.status, createdAt: submissions.createdAt })
    .from(submissions)
    .where(
      and(
        eq(submissions.userId, userId),
        eq(submissions.exerciseId, exerciseId),
        gte(submissions.createdAt, utcDayStart(now)),
      ),
    );
  return { cleared: Boolean(clear), spent: hpSpentToday(today, now), tries: today.length };
}
