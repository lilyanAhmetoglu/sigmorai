/**
 * Case and quick-check constants (docs/plans/quest-actions-design-plan.md).
 * HP and XP amounts live in ./xp.ts.
 */
import type { ChapterStep, GradedKind } from '@/lib/types';

/**
 * The shuffle seed of a case or quick-check attempt: SHUFFLE_SEED_BYTES random
 * bytes as lowercase hex, made by the quest page and sent back with the answers.
 */
export const SHUFFLE_SEED_BYTES = 16;
export const SHUFFLE_SEED_PATTERN = /^[a-f0-9]{32}$/;

/** The exercise-id step each graded kind takes. A case keeps the `challenge` segment (ids are forever). */
export const GRADED_STEP = {
  case: 'challenge',
  'quick-check': 'quick-check',
} as const satisfies Record<GradedKind, ChapterStep>;

/**
 * Lesson steps (docs/plans/interactive-lessons-design-plan.md, Phase 1): a
 * lesson with at least this many `##` sections shows one step at a time.
 */
export const LESSON_MIN_STEPS = 3;

/** The "Lesson done" panel's id: Finish on the last step moves focus there. */
export const LESSON_DONE_ID = 'lesson-done';
