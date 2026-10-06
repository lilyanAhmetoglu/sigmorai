import { describe, expect, test } from 'bun:test';
import { isActiveToday, nextStreak, shownStreak } from './streak';

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

describe('shownStreak', () => {
  test('last pass today: the stored value', () => {
    expect(shownStreak(5, at('2026-10-05T08:00:00Z'), at('2026-10-05T20:00:00Z'))).toBe(5);
  });

  test('last pass yesterday: the stored value (still alive)', () => {
    expect(shownStreak(5, at('2026-10-04T08:00:00Z'), at('2026-10-05T20:00:00Z'))).toBe(5);
  });

  test('last pass two days ago: 0', () => {
    expect(shownStreak(5, at('2026-10-03T23:59:59Z'), at('2026-10-05T00:00:00Z'))).toBe(0);
  });

  test('never active: 0', () => {
    expect(shownStreak(0, null, at('2026-10-05T12:00:00Z'))).toBe(0);
  });

  test('around midnight UTC: one second can be a full day', () => {
    // 23:59:59 on the 4th → 00:00:00 on the 6th is two UTC days: broken.
    expect(shownStreak(3, at('2026-10-04T23:59:59Z'), at('2026-10-06T00:00:00Z'))).toBe(0);
    // 00:00:00 on the 4th → 23:59:59 on the 5th is one UTC day: alive.
    expect(shownStreak(3, at('2026-10-04T00:00:00Z'), at('2026-10-05T23:59:59Z'))).toBe(3);
  });

  test('clock skew (last active in the future) counts as today', () => {
    expect(shownStreak(3, at('2026-10-06T00:00:01Z'), at('2026-10-05T23:59:59Z'))).toBe(3);
  });
});

describe('isActiveToday', () => {
  test('a pass earlier this UTC day: true', () => {
    expect(isActiveToday(at('2026-10-05T00:00:00Z'), at('2026-10-05T23:59:59Z'))).toBe(true);
  });

  test('a pass yesterday, one second before midnight UTC: false', () => {
    expect(isActiveToday(at('2026-10-04T23:59:59Z'), at('2026-10-05T00:00:00Z'))).toBe(false);
  });

  test('never active: false', () => {
    expect(isActiveToday(null, at('2026-10-05T12:00:00Z'))).toBe(false);
  });
});
