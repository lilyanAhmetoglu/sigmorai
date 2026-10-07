import { describe, expect, test } from 'bun:test';
import { MIN_CHAPTERS, REALMS } from '@/lib/constants';
import { parseExerciseId } from '@/lib/content/ids';
import type { ExerciseRef } from '@/lib/types';
import { SPECIALIST_REALMS } from '@/lib/content/__fixtures__/realms';
import { decideOpen, ownClear, requiredClears } from './open';

const ref = (id: string): ExerciseRef => {
  const parsed = parseExerciseId(id);
  if (!parsed) throw new Error(`bad test id ${id}`);
  return parsed;
};
const NONE = new Set<string>();
/** Every realm has MIN_CHAPTERS chapters in today's outlines. */
const N = MIN_CHAPTERS;
const allChallenges = (track: string, realm: number) =>
  new Set(Array.from({ length: N }, (_, i) => `${track}/r${realm}/c${i + 1}/challenge`));

describe('tier', () => {
  const advanced = REALMS.find((r) => r.tier === 'advanced')!.id;

  test('an advanced realm is TIER_LOCKED, even chapter 1', () => {
    const result = decideOpen(ref(`builder/r${advanced}/c1/challenge`), NONE, N);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('TIER_LOCKED');
  });

  test('tier is checked before order', () => {
    const result = decideOpen(ref(`builder/r${advanced}/c3/challenge`), NONE, N);
    if (!result.ok) expect(result.code).toBe('TIER_LOCKED');
  });

  test('beginner and intermediate realms open chapter 1', () => {
    expect(decideOpen(ref('builder/r0/c1/challenge'), NONE, N).ok).toBe(true);
    expect(decideOpen(ref('strategist/r3/c1/lesson'), NONE, N).ok).toBe(true);
  });
});

describe('chapter order', () => {
  test('chapter N needs chapter N−1 challenge cleared', () => {
    const result = decideOpen(ref('builder/r0/c3/challenge'), NONE, N);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('NOT_OPEN');
      expect(result.message).toBe('Clear chapter 2 first.');
    }
    const cleared = new Set(['builder/r0/c2/challenge']);
    expect(decideOpen(ref('builder/r0/c3/challenge'), cleared, N).ok).toBe(true);
  });

  test('every step of an open chapter is open', () => {
    const cleared = new Set(['builder/r0/c1/challenge']);
    for (const step of ['lesson', 'challenge', 'quick-check']) {
      expect(decideOpen(ref(`builder/r0/c2/${step}`), cleared, N).ok).toBe(true);
    }
  });

  test('order is per track: the other track’s clear does not count', () => {
    const cleared = new Set(['strategist/r0/c1/challenge']);
    expect(decideOpen(ref('builder/r0/c2/challenge'), cleared, N).ok).toBe(false);
  });

  test('a lesson or quick check clear is not enough', () => {
    const cleared = new Set(['builder/r0/c1/lesson', 'builder/r0/c1/quick-check']);
    expect(decideOpen(ref('builder/r0/c2/challenge'), cleared, N).ok).toBe(false);
  });
});

describe('boss', () => {
  test('needs all chapter challenges', () => {
    expect(requiredClears(ref('builder/r1/boss/challenge'), N)).toHaveLength(N);
    const five = allChallenges('builder', 1);
    five.delete(`builder/r1/c${N}/challenge`);
    const result = decideOpen(ref('builder/r1/boss/challenge'), five, N);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('NOT_OPEN');
    expect(decideOpen(ref('builder/r1/boss/challenge'), allChallenges('builder', 1), N).ok).toBe(
      true,
    );
  });
});

describe('chapter count from the outline (path-curriculum spec, 2026-10-07)', () => {
  const NINE = 9;
  const nine = (track: string, realm: number) =>
    new Set(Array.from({ length: NINE }, (_, i) => `${track}/r${realm}/c${i + 1}/challenge`));

  test('the boss of a 9-chapter realm needs c1–c9', () => {
    const boss = ref('creator/r1/boss/challenge');
    expect(requiredClears(boss, NINE)).toEqual([...nine('creator', 1)]);
    const result = decideOpen(boss, allChallenges('creator', 1), NINE);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('NOT_OPEN');
      expect(result.message).toBe('Clear all 9 chapters first.');
    }
    expect(decideOpen(boss, nine('creator', 1), NINE).ok).toBe(true);
  });

  test('c7–c9 of a 9-chapter realm follow the usual order', () => {
    expect(decideOpen(ref('creator/r1/c7/lesson'), allChallenges('creator', 1), NINE).ok).toBe(
      true,
    );
    expect(decideOpen(ref('creator/r1/c8/lesson'), allChallenges('creator', 1), NINE).ok).toBe(
      false,
    );
  });

  test('a chapter past the outline count is INVALID_INPUT, never NOT_OPEN', () => {
    for (const id of ['builder/r0/c7/challenge', 'builder/r0/c12/lesson']) {
      const result = decideOpen(ref(id), NONE, N);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.code).toBe('INVALID_INPUT');
    }
    // Even with every case before it (and its own) cleared.
    const everything = new Set([...nine('builder', 0)]);
    const result = decideOpen(ref('builder/r0/c7/challenge'), everything, N);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('INVALID_INPUT');
  });

  test('INVALID_INPUT comes before the tier lock', () => {
    const advanced = REALMS.find((r) => r.tier === 'advanced')!.id;
    const result = decideOpen(ref(`builder/r${advanced}/c7/lesson`), NONE, N);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('INVALID_INPUT');
  });
});

