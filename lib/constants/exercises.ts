/**
 * The shape of the curriculum that exercise ids encode (docs/build-prompt.md).
 * Parsed and built by lib/content/ids.ts; the grammar is in content/CLAUDE.md.
 */

/** The two learner paths. Also users.track (CHECK in db/schema/users.ts). */
export const TRACKS = ['builder', 'strategist'] as const;

/** Realms r0..r8 per track. */
export const REALM_COUNT = 9;
/** Chapters c1..c6 per realm. */
export const CHAPTER_COUNT = 6;
/** Math Tower floors f1..f8. */
export const MATH_FLOOR_COUNT = 8;

/** First id segment of the shared (track-free) areas. */
export const MATH_AREA = 'math';
export const FRONTIER_AREA = 'frontier';
/** Second-level segment that marks a realm's boss. */
export const BOSS_SEGMENT = 'boss';

/** Steps inside a realm chapter. */
export const CHAPTER_STEPS = ['lesson', 'challenge', 'quick-check'] as const;
/** A boss is one challenge. */
export const BOSS_STEP = 'challenge';
/** Steps inside a Math Tower floor or a Frontier level (no challenge). */
export const SIDE_STEPS = ['lesson', 'quick-check'] as const;
