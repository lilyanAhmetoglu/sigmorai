import type { LeaderboardRange } from '@/lib/types';

/** Leaderboard ranges, in the design's tab order (boardTabs: WEEK, MONTH, ALL TIME). */
export const LEADERBOARD_RANGES = ['week', 'month', 'all'] as const;

/** A missing or unknown `?range=` shows all time. */
export const DEFAULT_LEADERBOARD_RANGE: LeaderboardRange = 'all';

/** The search param that picks the range (`/leaderboard?range=week`). */
export const RANGE_PARAM = 'range';

/** Rows in the public top list. */
export const LEADERBOARD_SIZE = 25;

/** How long the cached top list lives, in seconds. The viewer's own rank is never cached. */
export const LEADERBOARD_CACHE_SECONDS = 60;

/**
 * The cache tag on the top list (lib/data/leaderboard.ts). Server Actions that
 * change what the board shows (XP, hero name, track, a deleted hero) expire it.
 */
export const LEADERBOARD_CACHE_TAG = 'leaderboard-top';

/**
 * Rolling UTC-day windows. 7 days = today plus the 6 UTC days before it, so
 * the week cutoff is 00:00 UTC six days ago (lib/xp/leaderboard.ts → rangeCutoff).
 */
export const LEADERBOARD_WINDOW_DAYS = { week: 7, month: 30 } as const satisfies Record<
  Exclude<LeaderboardRange, 'all'>,
  number
>;

/** Leaderboard words. Plain product voice: no lore outside a DialogBox. */
export const LEADERBOARD_TEXT = {
  title: 'Leaderboard',
  eyebrow: 'HALL OF THE SIGMORAI',
  description: 'The top Sigmorai heroes by XP: this week, this month and all time.',
  intro:
    'You earn XP by clearing lessons, cases and quick checks. On a tie, the hero who joined first ranks higher.',
  rangeNav: 'Time range',
  ranges: { week: 'WEEK', month: 'MONTH', all: 'ALL TIME' },
  windowNote: {
    week: 'XP from the last 7 days (UTC).',
    month: 'XP from the last 30 days (UTC).',
    all: 'All XP ever earned.',
  },
  /** Sub-line under the name: "BUILDER · LV 4". */
  subline: (trackLabel: string, level: number) => `${trackLabel} · LV ${level}`,
  xp: (xp: number) => `${xp.toLocaleString('en-US')} XP`,
  /** Screen-reader prefix of the rank number. */
  rank: 'Rank',
  /** The visible marker on the viewer's row (not colour only). */
  you: 'YOU',
  yourRank: 'YOUR RANK',
  /** Accessible name of the list: "Top 25 heroes, all time". */
  listLabel: (rangeLabel: string) => `Top ${LEADERBOARD_SIZE} heroes, ${rangeLabel.toLowerCase()}`,
  empty: {
    week: 'No hero has earned XP in the last 7 days.',
    month: 'No hero has earned XP in the last 30 days.',
    all: 'No hero has earned XP yet.',
  },
  emptyHint: 'Clear a lesson to be the first on the board.',
  noXp: {
    week: 'You have no XP in the last 7 days.',
    month: 'You have no XP in the last 30 days.',
    all: 'You have no XP yet.',
  },
  noXpHint: 'Clear a lesson to get on the board.',
  signInNote: 'Sign in to see your own rank.',
  signIn: 'Sign in',
  onboardingNote: 'Create your hero to join the leaderboard.',
  onboarding: 'Create your hero',
  loading: 'Loading the leaderboard',
  error: "The leaderboard didn't load. Try again in a moment.",
  retry: 'Retry',
} as const;
