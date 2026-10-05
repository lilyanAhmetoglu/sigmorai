import { pgTable, primaryKey, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

/**
 * One row per cleared exercise. The track lives in exercise_id
 * (lib/content/ids.ts), so shared Math/Frontier content is cleared once.
 * Status and attempts are derived, not stored.
 */
export const progress = pgTable(
  'progress',
  {
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    exerciseId: text().notNull(),
    completedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.exerciseId] })],
);
