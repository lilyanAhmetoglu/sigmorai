import { bigint, check, index, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { SUBMISSION_STATUSES } from '@/lib/constants';
import { oneOf } from './checks';
import { users } from './users';

/**
 * One row per graded case attempt, inserted already graded (passed / failed)
 * inside the grading transaction, so a row is never half-done. HP spent today
 * = failed rows since 00:00 UTC (lib/xp/hp.ts).
 */
export const submissions = pgTable(
  'submissions',
  {
    id: bigint({ mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    exerciseId: text().notNull(),
    payload: jsonb().notNull(),
    status: text({ enum: SUBMISSION_STATUSES }).notNull(),
    results: jsonb().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('submissions_user_exercise_idx').on(t.userId, t.exerciseId, t.createdAt.desc()),
    check('submissions_status_check', oneOf(t.status, SUBMISSION_STATUSES)),
  ],
);
