import { describe, expect, test } from 'bun:test';
import type { RankedPlayer } from '@/lib/types';
import {
  movesLeaderboard,
  numberInOrder,
  parseLeaderboardRange,
  rangeCutoff,
  toLeaderboardRow,
} from './leaderboard';

const at = (iso: string) => new Date(iso);

describe('parseLeaderboardRange', () => {
  test.each(['week', 'month', 'all'] as const)('keeps %p', (range) => {
    expect(parseLeaderboardRange(range)).toBe(range);
  });

  // Wrapped in one-item tuples: test.each spreads a bare array case into arguments.
  const fallbacks: [string | string[] | undefined][] = [
    [undefined],
    [''],
    ['WEEK'],
    ['year'],
    ['all '],
    [['week', 'month']],
    [[]],
  ];
  test.each(fallbacks)('falls back to all for %p', (value) => {
    expect(parseLeaderboardRange(value)).toBe('all');
  });
});

describe('rangeCutoff', () => {
  const now = at('2026-10-06T13:45:00Z');

  test('all time has no cutoff', () => {
    expect(rangeCutoff('all', now)).toBeNull();
  });

  test('week = 00:00 UTC six days ago (7 UTC days incl. today)', () => {
    expect(rangeCutoff('week', now)?.toISOString()).toBe('2026-09-30T00:00:00.000Z');
  });

  test('month = 00:00 UTC 29 days ago (30 UTC days incl. today)', () => {
    expect(rangeCutoff('month', now)?.toISOString()).toBe('2026-09-07T00:00:00.000Z');
  });

  test('the cutoff moves exactly at 00:00 UTC', () => {
    const before = rangeCutoff('week', at('2026-10-06T23:59:59.999Z'));
    const after = rangeCutoff('week', at('2026-10-07T00:00:00.000Z'));
    expect(before?.toISOString()).toBe('2026-09-30T00:00:00.000Z');
    expect(after?.toISOString()).toBe('2026-10-01T00:00:00.000Z');
  });

  test('the same all day, so the cache key is stable', () => {
    expect(rangeCutoff('month', at('2026-10-06T00:00:00Z'))?.getTime()).toBe(
      rangeCutoff('month', at('2026-10-06T23:59:59Z'))?.getTime(),
    );
  });
});

describe('numberInOrder', () => {
  test('ranks 1..n in the given (SQL tie) order, so ties never share a rank', () => {
    const rows = [
      { name: 'first-joined', xp: 500 },
      { name: 'later-joined', xp: 500 },
      { name: 'low', xp: 10 },
    ];
    expect(numberInOrder(rows).map((r) => [r.name, r.rank])).toEqual([
      ['first-joined', 1],
      ['later-joined', 2],
      ['low', 3],
    ]);
  });

  test('empty in, empty out', () => {
    expect(numberInOrder([])).toEqual([]);
  });
});

describe('toLeaderboardRow', () => {
  const player: RankedPlayer = {
    id: 'user_clerk_123',
    rank: 4,
    heroName: 'Nora',
    track: 'builder',
    xp: 40,
    totalXp: 400,
  };

  test('level comes from total XP, not range XP', () => {
    expect(toLeaderboardRow(player, null).level).toBe(3);
  });

  test('never carries the user id', () => {
    const row = toLeaderboardRow(player, 'user_clerk_123');
    expect(Object.keys(row).sort()).toEqual(
      ['heroName', 'isViewer', 'level', 'rank', 'track', 'xp'].sort(),
    );
    expect(JSON.stringify(row)).not.toContain('user_clerk_123');
  });

  test('marks only the viewer', () => {
    expect(toLeaderboardRow(player, 'user_clerk_123').isViewer).toBe(true);
    expect(toLeaderboardRow(player, 'someone_else').isViewer).toBe(false);
    expect(toLeaderboardRow(player, null).isViewer).toBe(false);
  });
});

describe('movesLeaderboard', () => {
  const outcome = (awarded: number) => ({ awarded, total: 160, levelBefore: 1, levelAfter: 2 });

  test('a fail (no XP outcome) does not move the board', () => {
    expect(movesLeaderboard(null)).toBe(false);
  });

  test('a replay (0 XP, award once) does not move the board', () => {
    expect(movesLeaderboard(outcome(0))).toBe(false);
  });

  test('a first clear with XP moves the board', () => {
    expect(movesLeaderboard(outcome(150))).toBe(true);
  });
});
