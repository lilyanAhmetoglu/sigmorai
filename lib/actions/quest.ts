'use server';

/**
 * Quest Server Actions (docs/plans/quest-actions-design-plan.md → API contract).
 * Public HTTP endpoints: every argument is hostile. The user id comes from
 * Clerk only; the client sends code or an exercise id, never a grade, an XP
 * amount or a level. Refusals are returned as `{ ok: false, code, message,
 * resetsAt? }`, never thrown. Hidden-test detail and stdout never leave here.
 * The quest page sets maxDuration = 30 (an action takes its page's limit).
 */
import { auth } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { submissions, users } from '@/db/schema';
import { QUEST_ERROR_TEXT, QUEST_TEXT } from '@/lib/constants';
import { parseExerciseId } from '@/lib/content/ids';
import { readAttempts } from '@/lib/grading/attempts';
import { recordClear } from '@/lib/grading/award';
import {
  clearReason,
  decideSubmitStart,
  gradeChallenge,
  hpAfterSubmit,
  toLearnerTests,
  toStoredResults,
} from '@/lib/grading/challenge';
import { toActionFailure as fail, questFailure } from '@/lib/grading/failure';
import { checkOpen } from '@/lib/grading/open';
import { claimSandbox, releaseSandbox } from '@/lib/grading/sandbox-gate';
import { runCode } from '@/lib/runner';
import { loadGradedChallenge, type GradedChallenge } from '@/lib/runner/load-tests';
import { logSandboxCall, type SandboxCallStatus } from '@/lib/runner/log';
import {
  CompleteLessonInputSchema,
  SubmitChallengeInputSchema,
  type CompleteLessonResult,
  type QuestFailure,
  type RunResult,
  type SubmitChallengeResult,
} from '@/lib/types';

/** Every page that shows XP, HP or a clear: the HUD is in the (app) layout. */
const revalidateQuest = () => revalidatePath('/', 'layout');

type Started =
  { ok: true; replay: boolean; spent: number; submissionId: number; lockedAt: Date } | QuestFailure;

/**
 * Transaction A (short): lock the user row → open check → NO_HP unless a
 * replay → sandbox gate (submit cap + lock) → a `pending` submission, which
 * counts as spent HP until it is graded (a crash is no free retry).
 */
function startSubmit(userId: string, exerciseId: string, code: string, now: Date) {
  return db.transaction(async (tx): Promise<Started> => {
    const [me] = await tx
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId))
      .for('update');
    if (!me) return questFailure('NOT_ONBOARDED');

    const open = await checkOpen(tx, userId, exerciseId);
    if (!open.ok) return open;

    const { cleared, spent } = await readAttempts(tx, userId, exerciseId, now);
    const start = decideSubmitStart(cleared, spent);
    if (!start.ok) return start;

    const claim = await claimSandbox(tx, userId, 'submit', now);
    if (!claim.ok) return claim;

    const [row] = await tx
      .insert(submissions)
      .values({ userId, exerciseId, payload: { code }, createdAt: now })
      .returning({ id: submissions.id });
    return {
      ok: true,
      replay: start.replay,
      spent,
      submissionId: row.id,
      lockedAt: claim.lockedAt,
    };
  });
}

/** The runner, outside any transaction. A throw (bad runner config) reads as `error`. */
async function runGraded(
  userId: string,
  exerciseId: string,
  challenge: GradedChallenge,
  code: string,
): Promise<RunResult | null> {
  const started = performance.now();
  let status: SandboxCallStatus = 'setup-failed';
  try {
    const tests = [...challenge.visibleTests, ...challenge.hiddenTests];
    const result = await runCode({ language: challenge.language, code, tests });
    status = result.status;
    return result;
  } catch (error) {
    console.error('[submitChallenge] runner setup failed', error);
    return null;
  } finally {
    logSandboxCall({ userId, exerciseId, kind: 'submit', status, ms: performance.now() - started });
  }
}

