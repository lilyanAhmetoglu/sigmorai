import { z } from 'zod';
import type { SUBMISSION_STATUSES } from '@/lib/constants';
import { ExerciseIdSchema } from './exercise';

/**
 * Every reason a quest press (a case or quick-check answer, a lesson done) can
 * be refused (docs/plans/quest-actions-design-plan.md → API contract).
 */
export const QuestErrorCodeSchema = z.enum([
  'UNAUTHENTICATED',
  'NOT_ONBOARDED',
  'INVALID_INPUT',
  'TIER_LOCKED',
  'NOT_OPEN',
  'NO_HP',
  /** Our side failed (DB down, broken content file). Nothing was saved. */
  'SERVER_ERROR',
]);
export type QuestErrorCode = z.infer<typeof QuestErrorCodeSchema>;

export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];

/** A refused quest press. */
export type QuestFailure = {
  ok: false;
  code: QuestErrorCode;
  message: string;
};

/** What every quest Server Action returns when it refuses. Never a raw throw. */
export type QuestActionFailure = QuestFailure;

/** XP after a pass. `awarded` is 0 on a replay (award once). */
export type XpOutcome = {
  awarded: number;
  total: number;
  levelBefore: number;
  levelAfter: number;
};

/** completeLesson input (contract only; the "Lesson done" button is SIG-11). */
export const CompleteLessonInputSchema = z
  .object({
    exerciseId: ExerciseIdSchema.refine((id) => id.endsWith('/lesson'), {
      message: 'Only lessons can be completed',
    }),
  })
  .strict();
export type CompleteLessonInput = z.infer<typeof CompleteLessonInputSchema>;

export type CompleteLessonResult = { ok: true; xp: XpOutcome } | QuestActionFailure;
