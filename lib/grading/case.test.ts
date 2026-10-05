import { describe, expect, test } from 'bun:test';
import { HP_PER_CHALLENGE, XP_REWARDS } from '@/lib/constants';
import type { ExerciseRef } from '@/lib/types';
import { parseExerciseId } from '@/lib/content/ids';
import {
  clearReason,
  decideSubmitStart,
  gradedKind,
  hpAfterSubmit,
  hpNow,
  nextCaseId,
  xpOutcome,
} from './case';

describe('HP on a graded case', () => {
  test('a first attempt with HP left starts; 0 HP is NO_HP', () => {
    expect(decideSubmitStart('case', false, 0)).toEqual({ ok: true, replay: false });
    expect(decideSubmitStart('case', false, HP_PER_CHALLENGE)).toMatchObject({
      ok: false,
      code: 'NO_HP',
    });
  });

  test('a fail costs exactly 1 HP', () => {
    expect(hpAfterSubmit('case', 0, 'failed', false)).toBe(HP_PER_CHALLENGE - 1);
    expect(hpAfterSubmit('case', 0, 'passed', false)).toBe(HP_PER_CHALLENGE);
  });

  test('a replay costs no HP, even at 0 HP and even when it fails', () => {
    expect(decideSubmitStart('case', true, HP_PER_CHALLENGE)).toEqual({ ok: true, replay: true });
    expect(hpAfterSubmit('case', HP_PER_CHALLENGE, 'failed', true)).toBe(HP_PER_CHALLENGE);
  });
});

describe('hpNow', () => {
  test('a case: HP left today, floored at 0; full when cleared', () => {
    expect(hpNow('case', false, 0)).toBe(HP_PER_CHALLENGE);
    expect(hpNow('case', false, 1)).toBe(HP_PER_CHALLENGE - 1);
    expect(hpNow('case', false, HP_PER_CHALLENGE + 2)).toBe(0);
    expect(hpNow('case', true, HP_PER_CHALLENGE)).toBe(HP_PER_CHALLENGE);
  });

  test('a quick check has no HP', () => {
    expect(hpNow('quick-check', false, 0)).toBeNull();
  });
});

describe('HP on a quick check', () => {
  test('costs nothing: never NO_HP, and no HP value', () => {
    expect(decideSubmitStart('quick-check', false, HP_PER_CHALLENGE + 5)).toEqual({
      ok: true,
      replay: false,
    });
    expect(hpAfterSubmit('quick-check', 0, 'failed', false)).toBeNull();
  });
});

describe('gradedKind', () => {
  const kind = (id: string) => gradedKind(parseExerciseId(id)!);
  test('chapter and boss challenges are cases; quick checks are quick checks', () => {
    expect(kind('builder/r0/c1/challenge')).toBe('case');
    expect(kind('strategist/r2/boss/challenge')).toBe('case');
    expect(kind('strategist/r0/c1/quick-check')).toBe('quick-check');
    expect(kind('builder/r0/c1/lesson')).toBeNull();
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

describe('nextCaseId', () => {
  test('next chapter, then the boss, then nothing', () => {
    const c = (chapter: number): ExerciseRef => ({
      area: 'chapter',
      track: 'strategist',
      realm: 2,
      chapter,
      step: 'challenge',
    });
    expect(nextCaseId(c(1))).toBe('strategist/r2/c2/challenge');
    expect(nextCaseId(c(6))).toBe('strategist/r2/boss/challenge');
    expect(nextCaseId({ area: 'boss', track: 'strategist', realm: 2 })).toBeNull();
  });
});