/**
 * submitChallenge: the graded attempt on a builder challenge or boss.
 * A → runner (outside any transaction) → errored refund, or B: grade, and on a
 * pass progress + xp_events (award once) + users.xp + streak. The lock is
 * released on every outcome.
 */
export async function submitChallenge(input: unknown): Promise<SubmitChallengeResult> {
  const { userId } = await auth();
  if (!userId) return fail(questFailure('UNAUTHENTICATED'));

  const parsed = SubmitChallengeInputSchema.safeParse(input);
  if (!parsed.success) return fail(questFailure('INVALID_INPUT'));
  const { exerciseId, code } = parsed.data;
  const ref = parseExerciseId(exerciseId);

  let lock: Date | null = null;
  let ranRunner = false;
  try {
    // Loaded before the gate, so a missing file never uses up a graded run.
    const challenge = await loadGradedChallenge(exerciseId);
    if (!ref || !challenge) return fail(questFailure('INVALID_INPUT'));

    const now = new Date();
    const started = await startSubmit(userId, exerciseId, code, now);
    if (!started.ok) return fail(started);
    lock = started.lockedAt;

    const result = await runGraded(userId, exerciseId, challenge, code);
    ranRunner = true;
    const graded = result
      ? gradeChallenge(result, challenge.visibleTests, challenge.hiddenTests)
      : ({ status: 'errored' } as const);

    const xp = await db.transaction(async (tx) => {
      await tx
        .update(submissions)
        .set({ status: graded.status, results: toStoredResults(graded), gradedAt: new Date() })
        .where(and(eq(submissions.id, started.submissionId), eq(submissions.userId, userId)));
      if (graded.status !== 'passed') return null;
      return recordClear(tx, userId, exerciseId, clearReason(ref), new Date());
    });

    if (graded.status === 'errored') {
      return fail(questFailure('RUNNER_FAILED', QUEST_TEXT.runnerFailedNoHp));
    }
    revalidateQuest();
    return {
      ok: true,
      passed: graded.status === 'passed',
      replay: started.replay,
      hpLeft: hpAfterSubmit(started.spent, graded.status, started.replay),
      tests: toLearnerTests(graded.tests),
      xp,
    };
  } catch (error) {
    // DB down or a broken content file. A `pending` row left behind keeps its
    // HP spent, as for a crashed function (spec: no free retries). After the
    // runner, the code ran fine: only saving the grade failed, so say that.
    console.error('[submitChallenge] failed', error);
    return fail(
      questFailure(
        'RUNNER_FAILED',
        ranRunner ? QUEST_TEXT.notSaved : QUEST_ERROR_TEXT.RUNNER_FAILED,
      ),
    );
  } finally {
    if (lock) await releaseSandbox(userId, lock);
  }
}

/**
 * completeLesson: contract only (quest-actions spec). The "Lesson done"
 * button and the lesson page are SIG-11. Open check → progress + xp_events
 * (`lesson`, once) + streak, in one transaction.
 */
export async function completeLesson(input: unknown): Promise<CompleteLessonResult> {
  const { userId } = await auth();
  if (!userId) return fail(questFailure('UNAUTHENTICATED'));

  const parsed = CompleteLessonInputSchema.safeParse(input);
  if (!parsed.success) return fail(questFailure('INVALID_INPUT'));
  const { exerciseId } = parsed.data;

  try {
    const outcome = await db.transaction(async (tx) => {
      const [me] = await tx
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, userId))
        .for('update');
      if (!me) return questFailure('NOT_ONBOARDED');
      const open = await checkOpen(tx, userId, exerciseId);
      if (!open.ok) return open;
      const xp = await recordClear(tx, userId, exerciseId, 'lesson', new Date());
      return { ok: true as const, xp };
    });
    if (!outcome.ok) return fail(outcome);
    revalidateQuest();
    return outcome;
  } catch (error) {
    console.error('[completeLesson] failed', error);
    // No runner here, but RUNNER_FAILED is the spec's "our side failed" code.
    return fail(questFailure('RUNNER_FAILED', QUEST_TEXT.notSaved));
  }
}
