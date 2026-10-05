import { CHAPTER_COUNT, QUEST_TEXT, XP_REWARDS } from '@/lib/constants';
import { buildExerciseId } from '@/lib/content/ids';
import type {
  ChallengeTest,
  ExerciseRef,
  QuestFailure,
  QuestTestRow,
  RunResult,
  SubmissionStatus,
  XpOutcome,
} from '@/lib/types';
import { hpLeft } from '@/lib/xp/hp';
import { levelForXp } from '@/lib/xp/level';
import { questFailure } from './failure';

/**
 * Builder Submit grading (quest-actions spec → submitChallenge). Pure: no IO,
 * so every rule here has a bun test. The action in lib/actions/quest.ts does
 * the DB and the runner around it.
 */

/** One graded test, with its real name. Server-side only (stored in submissions.results). */
export type GradedTest = { name: string; passed: boolean; hidden: boolean; detail?: string };

/** `errored` = the runner timed out or failed: our fault, HP refunded, nothing graded. */
export type Graded =
  | { status: 'errored' }
  | { status: Extract<SubmissionStatus, 'passed' | 'failed'>; tests: GradedTest[] };

/**
 * Pass = the run completed AND every expected test passed. Tests are matched
 * by name against the challenge file, so a test the runner never reported
 * counts as failed (no pass by omission).
 */
export function gradeChallenge(
  result: RunResult,
  visible: readonly ChallengeTest[],
  hidden: readonly ChallengeTest[],
): Graded {
  if (result.status !== 'completed') return { status: 'errored' };
  const byName = new Map(result.tests.map((t) => [t.name, t]));
  const grade = (test: ChallengeTest, isHidden: boolean): GradedTest => {
    const got = byName.get(test.name);
    const passed = got?.passed === true;
    return got?.detail && !passed
      ? { name: test.name, passed, hidden: isHidden, detail: got.detail }
      : { name: test.name, passed, hidden: isHidden };
  };
  const tests = [...visible.map((t) => grade(t, false)), ...hidden.map((t) => grade(t, true))];
  return { status: tests.every((t) => t.passed) ? 'passed' : 'failed', tests };
}

/** What submissions.results stores: no detail, no stdout. */
export function toStoredResults(graded: Graded) {
  if (graded.status === 'errored') return { status: graded.status, tests: [] };
  return {
    status: graded.status,
    tests: graded.tests.map(({ name, passed, hidden }) => ({ name, passed, hidden })),
  };
}

/**
 * What the learner sees. Hidden tests lose their name and detail ("Hidden
 * test 1"), so `print` or a crafted error can't leak a hidden input.
 */
export function toLearnerTests(tests: readonly GradedTest[]): QuestTestRow[] {
  let hiddenIndex = 0;
  return tests.map((t) => {
    if (t.hidden) {
      hiddenIndex += 1;
      return { name: QUEST_TEXT.hiddenTest(hiddenIndex), passed: t.passed, hidden: true };
    }
    return t.detail
      ? { name: t.name, passed: t.passed, hidden: false, detail: t.detail }
      : { name: t.name, passed: t.passed, hidden: false };
  });
}

/**
 * Before the sandbox: a cleared challenge is a replay (no HP cost, no XP);
 * otherwise Submit needs HP left today.
 */
export function decideSubmitStart(
  cleared: boolean,
  spentToday: number,
): { ok: true; replay: boolean } | QuestFailure {
  if (cleared) return { ok: true, replay: true };
  if (hpLeft(spentToday) === 0) return questFailure('NO_HP');
  return { ok: true, replay: false };
}

/** HP after the graded run. Only a failed first-time attempt costs 1; a replay shows full HP. */
export function hpAfterSubmit(spentBefore: number, status: Graded['status'], replay: boolean) {
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
 * The challenge a clear opens next: the next chapter's challenge, the boss
 * after the last chapter, and nothing after the boss.
 */
export function nextChallengeId(ref: ExerciseRef): string | null {
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
