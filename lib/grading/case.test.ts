import { describe, expect, test } from 'bun:test';
import { HP_PER_CHALLENGE, XP_REWARDS } from '@/lib/constants';
import type { ExerciseRef } from '@/lib/types';
import { clearReason, decideSubmitStart, hpAfterSubmit, nextCaseId, xpOutcome } from './case';

describe('HP on a graded case', () => {
  test('a first attempt with HP left starts; 0 HP is NO_HP', () => {
    expect(decideSubmitStart(false, 0)).toEqual({ ok: true, replay: false });
    expect(decideSubmitStart(false, HP_PER_CHALLENGE)).toMatchObject({ ok: false, code: 'NO_HP' });
  });

  test('a fail costs exactly 1 HP', () => {
    expect(hpAfterSubmit(0, 'failed', false)).toBe(HP_PER_CHALLENGE - 1);
    expect(hpAfterSubmit(0, 'passed', false)).toBe(HP_PER_CHALLENGE);
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
