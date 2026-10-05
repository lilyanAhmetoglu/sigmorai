import { describe, expect, test } from 'bun:test';
import { nextUtcDayStart, utcDayKey, utcDayNumber, utcDayStart } from './day';

const at = (iso: string) => new Date(iso);

describe('UTC day helpers', () => {
  test('the day changes exactly at 00:00 UTC', () => {
    const before = at('2026-10-05T23:59:59.999Z');
    const after = at('2026-10-06T00:00:00.000Z');
    expect(utcDayNumber(after) - utcDayNumber(before)).toBe(1);
    expect(utcDayKey(before)).toBe('2026-10-05');
    expect(utcDayKey(after)).toBe('2026-10-06');
  });

  test('day start and next day start', () => {
    const now = at('2026-10-05T13:45:00Z');
    expect(utcDayStart(now).toISOString()).toBe('2026-10-05T00:00:00.000Z');
    expect(nextUtcDayStart(now).toISOString()).toBe('2026-10-06T00:00:00.000Z');
  });
});
