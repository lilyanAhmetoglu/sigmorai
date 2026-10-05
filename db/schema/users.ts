import { sql } from 'drizzle-orm';
import { check, index, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { HERO_NAME_MAX, HERO_NAME_MIN, TRACKS } from '@/lib/constants';
import { oneOf } from './checks';

/**
 * One row per onboarded player. id = the Clerk user id. No name or email:
 * Clerk owns identity. The track-picker action writes the row; no row means
 * not onboarded. xp is a cache of sum(xp_events.amount), written in the same
 * transaction as the event (db/CLAUDE.md invariant 3).
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
    // Characters are checked by HeroNameSchema (lib/types); the DB holds the length line.
    check(
      'users_hero_name_length_check',
      sql`char_length(${t.heroName}) between ${sql.raw(String(HERO_NAME_MIN))} and ${sql.raw(String(HERO_NAME_MAX))}`,
    ),
    index('users_xp_idx').on(t.xp.desc()),
  ],
);
