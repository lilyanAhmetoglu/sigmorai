import { sql } from 'drizzle-orm';
import { check, date, index, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { HERO_NAME_MAX, HERO_NAME_MIN, TRACKS } from '@/lib/constants';
import { oneOf } from './checks';

/**
 * One row per onboarded player. id = the Clerk user id. No name or email:
 * Clerk owns identity. The track-picker action writes the row; no row means
 * not onboarded. xp is a cache of sum(xp_events.amount), written in the same
 * transaction as the event (db/CLAUDE.md invariant 3).
 * sandbox_day / run_count / submit_count are the daily sandbox caps and
 * sandbox_pending_at is the one-at-a-time lock (lib/grading/sandbox-gate.ts).
 * The counts belong to sandbox_day (UTC); an older day reads as 0.
 */
export const users = pgTable(
  'users',
  {
    id: text().primaryKey(),
    heroName: text().notNull(),
    track: text({ enum: TRACKS }).notNull(),
    xp: integer().notNull().default(0),
    streak: integer().notNull().default(0),
    lastActiveAt: timestamp({ withTimezone: true }),
    avatarUrl: text(),
    sandboxDay: date({ mode: 'string' }),
    runCount: integer().notNull().default(0),
    submitCount: integer().notNull().default(0),
    sandboxPendingAt: timestamp({ withTimezone: true }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    check('users_track_check', oneOf(t.track, TRACKS)),
    check('users_xp_check', sql`${t.xp} >= 0`),
    check('users_streak_check', sql`${t.streak} >= 0`),
    check('users_run_count_check', sql`${t.runCount} >= 0`),
    check('users_submit_count_check', sql`${t.submitCount} >= 0`),
    // Characters are checked by HeroNameSchema (lib/types); the DB holds the length line.
    check(
      'users_hero_name_length_check',
      sql`char_length(${t.heroName}) between ${sql.raw(String(HERO_NAME_MIN))} and ${sql.raw(String(HERO_NAME_MAX))}`,
    ),
    index('users_xp_idx').on(t.xp.desc()),
  ],
);
