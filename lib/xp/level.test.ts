import { describe, expect, test } from 'bun:test';
import { levelForXp, levelProgress, levelStartXp } from './level';

describe('levelStartXp', () => {
  test('LV n starts at 100 × (n − 1)²', () => {
    expect(levelStartXp(1)).toBe(0);
    expect(levelStartXp(2)).toBe(100);
    expect(levelStartXp(3)).toBe(400);
    expect(levelStartXp(12)).toBe(12100);
  });

  test('a level below LV 1 starts at 0', () => {
    expect(levelStartXp(0)).toBe(0);
    expect(levelStartXp(-3)).toBe(0);
  });
});

describe('levelForXp', () => {
  test('follows floor(sqrt(xp / 100)) + 1', () => {
    expect(levelForXp(0)).toBe(1);
    expect(levelForXp(99)).toBe(1);
    expect(levelForXp(100)).toBe(2);
    expect(levelForXp(399)).toBe(2);
    expect(levelForXp(400)).toBe(3);
    expect(levelForXp(12480)).toBe(12);
  });

  test('is exact at every level start', () => {
    for (let level = 1; level <= 500; level++) {
      expect(levelForXp(levelStartXp(level))).toBe(level);
      if (level > 1) expect(levelForXp(levelStartXp(level) - 1)).toBe(level - 1);
    }
  });

  test('treats bad input as LV 1', () => {
    expect(levelForXp(-50)).toBe(1);
    expect(levelForXp(Number.NaN)).toBe(1);
    expect(levelForXp(Number.POSITIVE_INFINITY)).toBe(1);
  });
});

describe('levelProgress', () => {
  test('a new player is at the start of LV 1', () => {
    expect(levelProgress(0)).toEqual({ level: 1, into: 0, span: 100 });
  });

  test('counts XP into the current level', () => {
    expect(levelProgress(150)).toEqual({ level: 2, into: 50, span: 300 });
    expect(levelProgress(400)).toEqual({ level: 3, into: 0, span: 500 });
  });

  test('clamps bad input to zero XP', () => {
    expect(levelProgress(-10)).toEqual({ level: 1, into: 0, span: 100 });
  });
});
