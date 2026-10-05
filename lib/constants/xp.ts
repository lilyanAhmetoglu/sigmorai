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

/** Failed graded attempts allowed per challenge per UTC day (lib/xp/hp.ts). */
export const HP_PER_CHALLENGE = 3;

/**
 * submissions.status. `pending` = written before the runner (counts as spent
 * HP, so a crash is no free retry); `errored` = our fault, HP refunded.
 */
export const SUBMISSION_STATUSES = ['pending', 'passed', 'failed', 'errored'] as const;
