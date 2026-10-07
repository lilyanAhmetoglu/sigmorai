import { describe, expect, test } from 'bun:test';
import { HP_PER_CHALLENGE, QUICK_CHECK_DAILY_TRIES, XP_REWARDS } from '@/lib/constants';
import type { ExerciseRef } from '@/lib/types';
import { parseExerciseId } from '@/lib/content/ids';
import {
  clearReason,
  decideSubmitStart,
  gradedKind,
  hpAfterSubmit,
  hpNow,
  nextCaseId,
  storesAttempt,
  triesLeft,
  xpOutcome,
} from './case';

describe('HP on a graded case', () => {
  test('a first attempt with HP left starts; 0 HP is NO_HP', () => {
    expect(decideSubmitStart('case', false, 0, 0)).toEqual({ ok: true, replay: false });
    expect(decideSubmitStart('case', false, HP_PER_CHALLENGE, 0)).toMatchObject({
      ok: false,
      code: 'NO_HP',
    });
  });

  test('a fail costs exactly 1 HP', () => {
    expect(hpAfterSubmit('case', 0, 'failed', false)).toBe(HP_PER_CHALLENGE - 1);
    expect(hpAfterSubmit('case', 0, 'passed', false)).toBe(HP_PER_CHALLENGE);
  });

  test('a replay costs no HP, even at 0 HP and even when it fails', () => {
    expect(decideSubmitStart('case', true, HP_PER_CHALLENGE, 0)).toEqual({
      ok: true,
      replay: true,
    });
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
    expect(decideSubmitStart('quick-check', false, HP_PER_CHALLENGE + 5, 0)).toEqual({
      ok: true,
      replay: false,
    });
    expect(hpAfterSubmit('quick-check', 0, 'failed', false)).toBeNull();
  });
});

describe('quick-check daily tries (SIG-27)', () => {
  test('the last try under the cap starts; at the cap it is NO_TRIES', () => {
    expect(decideSubmitStart('quick-check', false, 0, QUICK_CHECK_DAILY_TRIES - 1)).toEqual({
      ok: true,
      replay: false,
    });
    expect(decideSubmitStart('quick-check', false, 0, QUICK_CHECK_DAILY_TRIES)).toMatchObject({
      ok: false,
      code: 'NO_TRIES',
    });
    expect(decideSubmitStart('quick-check', false, 0, QUICK_CHECK_DAILY_TRIES + 3)).toMatchObject({
      code: 'NO_TRIES',
    });
  });

  test('triesLeft counts down and floors at 0', () => {
    expect(triesLeft(0)).toBe(QUICK_CHECK_DAILY_TRIES);
    expect(triesLeft(QUICK_CHECK_DAILY_TRIES - 1)).toBe(1);
    expect(triesLeft(QUICK_CHECK_DAILY_TRIES + 4)).toBe(0);
  });

  test('a replay of a cleared quick check is never capped', () => {
    expect(decideSubmitStart('quick-check', true, 0, QUICK_CHECK_DAILY_TRIES * 2)).toEqual({
      ok: true,
      replay: true,
    });
  });

  test('cases are limited by HP, not by tries', () => {
    expect(decideSubmitStart('case', false, 0, QUICK_CHECK_DAILY_TRIES)).toEqual({
      ok: true,
      replay: false,
    });
  });
});

describe('storesAttempt (SIG-27)', () => {
  test('a first-time attempt writes a submissions row; a replay does not', () => {
    expect(storesAttempt(false)).toBe(true);
    expect(storesAttempt(true)).toBe(false);
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

  test('a Math Tower quick check is a quick check; its lesson is not graded', () => {
    expect(kind('math/f1/quick-check')).toBe('quick-check');
    expect(kind('math/f8/quick-check')).toBe('quick-check');
    expect(kind('math/f1/lesson')).toBeNull();
  });

  test('a Frontier quick check is a quick check; its lesson is not graded', () => {
    expect(kind('frontier/2026-10-05-some-slug/quick-check')).toBe('quick-check');
    expect(kind('frontier/2026-10-05-some-slug/lesson')).toBeNull();
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

  test('a Math Tower lesson and quick check map to lesson and quick-check', () => {
    expect(clearReason({ area: 'math', floor: 2, step: 'lesson' })).toBe('lesson');
    expect(clearReason({ area: 'math', floor: 2, step: 'quick-check' })).toBe('quick-check');
  });

  test('a Frontier lesson and quick check earn the usual lesson and quick-check XP', () => {
    const at = { area: 'frontier', date: '2026-10-05', slug: 'some-slug' } as const;
    expect(clearReason({ ...at, step: 'lesson' })).toBe('lesson');
    expect(clearReason({ ...at, step: 'quick-check' })).toBe('quick-check');
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

  test('a 9-chapter realm: c6 leads to c7, c9 to the boss', () => {
    const c = (chapter: number): ExerciseRef => ({
      area: 'chapter',
      track: 'creator',
      realm: 1,
      chapter,
      step: 'challenge',
    });
    expect(nextCaseId(c(6), 9)).toBe('creator/r1/c7/challenge');
    expect(nextCaseId(c(9), 9)).toBe('creator/r1/boss/challenge');
  });

  test('a Math Tower floor opens no case', () => {
    expect(nextCaseId({ area: 'math', floor: 1, step: 'quick-check' })).toBeNull();
  });
});
