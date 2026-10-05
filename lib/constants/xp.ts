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
 * Level = floor(sqrt(xp / LEVEL_XP_STEP)) (docs/build-prompt.md). Level n
 * starts at LEVEL_XP_STEP × n² XP, so a new player is level 0. Computed from
 * xp, never stored (db/CLAUDE.md invariant 5).
 */
export const LEVEL_XP_STEP = 100;

/**
 * HP = attempts per challenge, refilled daily (docs/build-prompt.md). It is
 * per challenge and computed from attempts + date, so the HUD only shows a
 * value when a page passes one (the quest page, SIG-16).
 */
export const HP_MAX = 3;
