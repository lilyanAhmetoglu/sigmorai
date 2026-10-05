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
import { db } from '@/db';
import { users } from '@/db/schema';
import { recordClear } from '@/lib/grading/award';
import { toActionFailure as fail, questFailure } from '@/lib/grading/failure';
import { checkOpen } from '@/lib/grading/open';
import { CompleteLessonInputSchema, type CompleteLessonResult } from '@/lib/types';

/** Every page that shows XP, HP or a clear: the HUD is in the (app) layout. */
const revalidateQuest = () => revalidatePath('/', 'layout');

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
