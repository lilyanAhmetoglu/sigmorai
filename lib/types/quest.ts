import { z } from 'zod';
import { RUN_CODE_MAX_CHARS, SANDBOX_KINDS, type SUBMISSION_STATUSES } from '@/lib/constants';
import { ExerciseIdSchema } from './exercise';

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

// ── Quest page view ───────────────────────────────────────────────────────

/** A disabled button: why, and when it opens again (UTC ISO; the browser shows local time). */
export type QuestBlock = { message: string; resetsAt: string };

/** Who is looking at a challenge, and what their buttons may do. Built on the server. */
export type ChallengeViewer =
  | { status: 'signed-out' }
  | { status: 'onboarding' }
  | {
      status: 'ready';
      /** Already cleared: Submit is practice (no HP, no XP). */
      cleared: boolean;
      hp: number;
      hpMax: number;
      /** When HP refills (next 00:00 UTC). */
      hpResetsAt: string;
      runBlock: QuestBlock | null;
      submitBlock: QuestBlock | null;
    };

// ── Server Action contracts (quest-actions spec → API contract) ───────────

/** What every quest Server Action returns when it refuses. Never a raw throw. */
export type QuestActionFailure = {
  ok: false;
  code: QuestErrorCode;
  message: string;
  /** UTC ISO instant for CAP_REACHED; the browser shows local time. */
  resetsAt?: string;
};

/** XP after a pass. `awarded` is 0 on a replay (award once). */
export type XpOutcome = {
  awarded: number;
  total: number;
  levelBefore: number;
  levelAfter: number;
};

/** One graded test as the learner sees it. Hidden tests get a generic name and no detail. */
export type QuestTestRow = {
  name: string;
  passed: boolean;
  hidden: boolean;
  /** Visible tests only. */
  detail?: string;
};

/**
 * submitChallenge input: code only. No score, pass flag, XP or level
 * (acceptance: grep the schemas). `.strict()` refuses any extra key.
 */
export const SubmitChallengeInputSchema = z
  .object({
    exerciseId: ExerciseIdSchema.refine((id) => id.endsWith('/challenge'), {
      message: 'Only challenges can be submitted',
    }),
    code: z.string().max(RUN_CODE_MAX_CHARS),
  })
  .strict();
export type SubmitChallengeInput = z.infer<typeof SubmitChallengeInputSchema>;

export type SubmitChallengeResult =
  | {
      ok: true;
      passed: boolean;
      replay: boolean;
      hpLeft: number;
      tests: QuestTestRow[];
      /** Only after a pass. */
      xp: XpOutcome | null;
    }
  | QuestActionFailure;

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
