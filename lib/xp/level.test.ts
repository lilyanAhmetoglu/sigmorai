import { describe, expect, test } from 'bun:test';
import { levelForXp, levelProgress, levelStartXp } from './level';

describe('levelForXp', () => {
  test('follows floor(sqrt(xp / 100))', () => {
    expect(levelForXp(0)).toBe(0);
    expect(levelForXp(99)).toBe(0);
    expect(levelForXp(100)).toBe(1);
    expect(levelForXp(399)).toBe(1);
    expect(levelForXp(400)).toBe(2);
    expect(levelForXp(12480)).toBe(11);
  });

  test('is exact at every level start', () => {
    for (let level = 0; level <= 500; level++) {
      expect(levelForXp(levelStartXp(level))).toBe(level);
      if (level > 0) expect(levelForXp(levelStartXp(level) - 1)).toBe(level - 1);
    }
  });

  test('treats bad input as level 0', () => {
    expect(levelForXp(-50)).toBe(0);
    expect(levelForXp(Number.NaN)).toBe(0);
    expect(levelForXp(Number.POSITIVE_INFINITY)).toBe(0);
  });
});

describe('levelProgress', () => {
  test('a new player is at the start of level 0', () => {
    expect(levelProgress(0)).toEqual({ level: 0, into: 0, span: 100 });
  });

  test('counts XP into the current level', () => {
    expect(levelProgress(150)).toEqual({ level: 1, into: 50, span: 300 });
    expect(levelProgress(400)).toEqual({ level: 2, into: 0, span: 500 });
  });

  test('clamps bad input to zero', () => {
    expect(levelProgress(-10)).toEqual({ level: 0, into: 0, span: 100 });
  });
});
