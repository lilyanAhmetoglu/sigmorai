import { bigint, boolean, index, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

/**
 * Every attempt, inserted BEFORE the runner is called, so a crashed run
 * still costs HP. passed/results/graded_at stay null until grading ends.
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
    passed: boolean(),
    results: jsonb(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    gradedAt: timestamp({ withTimezone: true }),
  },
  (t) => [index('submissions_user_exercise_idx').on(t.userId, t.exerciseId, t.createdAt.desc())],
);
