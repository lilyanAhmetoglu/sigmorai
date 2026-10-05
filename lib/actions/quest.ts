'use server';

/**
 * Quest Server Actions (docs/plans/quest-actions-design-plan.md → API contract,
 * amended 2026-10-05: no code runs; cases and quick checks arrive in Phase C).
 * Public HTTP endpoints: every argument is hostile. The user id comes from
 * Clerk only; the client sends an exercise id, never a grade, an XP amount or
 * a level. Refusals are returned as `{ ok: false, code, message }`, never thrown.
 */
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import type { z } from 'zod';
import { db, type Tx } from '@/db';
import { submissions, users } from '@/db/schema';
import { ContentError, loadCase, loadQuickCheck } from '@/lib/content/load';
import { answerFeedback, gradeAnswers } from '@/lib/grading/answers';
import { readAttempts } from '@/lib/grading/attempts';
import { recordClear } from '@/lib/grading/award';
import { clearReason, decideSubmitStart, hpAfterSubmit } from '@/lib/grading/case';
import { toActionFailure as fail, questFailure } from '@/lib/grading/failure';
import { checkOpen } from '@/lib/grading/open';
import {
  CompleteLessonInputSchema,
  SubmitCaseInputSchema,
  SubmitQuickCheckInputSchema,
  type CompleteLessonResult,
  type GradedKind,
  type Question,
  type QuestFailure,
  type SubmitAnswersInput,
  type SubmitAnswersResult,
} from '@/lib/types';

/** Every page that shows XP, HP or a clear: the HUD is in the (app) layout. */
const revalidateQuest = () => revalidatePath('/', 'layout');

/** Locks the user row for the rest of the transaction. NOT_ONBOARDED when there is none. */
async function lockUser(tx: Tx, userId: string): Promise<QuestFailure | null> {
  const [me] = await tx
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, userId))
    .for('update');
  return me ? null : questFailure('NOT_ONBOARDED');
}

/**
 * submitCase: a chapter case or a boss (both tracks). The browser sends the
 * page's seed and one display index per question; the server grades. A wrong
 * answer set costs 1 HP (3 per case per UTC day); a replay costs 0 and earns 0.
 */
export async function submitCase(input: unknown): Promise<SubmitAnswersResult> {
  return submitAnswers('case', SubmitCaseInputSchema, input);
}

/** submitQuickCheck: same flow as a case, +5 XP once, never costs HP. */
export async function submitQuickCheck(input: unknown): Promise<SubmitAnswersResult> {
  return submitAnswers('quick-check', SubmitQuickCheckInputSchema, input);
}

/** The full questions (correct flags, explanations). Server-only; never returned as is. */
async function loadQuestions(kind: GradedKind, exerciseId: string): Promise<Question[]> {
  const content = kind === 'case' ? await loadCase(exerciseId) : await loadQuickCheck(exerciseId);
  return content.questions;
}

/**
 * One transaction: lock the user row → open check → HP (cases only) →
 * insert the graded submission with { seed, answers, order } → on any pass,
 * progress + xp_events (award once) + streak → revalidate after the commit.
 */
async function submitAnswers(
  kind: GradedKind,
  schema: z.ZodType<SubmitAnswersInput>,
  input: unknown,
): Promise<SubmitAnswersResult> {
  const { userId } = await auth();
  if (!userId) return fail(questFailure('UNAUTHENTICATED'));

  const parsed = schema.safeParse(input);
  if (!parsed.success) return fail(questFailure('INVALID_INPUT'));
  const { exerciseId, seed, answers } = parsed.data;

  let questions: Question[];
  try {
    questions = await loadQuestions(kind, exerciseId);
  } catch (error) {
    // No file = a stub chapter (INVALID_INPUT); a broken file is our bug.
    if (error instanceof ContentError && error.code === 'missing') {
      return fail(questFailure('INVALID_INPUT'));
    }
    console.error(`[submit ${kind}] content failed`, error);
    return fail(questFailure('SERVER_ERROR'));
  }
  // Pure (no IO), so it runs before the transaction: a malformed answer set never takes the row lock.
  const graded = gradeAnswers(questions, seed, answers);
  if (!graded.ok) return fail(graded);

  let outcome: SubmitAnswersResult | QuestFailure;
  try {
    outcome = await db.transaction(async (tx) => {
      const now = new Date();
      const refused = await lockUser(tx, userId);
      if (refused) return refused;
      const open = await checkOpen(tx, userId, exerciseId);
      if (!open.ok) return open;
      const { cleared, spent } = await readAttempts(tx, userId, exerciseId, now);
      const start = decideSubmitStart(kind, cleared, spent);
      if (!start.ok) return start;

      const status = graded.passed ? 'passed' : 'failed';
      await tx.insert(submissions).values({
        userId,
        exerciseId,
        status,
        payload: { seed, answers: graded.original, order: graded.order },
        results: { questions: graded.correct.map((correct) => ({ correct })) },
        createdAt: now,
      });
      const xp = graded.passed
        ? await recordClear(tx, userId, exerciseId, clearReason(open.ref), now)
        : null;
      return {
        ok: true as const,
        passed: graded.passed,
        replay: start.replay,
        hpLeft: hpAfterSubmit(kind, spent, status, start.replay),
        questions: answerFeedback(questions, graded, graded.passed || start.replay),
        xp,
      };
    });
  } catch (error) {
    console.error(`[submit ${kind}] failed`, error);
    return fail(questFailure('SERVER_ERROR'));
  }
  if (!outcome.ok) return fail(outcome);
  // After the commit: a revalidate error must never read as "Nothing was saved".
  try {
    revalidateQuest();
  } catch (error) {
    console.error(`[submit ${kind}] revalidate failed`, error);
  }
  return outcome;
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

  let outcome: CompleteLessonResult;
  try {
    outcome = await db.transaction(async (tx) => {
      const refused = await lockUser(tx, userId);
      if (refused) return refused;
      const open = await checkOpen(tx, userId, exerciseId);
      if (!open.ok) return open;
      const xp = await recordClear(tx, userId, exerciseId, 'lesson', new Date());
      return { ok: true as const, xp };
    });
  } catch (error) {
    console.error('[completeLesson] failed', error);
    return fail(questFailure('SERVER_ERROR'));
  }
  if (!outcome.ok) return fail(outcome);
  // After the commit: a revalidate error must never read as "Nothing was saved".
  try {
    revalidateQuest();
  } catch (error) {
    console.error('[completeLesson] revalidate failed', error);
  }
  return outcome;
}