describe('Math Tower', () => {
  test('floor 1 is open with nothing cleared', () => {
    expect(requiredClears(ref('math/f1/lesson'), N)).toEqual([]);
    expect(decideOpen(ref('math/f1/lesson'), NONE, N).ok).toBe(true);
    expect(decideOpen(ref('math/f1/quick-check'), NONE, N).ok).toBe(true);
  });

  test('floor 2 needs the floor 1 quick check', () => {
    expect(requiredClears(ref('math/f2/lesson'), N)).toEqual(['math/f1/quick-check']);
    const result = decideOpen(ref('math/f2/lesson'), NONE, N);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('NOT_OPEN');
      expect(result.message).toBe('Clear floor 1 first.');
    }
    const cleared = new Set(['math/f1/quick-check']);
    expect(decideOpen(ref('math/f2/lesson'), cleared, N).ok).toBe(true);
    expect(decideOpen(ref('math/f2/quick-check'), cleared, N).ok).toBe(true);
  });

  test('the floor 1 lesson alone is not enough', () => {
    const result = decideOpen(ref('math/f2/quick-check'), new Set(['math/f1/lesson']), N);
    expect(result.ok).toBe(false);
  });

  test('a realm clear does not open a floor', () => {
    const cleared = new Set(['builder/r0/c1/quick-check', 'strategist/r0/c1/challenge']);
    expect(decideOpen(ref('math/f2/lesson'), cleared, N).ok).toBe(false);
  });
});

describe('Frontier', () => {
  test('every chapter is open, lesson and quick check, with nothing cleared', () => {
    for (const id of [
      'frontier/2026-10-05-some-slug/lesson',
      'frontier/2026-10-05-some-slug/quick-check',
      'frontier/2020-01-01-old-slug/quick-check',
    ]) {
      expect(decideOpen(ref(id), NONE, N)).toEqual({ ok: true, ref: ref(id) });
    }
  });

  test('needs no clear before it; its own clear is the step itself', () => {
    const quick = ref('frontier/2026-10-05-some-slug/quick-check');
    expect(requiredClears(quick, N)).toEqual([]);
    expect(ownClear(quick)).toBe('frontier/2026-10-05-some-slug/quick-check');
  });
});

describe('a cleared or credited chapter is always open (shared chapters)', () => {
  const credited = new Set(['strategist/r0/c4/challenge']);

  test('every step of a chapter whose case is cleared opens, even with chapter N−1 not done', () => {
    expect(decideOpen(ref('strategist/r0/c4/challenge'), credited, N).ok).toBe(true);
    expect(decideOpen(ref('strategist/r0/c4/lesson'), credited, N).ok).toBe(true);
    expect(decideOpen(ref('strategist/r0/c4/quick-check'), credited, N).ok).toBe(true);
  });

  test('the chapter after it opens; the one before stays locked', () => {
    expect(decideOpen(ref('strategist/r0/c5/lesson'), credited, N).ok).toBe(true);
    expect(decideOpen(ref('strategist/r0/c3/lesson'), credited, N).ok).toBe(false);
  });

  test('the tier lock still wins', () => {
    const advanced = REALMS.find((r) => r.tier === 'advanced')!.id;
    const id = `builder/r${advanced}/c2/challenge`;
    expect(decideOpen(ref(id), new Set([id]), N).ok).toBe(false);
  });

  test('ownClear: a chapter step maps to its case; a boss or floor to itself', () => {
    expect(ownClear(ref('builder/r1/c2/lesson'))).toBe('builder/r1/c2/challenge');
    expect(ownClear(ref('builder/r1/boss/challenge'))).toBe('builder/r1/boss/challenge');
    expect(ownClear(ref('math/f2/lesson'))).toBe('math/f2/lesson');
  });
});

describe('specialist realms (fixture table: r9 creator, r10 builder)', () => {
  const T = SPECIALIST_REALMS;
  const fixtureRef = (id: string): ExerciseRef => parseExerciseId(id, T)!;

  test('the owner track opens chapter 1; the boss needs every chapter case', () => {
    expect(decideOpen(fixtureRef('creator/r9/c1/lesson'), NONE, N, T).ok).toBe(true);
    const boss = fixtureRef('creator/r9/boss/challenge');
    expect(requiredClears(boss, N, T)).toEqual([...allChallenges('creator', 9)]);
    expect(decideOpen(boss, NONE, N, T).ok).toBe(false);
    expect(decideOpen(boss, allChallenges('creator', 9), N, T).ok).toBe(true);
  });

  test('a hand-built ref for a realm the track does not have is INVALID_INPUT', () => {
    const wrong: ExerciseRef = {
      area: 'chapter',
      track: 'builder',
      realm: 9,
      chapter: 1,
      step: 'lesson',
    };
    const result = decideOpen(wrong, NONE, N, T);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('INVALID_INPUT');
  });
});
