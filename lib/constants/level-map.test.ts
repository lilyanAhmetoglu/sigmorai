import { describe, expect, test } from 'bun:test';
import layout from '../../design/assets/levels/layout.json';
import { MAX_CHAPTERS, MIN_CHAPTERS } from './exercises';
import { LEVEL_MAP, levelNodeColumns, levelNodeGap, levelNodeX } from './level-map';

describe('LEVEL_MAP', () => {
  test('matches the design export (design/assets/levels/layout.json)', () => {
    const { nodes, width, height, groundY } = LEVEL_MAP;
    const ours: typeof layout = { nodes: [...nodes], w: width, h: height, groundY };
    expect(ours).toEqual(layout);
  });
});

describe('level map nodes', () => {
  test('6 chapters: the design columns exactly, first 144, boss 1872', () => {
    expect(levelNodeColumns(MIN_CHAPTERS)).toEqual([...LEVEL_MAP.nodes]);
    expect(levelNodeX(0, MIN_CHAPTERS)).toBe(144);
    expect(levelNodeX(MIN_CHAPTERS, MIN_CHAPTERS)).toBe(1872);
    expect(levelNodeGap(MIN_CHAPTERS)).toBe(224);
  });

  test('12 chapters: 13 nodes, evenly spaced, inside the design first-to-boss span', () => {
    const xs = Array.from({ length: MAX_CHAPTERS + 1 }, (_, i) => levelNodeX(i, MAX_CHAPTERS));
    expect(xs[0]).toBe(144);
    expect(xs.at(-1)).toBe(1872);
    expect(new Set(xs.slice(1).map((x, i) => x - xs[i]))).toEqual(new Set([144]));
    expect(levelNodeGap(MAX_CHAPTERS)).toBe(144);
  });

  test('every count from 6 to 12 fits: increasing, on whole art pixels, never closer than 12 chapters (144px)', () => {
    for (let n = MIN_CHAPTERS; n <= MAX_CHAPTERS; n++) {
      const xs = Array.from({ length: n + 1 }, (_, i) => levelNodeX(i, n));
      expect(xs[0]).toBe(144);
      expect(xs.at(-1)).toBe(1872);
      for (const x of xs) expect(x % LEVEL_MAP.scale).toBe(0);
      expect(levelNodeGap(n)).toBeGreaterThanOrEqual(levelNodeGap(MAX_CHAPTERS));
    }
  });
});
