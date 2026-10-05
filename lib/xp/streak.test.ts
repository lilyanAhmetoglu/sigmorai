import { describe, expect, test } from 'bun:test';
import { nextStreak } from './streak';

const at = (iso: string) => new Date(iso);

describe('nextStreak', () => {
  test('first pass ever starts the streak at 1', () => {
    expect(nextStreak(0, null, at('2026-10-05T10:00:00Z'))).toBe(1);
  });

  test('same UTC day: no change', () => {
    expect(nextStreak(4, at('2026-10-05T00:00:00Z'), at('2026-10-05T23:59:59Z'))).toBe(4);
  });

  test('across midnight UTC: +1, even one second later', () => {
    expect(nextStreak(4, at('2026-10-05T23:59:59Z'), at('2026-10-06T00:00:00Z'))).toBe(5);
  });

  test('a missed day resets to 1', () => {
    expect(nextStreak(9, at('2026-10-03T12:00:00Z'), at('2026-10-05T12:00:00Z'))).toBe(1);
  });

  test('same day with a 0 streak still counts this pass', () => {
    expect(nextStreak(0, at('2026-10-05T01:00:00Z'), at('2026-10-05T02:00:00Z'))).toBe(1);
  });

  test('clock skew (last active in the future) is treated as the same day', () => {
    expect(nextStreak(3, at('2026-10-06T00:00:01Z'), at('2026-10-05T23:59:59Z'))).toBe(3);
  });
});
