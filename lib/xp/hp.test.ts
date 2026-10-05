import { describe, expect, test } from 'bun:test';
import { HP_PER_CHALLENGE } from '@/lib/constants';
import type { SubmissionStatus } from '@/lib/types';
import { hpLeft, hpSpentToday, isHpSpent } from './hp';

const at = (iso: string) => new Date(iso);
const attempt = (status: SubmissionStatus, iso: string) => ({ status, createdAt: at(iso) });

describe('isHpSpent', () => {
  test('pending and failed cost HP; passed and errored do not', () => {
    expect(isHpSpent('pending')).toBe(true);
    expect(isHpSpent('failed')).toBe(true);
    expect(isHpSpent('passed')).toBe(false);
    expect(isHpSpent('errored')).toBe(false);
  });
});

describe('hpSpentToday', () => {
  const now = at('2026-10-05T12:00:00Z');

  test('counts failed + pending today; errored is refunded', () => {
    const rows = [
      attempt('failed', '2026-10-05T01:00:00Z'),
      attempt('pending', '2026-10-05T02:00:00Z'),
      attempt('errored', '2026-10-05T03:00:00Z'),
      attempt('passed', '2026-10-05T04:00:00Z'),
    ];
    expect(hpSpentToday(rows, now)).toBe(2);
  });

  test('refills at the UTC day boundary', () => {
    const rows = [
      attempt('failed', '2026-10-04T23:59:59.999Z'),
      attempt('failed', '2026-10-04T10:00:00Z'),
      attempt('failed', '2026-10-05T00:00:00Z'),
    ];
    expect(hpSpentToday(rows, now)).toBe(1);
    expect(hpSpentToday(rows, at('2026-10-04T23:59:59.999Z'))).toBe(3);
  });
});

describe('hpLeft', () => {
  test('full, partial and floored at 0', () => {
    expect(hpLeft(0)).toBe(HP_PER_CHALLENGE);
    expect(hpLeft(1)).toBe(HP_PER_CHALLENGE - 1);
    expect(hpLeft(HP_PER_CHALLENGE)).toBe(0);
    expect(hpLeft(HP_PER_CHALLENGE + 2)).toBe(0);
  });
});
