import { sql } from 'drizzle-orm';
import { bigint, check, index, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { SUBMISSION_STATUSES } from '@/lib/constants';
import { oneOf } from './checks';
import { users } from './users';

/**
 * Every attempt, inserted as `pending` BEFORE the runner is called, so a
 * crashed run still costs HP. Grading sets passed / failed / errored and
 * graded_at together (the CHECK keeps them in step). HP spent today =
 * pending + failed rows (lib/xp/hp.ts); errored is refunded.
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
    status: text({ enum: SUBMISSION_STATUSES }).notNull().default('pending'),
    results: jsonb(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    gradedAt: timestamp({ withTimezone: true }),
  },
  (t) => [
    index('submissions_user_exercise_idx').on(t.userId, t.exerciseId, t.createdAt.desc()),
    check('submissions_status_check', oneOf(t.status, SUBMISSION_STATUSES)),
    check('submissions_graded_check', sql`(${t.status} = 'pending') = (${t.gradedAt} is null)`),
  ],
);
