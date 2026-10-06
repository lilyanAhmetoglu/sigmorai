import { describe, expect, test } from 'bun:test';
import { dateLabel } from './date-label';

describe('dateLabel', () => {
  test('day month year, no leading zero', () => {
    expect(dateLabel('2026-10-06')).toBe('6 October 2026');
  });

  test('UTC: the first of the month stays the first', () => {
    expect(dateLabel('2026-01-01')).toBe('1 January 2026');
  });
});
