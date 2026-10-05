import { describe, expect, test } from 'bun:test';
import { rovingIndex } from './roving-index';

describe('rovingIndex', () => {
  test.each([
    ['ArrowRight', 0, 3, 1],
    ['ArrowRight', 2, 3, 0],
    ['ArrowLeft', 0, 3, 2],
    ['ArrowLeft', 2, 3, 1],
    ['Home', 2, 3, 0],
    ['End', 0, 3, 2],
    ['Enter', 1, 3, null],
    ['ArrowRight', 0, 0, null],
  ] as const)('%s from %i of %i → %p', (key, current, count, expected) => {
    expect(rovingIndex(key, current, count)).toBe(expected);
  });
});
