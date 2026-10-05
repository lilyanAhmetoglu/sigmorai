import { sql } from 'drizzle-orm';
import {
  bigint,
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { XP_REASONS } from '@/lib/constants';
import { users } from './users';

/**
 * The XP ledger. The leaderboard aggregates from here. A grant is
 * `insert … on conflict do nothing returning`, then users.xp += amount in the
 * same transaction. reason is text + a Zod enum (lib/types/xp.ts): a growing set.
 */
export const xpEvents = pgTable(
  'xp_events',
  {
    id: bigint({ mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    amount: integer().notNull(),
    reason: text({ enum: XP_REASONS }).notNull(),
    exerciseId: text().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    // Award once per (user, exercise, reason): every reason is per exercise, so no gap.
    uniqueIndex('xp_events_award_once_idx').on(t.userId, t.exerciseId, t.reason),
    check('xp_events_amount_check', sql`${t.amount} > 0`),
    // Weekly leaderboard: sum(amount) group by user_id where created_at >= week start.
    index('xp_events_week_idx').on(t.createdAt, t.userId, t.amount),
  ],
);
