import { describe, expect, test } from 'bun:test';
import { HP_PER_CHALLENGE, SUBMIT_DAILY_CAP, XP_REWARDS } from '@/lib/constants';
import type { ExerciseRef, RunResult } from '@/lib/types';
import { isHpSpent } from '@/lib/xp/hp';
import {
  clearReason,
  decideSubmitStart,
  gradeChallenge,
  hpAfterSubmit,
  nextChallengeId,
  toLearnerTests,
  toStoredResults,
  xpOutcome,
} from './challenge';
import { decideGate } from './sandbox-gate';

const visible = [{ name: 'adds two numbers', code: 'assert add(1, 2) == 3' }];
const hidden = [
  { name: 'secret: negative input -7', code: 'assert add(-7, 0) == -7' },
  { name: 'secret: type is int', code: 'assert type(add(1, 1)) is int' },
];
const LEAK = 'SECRET-HIDDEN-INPUT -7';
const STDOUT = 'print output that must stay on Run';

const run = (status: RunResult['status'], passed: boolean[]): RunResult => ({
  status,
  tests: [...visible, ...hidden].map((t, i) =>
    passed[i] ? { name: t.name, passed: true } : { name: t.name, passed: false, detail: LEAK },
  ),
  output: STDOUT,
  truncated: false,
});

describe('gradeChallenge', () => {
  test('pass = completed and every visible + hidden test passed', () => {
    expect(gradeChallenge(run('completed', [true, true, true]), visible, hidden).status).toBe(
      'passed',
    );
    expect(gradeChallenge(run('completed', [true, true, false]), visible, hidden).status).toBe(
      'failed',
    );
  });

  test('a test the runner never reported is a fail, not a pass by omission', () => {
    const partial: RunResult = {
      ...run('completed', [true]),
      tests: [{ name: 'adds two numbers', passed: true }],
    };
    expect(gradeChallenge(partial, visible, hidden).status).toBe('failed');
  });

  test('a runner timeout or error is errored (refunded), never graded', () => {
    expect(gradeChallenge(run('timeout', []), visible, hidden)).toEqual({ status: 'errored' });
    expect(gradeChallenge(run('error', []), visible, hidden)).toEqual({ status: 'errored' });
  });
});

describe('what leaves the server', () => {
  const graded = gradeChallenge(run('completed', [false, false, false]), visible, hidden);
  if (graded.status === 'errored') throw new Error('expected a graded run');

  test('hidden tests lose their name and detail; stdout is never in the result', () => {
    const rows = toLearnerTests(graded.tests);
    const json = JSON.stringify(rows);
    expect(JSON.stringify(rows.filter((r) => r.hidden))).not.toContain(LEAK);
    expect(json).not.toContain('secret');
    expect(json).not.toContain(STDOUT);
    expect(rows.filter((r) => r.hidden).every((r) => r.detail === undefined)).toBe(true);
    expect(rows.filter((r) => r.hidden).map((r) => r.name)).toEqual([
      'Hidden test 1',
      'Hidden test 2',
    ]);
  });

  test('a visible test keeps its detail, so the learner can fix it', () => {
    expect(toLearnerTests(graded.tests)[0]).toEqual({
      name: 'adds two numbers',
      passed: false,
      hidden: false,
      detail: LEAK,
    });
  });

  test('the stored results hold no detail and no stdout', () => {
    const json = JSON.stringify(toStoredResults(graded));
    expect(json).not.toContain(LEAK);
    expect(json).not.toContain(STDOUT);
  });
});

describe('HP on Submit', () => {
  test('a first attempt with HP left starts; 0 HP is NO_HP before any sandbox', () => {
    expect(decideSubmitStart(false, 0)).toEqual({ ok: true, replay: false });
    expect(decideSubmitStart(false, HP_PER_CHALLENGE)).toMatchObject({ ok: false, code: 'NO_HP' });
  });

  test('a fail costs exactly 1 HP', () => {
    expect(hpAfterSubmit(0, 'failed', false)).toBe(HP_PER_CHALLENGE - 1);
    expect(hpAfterSubmit(0, 'passed', false)).toBe(HP_PER_CHALLENGE);
  });

  test('a runner error refunds the HP (errored is not spent)', () => {
    expect(isHpSpent('errored')).toBe(false);
    expect(hpAfterSubmit(1, 'errored', false)).toBe(HP_PER_CHALLENGE - 1);
  });

  test('a replay costs no HP, even at 0 HP and even when it fails', () => {
    expect(decideSubmitStart(true, HP_PER_CHALLENGE)).toEqual({ ok: true, replay: true });
    expect(hpAfterSubmit(HP_PER_CHALLENGE, 'failed', true)).toBe(HP_PER_CHALLENGE);
  });
});

describe('XP', () => {
  test('a first clear awards the challenge amount from XP_REWARDS', () => {
    expect(xpOutcome(0, XP_REWARDS.challenge)).toEqual({
      awarded: 150,
      total: 150,
      levelBefore: 1,
      levelAfter: 2,
    });
  });

  test('award once: a replay (no xp_events row back) gives 0 XP and no level change', () => {
    expect(xpOutcome(150, 0)).toEqual({ awarded: 0, total: 150, levelBefore: 2, levelAfter: 2 });
  });

  test('boss, challenge and lesson map to their own reasons', () => {
    const boss: ExerciseRef = { area: 'boss', track: 'builder', realm: 0 };
    const chapter = (step: 'lesson' | 'challenge' | 'quick-check'): ExerciseRef => ({
      area: 'chapter',
      track: 'builder',
      realm: 0,
      chapter: 1,
      step,
    });
    expect(clearReason(boss)).toBe('boss');
    expect(clearReason(chapter('challenge'))).toBe('challenge');
    expect(clearReason(chapter('lesson'))).toBe('lesson');
    expect(clearReason(chapter('quick-check'))).toBe('quick-check');
  });
});

describe('caps', () => {
  test('submit 31 in a UTC day is CAP_REACHED { kind: submit }', () => {
    const now = new Date('2026-10-05T12:00:00Z');
    const state = {
      sandboxDay: '2026-10-05',
      runCount: 0,
      submitCount: SUBMIT_DAILY_CAP,
      sandboxPendingAt: null,
    };
    expect(decideGate(state, 'submit', now)).toMatchObject({
      ok: false,
      code: 'CAP_REACHED',
      cap: { kind: 'submit', used: 30, cap: 30, resetsAt: '2026-10-06T00:00:00.000Z' },
    });
    // Run still works at the submit cap.
    expect(decideGate(state, 'run', now).ok).toBe(true);
  });
});

describe('nextChallengeId', () => {
  test('next chapter, then the boss, then nothing', () => {
    const c = (chapter: number): ExerciseRef => ({
      area: 'chapter',
      track: 'builder',
      realm: 2,
      chapter,
      step: 'challenge',
    });
    expect(nextChallengeId(c(1))).toBe('builder/r2/c2/challenge');
    expect(nextChallengeId(c(6))).toBe('builder/r2/boss/challenge');
    expect(nextChallengeId({ area: 'boss', track: 'builder', realm: 2 })).toBeNull();
  });
});
