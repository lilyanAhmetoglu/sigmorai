import { describe, expect, test } from 'bun:test';
import { filledSegments } from './segments';

describe('filledSegments', () => {
  test('rounds to the nearest cell like the design', () => {
    expect(filledSegments(1240, 2000, 20)).toBe(12); // 12.4
    expect(filledSegments(5, 9, 9)).toBe(5);
    expect(filledSegments(1, 40, 20)).toBe(1); // 0.5 rounds up
  });

  test('clamps to the bar', () => {
    expect(filledSegments(0, 100, 20)).toBe(0);
    expect(filledSegments(100, 100, 20)).toBe(20);
    expect(filledSegments(500, 100, 20)).toBe(20);
    expect(filledSegments(-10, 100, 20)).toBe(0);
  });

  test('lights nothing on bad input', () => {
    expect(filledSegments(10, 0, 20)).toBe(0);
    expect(filledSegments(10, -5, 20)).toBe(0);
    expect(filledSegments(Number.NaN, 100, 20)).toBe(0);
    expect(filledSegments(10, 100, 0)).toBe(0);
  });
});
