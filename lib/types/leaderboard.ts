import type { LEADERBOARD_RANGES } from '@/lib/constants';
import type { Track } from './exercise';

/** week / month = rolling UTC-day windows over xp_events; all = users.xp. */
export type LeaderboardRange = (typeof LEADERBOARD_RANGES)[number];

/**
 * One ranked player as the server reads it (lib/data/leaderboard.ts).
 * SERVER ONLY: `id` is the Clerk user id. Map it with toLeaderboardRow
 * (lib/xp/leaderboard.ts) before anything reaches a component.
 */
export type RankedPlayer = {
  id: string;
  rank: number;
  heroName: string;
  track: Track;
  /** XP in the range (all time: the same as totalXp). */
  xp: number;
  /** users.xp. The level comes from this, in every range. */
  totalXp: number;
};

/** One row the page renders. No user id, avatar URL or activity time. */
export type LeaderboardRow = {
  rank: number;
  heroName: string;
  track: Track;
  /** Computed from total XP (lib/xp/level.ts), never stored. */
  level: number;
  /** XP in the range. */
  xp: number;
  /** This row is the signed-in viewer. */
  isViewer: boolean;
};

/** Where the viewer stands, for the line under the top list. */
export type LeaderboardViewer =
  | { status: 'signed-out' }
  | { status: 'onboarding' }
  /** In the top list: that row is marked, no extra row. */
  | { status: 'in-top' }
  /** Below the top list: their own row. */
  | { status: 'ranked'; row: LeaderboardRow }
  /** Onboarded, but no XP in this range. */
  | { status: 'no-xp' };

/** Everything the leaderboard page renders. */
export type LeaderboardView = {
  range: LeaderboardRange;
  rows: LeaderboardRow[];
  viewer: LeaderboardViewer;
};
