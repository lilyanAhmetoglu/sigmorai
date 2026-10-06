/**
 * Why an xp_events row exists. A growing set: text in the DB + a Zod enum in
 * lib/types/xp.ts, so adding a reason needs no migration.
 */
export const XP_REASONS = ['lesson', 'quick-check', 'challenge', 'boss'] as const;

/**
 * XP granted per reason (docs/build-prompt.md: +10 / +150 / +500; quick check
 * +5 added 2026-10-05 so it isn't skipped; the challenge stays ~90% of a chapter).
 */
export const XP_REWARDS = {
  lesson: 10,
  'quick-check': 5,
  challenge: 150,
  boss: 500,
} as const satisfies Record<(typeof XP_REASONS)[number], number>;

/**
 * Level = floor(sqrt(xp / LEVEL_XP_STEP)) + FIRST_LEVEL (docs/build-prompt.md).
 * Level n starts at LEVEL_XP_STEP × (n − 1)² XP, so a new player is LV 1
 * (SIG-33, 2026-10-05). Computed from xp, never stored (db/CLAUDE.md invariant 5).
 */
export const LEVEL_XP_STEP = 100;

/** The level a new player (0 XP) starts at. */
export const FIRST_LEVEL = 1;

/** Failed graded attempts allowed per case per UTC day (lib/xp/hp.ts). */
export const HP_PER_CHALLENGE = 3;

/** submissions.status. Every row is graded in its insert transaction: no pending state. */
export const SUBMISSION_STATUSES = ['passed', 'failed'] as const;

/**
 * Graded tries per quick check per UTC day (SIG-27). Quick checks cost no HP,
 * so this caps the submissions rows one learner can write. Counted from
 * today's submissions rows (submissions_user_exercise_idx); replays of a
 * cleared quick check write no row, so they never count.
 */
export const QUICK_CHECK_DAILY_TRIES = 20;
