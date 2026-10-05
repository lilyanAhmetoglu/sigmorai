import { describe, expect, test } from 'bun:test';
import { AVATAR_GRID } from '@/lib/constants';
import { avatarSprite, hashSeed } from './avatar';

describe('avatarSprite', () => {
  // Pinned output: changing the hash or LCG maths would give every user a new face.
  test('draws the same sprite as before for a known seed', () => {
    expect(hashSeed('nora')).toMatchSnapshot();
    expect(avatarSprite('nora', 5)).toMatchSnapshot();
  });

  test('is deterministic per seed', () => {
    expect(avatarSprite('nora', 5)).toEqual(avatarSprite('nora', 5));
    expect(hashSeed('nora')).not.toBe(hashSeed('nore'));
  });

  test('is mirrored left-right', () => {
    const { cells } = avatarSprite('nora', 5);
    const key = (x: number, y: number) => `${x},${y}`;
    const lit = new Map(cells.map((c) => [key(c.x, c.y), c.tone]));
    for (const c of cells) {
      expect(lit.get(key(AVATAR_GRID - 1 - c.x, c.y))).toBe(c.tone);
    }
  });

  test('keeps the top and bottom rows empty and stays in the grid', () => {
    const { cells } = avatarSprite('player', 5);
    expect(cells.length).toBeGreaterThan(0);
    for (const c of cells) {
      expect(c.y).toBeGreaterThan(0);
      expect(c.y).toBeLessThan(AVATAR_GRID - 1);
      expect(c.x).toBeGreaterThanOrEqual(0);
      expect(c.x).toBeLessThan(AVATAR_GRID);
    }
  });

  test('picks a palette in range', () => {
    for (const seed of ['a', 'b', 'nora', 'player', '日本']) {
      const { palette } = avatarSprite(seed, 5);
      expect(palette).toBeGreaterThanOrEqual(0);
      expect(palette).toBeLessThan(5);
    }
    expect(avatarSprite('a', 0).palette).toBe(0);
  });
});
