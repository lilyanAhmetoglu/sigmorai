import { describe, expect, test } from 'bun:test';
import layout from '../../design/assets/levels/layout.json';
import { LEVEL_MAP, levelNodeX } from './level-map';

describe('LEVEL_MAP', () => {
  test('matches the design export (design/assets/levels/layout.json)', () => {
    const { nodes, width, height, groundY } = LEVEL_MAP;
    const ours: typeof layout = { nodes: [...nodes], w: width, h: height, groundY };
    expect(ours).toEqual(layout);
  });

  test('node x is the tile centre at 2×: first 144, boss 1872', () => {
    expect(levelNodeX(0)).toBe(144);
    expect(levelNodeX(LEVEL_MAP.nodes.length - 1)).toBe(1872);
  });
});
