import { describe, expect, test } from 'bun:test';
import { CHAPTER_COUNT, REALMS } from '@/lib/constants';
import { parseExerciseId } from '@/lib/content/ids';
import type { ExerciseRef } from '@/lib/types';
import { decideOpen, requiredClears } from './open';

const ref = (id: string): ExerciseRef => {
  const parsed = parseExerciseId(id);
  if (!parsed) throw new Error(`bad test id ${id}`);
  return parsed;
};
const NONE = new Set<string>();
const allChallenges = (track: string, realm: number) =>
  new Set(
    Array.from({ length: CHAPTER_COUNT }, (_, i) => `${track}/r${realm}/c${i + 1}/challenge`),
  );

describe('tier', () => {
  const advanced = REALMS.find((r) => r.tier === 'advanced')!.id;

  test('an advanced realm is TIER_LOCKED, even chapter 1', () => {
    const result = decideOpen(ref(`builder/r${advanced}/c1/challenge`), NONE);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('TIER_LOCKED');
  });

  test('tier is checked before order', () => {
    const result = decideOpen(ref(`builder/r${advanced}/c3/challenge`), NONE);
    if (!result.ok) expect(result.code).toBe('TIER_LOCKED');
  });

  test('beginner and intermediate realms open chapter 1', () => {
    expect(decideOpen(ref('builder/r0/c1/challenge'), NONE).ok).toBe(true);
    expect(decideOpen(ref('strategist/r3/c1/lesson'), NONE).ok).toBe(true);
  });
});

describe('chapter order', () => {
  test('chapter N needs chapter N−1 challenge cleared', () => {
    const result = decideOpen(ref('builder/r0/c3/challenge'), NONE);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('NOT_OPEN');
      expect(result.message).toBe('Clear chapter 2 first.');
    }
    const cleared = new Set(['builder/r0/c2/challenge']);
    expect(decideOpen(ref('builder/r0/c3/challenge'), cleared).ok).toBe(true);
  });

  test('every step of an open chapter is open', () => {
    const cleared = new Set(['builder/r0/c1/challenge']);
    for (const step of ['lesson', 'challenge', 'quick-check']) {
      expect(decideOpen(ref(`builder/r0/c2/${step}`), cleared).ok).toBe(true);
    }
  });

  test('order is per track: the other track’s clear does not count', () => {
    const cleared = new Set(['strategist/r0/c1/challenge']);
    expect(decideOpen(ref('builder/r0/c2/challenge'), cleared).ok).toBe(false);
  });

  test('a lesson or quick check clear is not enough', () => {
    const cleared = new Set(['builder/r0/c1/lesson', 'builder/r0/c1/quick-check']);
    expect(decideOpen(ref('builder/r0/c2/challenge'), cleared).ok).toBe(false);
  });
});

describe('boss', () => {
  test('needs all chapter challenges', () => {
    expect(requiredClears(ref('builder/r1/boss/challenge'))).toHaveLength(CHAPTER_COUNT);
    const five = allChallenges('builder', 1);
    five.delete(`builder/r1/c${CHAPTER_COUNT}/challenge`);
    const result = decideOpen(ref('builder/r1/boss/challenge'), five);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('NOT_OPEN');
    expect(decideOpen(ref('builder/r1/boss/challenge'), allChallenges('builder', 1)).ok).toBe(true);
  });
});

describe('side areas', () => {
  test('Math Tower and Frontier are not handled yet (step 6)', () => {
    const result = decideOpen(ref('math/f1/quick-check'), NONE);
    if (!result.ok) expect(result.code).toBe('INVALID_INPUT');
    expect(result.ok).toBe(false);
  });
});
