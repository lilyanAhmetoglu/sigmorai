import { z } from 'zod';
import {
  CASE_QUESTIONS,
  GRADED_STEP,
  QUICK_CHECK_QUESTIONS,
  SHUFFLE_SEED_PATTERN,
  type SUBMISSION_STATUSES,
} from '@/lib/constants';
import type { PublicCase } from './content';
import { ExerciseIdSchema } from './exercise';
import type { HpValue } from './hud';

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

// ── Cases and quick checks ────────────────────────────────────────────────

/** What an answer set grades: a case (chapter or boss, costs HP) or a quick check (free). */
export type GradedKind = 'case' | 'quick-check';

/**
 * submitCase / submitQuickCheck input: the page's seed and one DISPLAY index
 * per question. No score, pass flag, XP or level: the server grades.
 */
const answersInput = (kind: GradedKind) =>
  z
    .object({
      exerciseId: ExerciseIdSchema.refine((id) => id.endsWith(`/${GRADED_STEP[kind]}`), {
        message: `Only ${kind} ids`,
      }),
      seed: z.string().regex(SHUFFLE_SEED_PATTERN),
      answers: z
        .array(z.number().int().nonnegative())
        .min(1)
        .max(Math.max(CASE_QUESTIONS.max, QUICK_CHECK_QUESTIONS)),
    })
    .strict();

export const SubmitCaseInputSchema = answersInput('case');
export const SubmitQuickCheckInputSchema = answersInput('quick-check');
export type SubmitAnswersInput = z.infer<typeof SubmitCaseInputSchema>;

/** An option once graded: its text, why, and whether it is the right one. */
export type GradedOption = { text: string; explanation: string; correct: boolean };

/**
 * One question after submit. `picked` is the learner's own option, with its
 * explanation only. `options` (display order) comes only after a pass or on
 * a replay: a fail never shows the correct option.
 */
export type QuestionFeedback = {
  correct: boolean;
  picked: { text: string; explanation: string };
  options?: GradedOption[];
};

export type SubmitAnswersResult =
  | {
      ok: true;
      passed: boolean;
      /** Already cleared before: no HP cost, no XP. */
      replay: boolean;
      /** HP left on this case today; null for a quick check (no HP). */
      hpLeft: number | null;
      questions: QuestionFeedback[];
      /** Set on every pass; `awarded` is 0 on a replay. Null on a fail. */
      xp: XpOutcome | null;
    }
  | QuestActionFailure;

/** One question as the browser sees it before submit: options already shuffled. */
export type PublicQuestion = PublicCase['questions'][number];

/** What the answer form gets. Public only: no correct flags, no explanations. */
export type AnswerSheet = {
  kind: GradedKind;
  exerciseId: string;
  /** For the XP toast: the case title, or "Quick check". */
  title: string;
  seed: string;
  questions: PublicQuestion[];
};

/** Who is looking at a case or quick check. Scoped to auth()'s user. */
export type AnswerViewer =
  | { status: 'signed-out' }
  | { status: 'onboarding' }
  | {
      status: 'ready';
      /** Cleared before: submitting is practice (no HP, no XP). */
      cleared: boolean;
      /** Null for a quick check (no HP). */
      hp: HpValue | null;
      /** UTC instant HP refills (00:00 UTC tomorrow). */
      hpResetsAt: string;
    };
