import { CHAPTER_COUNT, XP_REWARDS } from '@/lib/constants';
import { buildExerciseId } from '@/lib/content/ids';
import type { ExerciseRef, QuestFailure, SubmissionStatus, XpOutcome } from '@/lib/types';
import { hpLeft } from '@/lib/xp/hp';
import { levelForXp } from '@/lib/xp/level';
import { questFailure } from './failure';

/**
 * Graded-case rules (quest-actions spec, amended 2026-10-05: every chapter and
 * boss ends in a case). Pure: no IO, so every rule here has a bun test. The
 * Server Action does the DB around it.
 */

/**
 * Before grading: a cleared case is a replay (no HP cost, no XP); otherwise
 * a graded attempt needs HP left today.
 */
export function decideSubmitStart(
  cleared: boolean,
  spentToday: number,
): { ok: true; replay: boolean } | QuestFailure {
  if (cleared) return { ok: true, replay: true };
  if (hpLeft(spentToday) === 0) return questFailure('NO_HP');
  return { ok: true, replay: false };
}

/** HP after the graded attempt. Only a failed first-time attempt costs 1; a replay shows full HP. */
export function hpAfterSubmit(spentBefore: number, status: SubmissionStatus, replay: boolean) {
  if (replay) return hpLeft(0);
  return hpLeft(spentBefore + (status === 'failed' ? 1 : 0));
}

/** The XP reason (and so the amount) a cleared exercise earns. */
export function clearReason(ref: ExerciseRef): keyof typeof XP_REWARDS {
  if (ref.area === 'boss') return 'boss';
  if (ref.area === 'chapter' && ref.step === 'challenge') return 'challenge';
  if (ref.area === 'chapter' && ref.step === 'lesson') return 'lesson';
  return 'quick-check';
}

/** XP before and after. `awarded` is 0 when the award-once insert returned no row. */
export function xpOutcome(xpBefore: number, awarded: number): XpOutcome {
  const total = xpBefore + awarded;
  return { awarded, total, levelBefore: levelForXp(xpBefore), levelAfter: levelForXp(total) };
}

/**
 * The case a clear opens next: the next chapter's case, the boss after the
 * last chapter, and nothing after the boss. Ids keep the `challenge` segment.
 */
export function nextCaseId(ref: ExerciseRef): string | null {
  if (ref.area !== 'chapter') return null;
  const { track, realm, chapter } = ref;
  if (chapter < CHAPTER_COUNT) {
    return buildExerciseId({
      area: 'chapter',
      track,
      realm,
      chapter: chapter + 1,
      step: 'challenge',
    });
  }
  return buildExerciseId({ area: 'boss', track, realm });
}
