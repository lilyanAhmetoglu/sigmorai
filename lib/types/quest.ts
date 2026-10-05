import { z } from 'zod';
import { SANDBOX_KINDS, type SUBMISSION_STATUSES } from '@/lib/constants';

/**
 * Every reason a quest press (Run, Submit, a case or quick-check answer) can
 * be refused (docs/plans/quest-actions-design-plan.md → API contract).
 */
export const QuestErrorCodeSchema = z.enum([
  'UNAUTHENTICATED',
  'NOT_ONBOARDED',
  'INVALID_INPUT',
  'TIER_LOCKED',
  'NOT_OPEN',
  'NO_HP',
  'CAP_REACHED',
  'RUN_IN_PROGRESS',
  'RUNNER_FAILED',
]);
export type QuestErrorCode = z.infer<typeof QuestErrorCodeSchema>;

export const SandboxKindSchema = z.enum(SANDBOX_KINDS);
export type SandboxKind = z.infer<typeof SandboxKindSchema>;

export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];

/** What CAP_REACHED carries. `resetsAt` is a UTC ISO instant; the browser shows local time. */
export const CapReachedSchema = z.object({
  kind: SandboxKindSchema,
  used: z.number().int().nonnegative(),
  cap: z.number().int().positive(),
  resetsAt: z.iso.datetime(),
});
export type CapReached = z.infer<typeof CapReachedSchema>;

/** A refused quest press, before it is shaped for a route or an action. */
export type QuestFailure = {
  ok: false;
  code: QuestErrorCode;
  message: string;
  /** Only for CAP_REACHED. */
  cap?: CapReached;
};

/**
 * POST /api/run error body. `error` is the learner-facing message (kept from
 * the runner PR); `code` and `resetsAt` were added by the quest-actions spec.
 */
export const RunErrorBodySchema = z.object({
  error: z.string(),
  code: QuestErrorCodeSchema,
  resetsAt: z.iso.datetime().optional(),
  cap: CapReachedSchema.optional(),
});
export type RunErrorBody = z.infer<typeof RunErrorBodySchema>;
