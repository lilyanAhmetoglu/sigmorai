import { MIN_CHAPTERS, QUICK_CHECK_DAILY_TRIES, XP_REWARDS } from '@/lib/constants';
import { buildExerciseId } from '@/lib/content/ids';
import type {
  ExerciseRef,
  GradedKind,
  QuestFailure,
  SubmissionStatus,
  XpOutcome,
} from '@/lib/types';
import { hpLeft } from '@/lib/xp/hp';
import { levelForXp } from '@/lib/xp/level';
import { questFailure } from './failure';

/**
 * Graded-case rules (quest-actions spec, amended 2026-10-05: every chapter and
 * boss ends in a case). Pure: no IO, so every rule here has a bun test. The
 * Server Action does the DB around it.
 */

/**
 * Which kind of answer set an exercise takes: a case (chapter or boss) or a
 * quick check (chapter, Math Tower floor or Frontier chapter). A lesson is none.
 */
export function gradedKind(ref: ExerciseRef): GradedKind | null {
  if (ref.area === 'boss') return 'case';
  if (ref.area === 'chapter' && ref.step === 'challenge') return 'case';
  if (ref.step === 'quick-check') return 'quick-check';
  return null;
}

/**
 * The HP the learner has on this exercise now: null for a quick check (no
 * HP). A cleared case is practice, so it shows full HP.
 */
export function hpNow(kind: GradedKind, cleared: boolean, spentToday: number): number | null {
  if (kind === 'quick-check') return null;
  return cleared ? hpLeft(0) : hpLeft(spentToday);
}

/**
 * Before grading: a cleared exercise is a replay (no HP cost, no XP, no
 * submissions row); otherwise a case needs HP left today and a quick check
 * needs a try left today (QUICK_CHECK_DAILY_TRIES, SIG-27). `triesToday` =
 * graded rows written today for this exercise.
 */
export function decideSubmitStart(
  kind: GradedKind,
  cleared: boolean,
  spentToday: number,
  triesToday: number,
): { ok: true; replay: boolean } | QuestFailure {
  if (cleared) return { ok: true, replay: true };
  if (hpNow(kind, false, spentToday) === 0) return questFailure('NO_HP');
  if (kind === 'quick-check' && triesToday >= QUICK_CHECK_DAILY_TRIES) {
    return questFailure('NO_TRIES');
  }
  return { ok: true, replay: false };
}

/**
 * Whether a graded attempt writes a submissions row. A replay of a cleared
 * exercise is graded in memory only (SIG-27): it can't spend HP or earn XP,
 * so storing it would only let one account grow the table without limit.
 */
export const storesAttempt = (replay: boolean): boolean => !replay;

/** Quick-check tries left today, floored at 0. */
export const triesLeft = (triesToday: number): number =>
  Math.max(0, QUICK_CHECK_DAILY_TRIES - triesToday);

/** HP after the graded attempt. Only a failed first-time case costs 1. */
export function hpAfterSubmit(
  kind: GradedKind,
  spentBefore: number,
  status: SubmissionStatus,
  replay: boolean,
): number | null {
  const spentNow = spentBefore + (status === 'failed' && !replay ? 1 : 0);
  return hpNow(kind, replay, spentNow);
}

/** The XP reason (and so the amount) a cleared exercise earns. */
export function clearReason(ref: ExerciseRef): keyof typeof XP_REWARDS {
  if (ref.area === 'boss') return 'boss';
  if (ref.area === 'chapter' && ref.step === 'challenge') return 'challenge';
  // A chapter or Math Tower lesson (any area but the boss has a step).
  if (ref.step === 'lesson') return 'lesson';
  return 'quick-check';
}

/** XP before and after. `awarded` is 0 when the award-once insert returned no row. */
export function xpOutcome(xpBefore: number, awarded: number): XpOutcome {
  const total = xpBefore + awarded;
  return { awarded, total, levelBefore: levelForXp(xpBefore), levelAfter: levelForXp(total) };
}

/**
 * The case a clear opens next: the next chapter's case, the boss after the
 * realm's last chapter (`chapterCount`, from its track's outline), and
 * nothing after the boss. Ids keep the `challenge` segment. Null for the
 * Math Tower and the Frontier (they have no cases).
 *
 * The MIN_CHAPTERS default is only for lib/data/quest.ts, which is left
 * untouched until SIG-50 lands; it must pass the outline's count then. Every
 * realm has exactly MIN_CHAPTERS chapters today, so the default is right.
 */
export function nextCaseId(ref: ExerciseRef, chapterCount: number = MIN_CHAPTERS): string | null {
  if (ref.area !== 'chapter') return null;
  const { track, realm, chapter } = ref;
  if (chapter < chapterCount) {
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
