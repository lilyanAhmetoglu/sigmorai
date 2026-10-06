import {
  DEFAULT_LEADERBOARD_RANGE,
  LEADERBOARD_RANGES,
  LEADERBOARD_WINDOW_DAYS,
} from '@/lib/constants';
import type { LeaderboardRange, LeaderboardRow, RankedPlayer } from '@/lib/types';
import { utcDayStartDaysAgo } from './day';
import { levelForXp } from './level';

/**
 * `?range=` → a range. Missing, unknown or repeated (`?range=a&range=b`
 * arrives as an array) → all time.
 */
export function parseLeaderboardRange(value: string | string[] | undefined): LeaderboardRange {
  return LEADERBOARD_RANGES.find((range) => range === value) ?? DEFAULT_LEADERBOARD_RANGE;
}

/**
 * Where a rolling range starts: 00:00 UTC of the first day in the window
 * (week: today + 6 days before; month: today + 29 days before). null = all time.
 * Day-aligned, so the cache key changes once a day, not every request.
 */
export function rangeCutoff(range: LeaderboardRange, now: Date): Date | null {
  if (range === 'all') return null;
  return utcDayStartDaysAgo(now, LEADERBOARD_WINDOW_DAYS[range] - 1);
}

/**
 * Numbers rows 1, 2, 3… in the order given. The SQL already sorted them in
 * tie order (xp desc, created_at asc, id asc), so no two rows share a rank.
 */
export function numberInOrder<T>(rows: readonly T[]): (T & { rank: number })[] {
  return rows.map((row, i) => ({ ...row, rank: i + 1 }));
}

/**
 * The row a component may see. Drops the Clerk id; the level is computed from
 * total XP. `viewerId` comes from auth() only.
 */
export function toLeaderboardRow(player: RankedPlayer, viewerId: string | null): LeaderboardRow {
  return {
    rank: player.rank,
    heroName: player.heroName,
    track: player.track,
    level: levelForXp(player.totalXp),
    xp: player.xp,
    isViewer: viewerId !== null && player.id === viewerId,
  };
}
