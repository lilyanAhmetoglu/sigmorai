import { describe, expect, test } from 'bun:test';
import type { SharedChapterGroup } from '@/lib/types';
import { applyCredit, creditorsForTrack, creditorsOf, withCreditors } from './shared';

const GROUPS: SharedChapterGroup[] = [
  {
    id: 'token-costs',
    kind: 'covers',
    deep: 'builder/r0/c6',
    members: ['builder/r0/c6', 'strategist/r0/c4'],
  },
  { id: 'mcp-basics', kind: 'same', members: ['builder/r5/c1', 'strategist/r5/c2'] },
];

const B_COSTS = 'builder/r0/c6/challenge';
const S_COSTS = 'strategist/r0/c4/challenge';
const B_MCP = 'builder/r5/c1/challenge';
const S_MCP = 'strategist/r5/c2/challenge';

describe('creditorsOf', () => {
  test('same: each member credits the other', () => {
    expect(creditorsOf(B_MCP, GROUPS)).toEqual([S_MCP]);
    expect(creditorsOf(S_MCP, GROUPS)).toEqual([B_MCP]);
  });

  test('covers: the deep case credits the light one, never back', () => {
    expect(creditorsOf(S_COSTS, GROUPS)).toEqual([B_COSTS]);
    expect(creditorsOf(B_COSTS, GROUPS)).toEqual([]);
  });

  test('credit is for the case only: lessons and quick checks have no creditors', () => {
    expect(creditorsOf('strategist/r0/c4/lesson', GROUPS)).toEqual([]);
    expect(creditorsOf('strategist/r0/c4/quick-check', GROUPS)).toEqual([]);
  });

  test('a chapter in no group, a boss and Math have no creditors', () => {
    expect(creditorsOf('builder/r0/c1/challenge', GROUPS)).toEqual([]);
    expect(creditorsOf('builder/r0/boss/challenge', GROUPS)).toEqual([]);
    expect(creditorsOf('math/f1/quick-check', GROUPS)).toEqual([]);
  });
});

describe('withCreditors / creditorsForTrack', () => {
  test('adds each creditor once, keeps the ids', () => {
    expect(withCreditors([S_COSTS, S_COSTS, 'x'], GROUPS)).toEqual([S_COSTS, 'x', B_COSTS]);
  });

  test('the other tracks’ cases that can credit this track', () => {
    expect(creditorsForTrack('strategist', GROUPS).sort()).toEqual([B_COSTS, B_MCP].sort());
    expect(creditorsForTrack('builder', GROUPS)).toEqual([S_MCP]);
    expect(creditorsForTrack('creator', GROUPS)).toEqual([]);
  });
});

describe('applyCredit', () => {
  test('a deep clear credits the light case and says from which track', () => {
    const { cleared, creditedFrom } = applyCredit(new Set([B_COSTS]), GROUPS);
    expect(cleared.has(S_COSTS)).toBe(true);
    expect(creditedFrom.get(S_COSTS)).toBe('builder');
  });

  test('a light clear credits nothing', () => {
    const { cleared, creditedFrom } = applyCredit(new Set([S_COSTS]), GROUPS);
    expect(cleared.has(B_COSTS)).toBe(false);
    expect(creditedFrom.size).toBe(0);
  });

  test('a real clear is never marked as credited', () => {
    const { creditedFrom } = applyCredit(new Set([B_MCP, S_MCP]), GROUPS);
    expect(creditedFrom.size).toBe(0);
  });

  test('does not change the input set', () => {
    const input = new Set([B_MCP]);
    applyCredit(input, GROUPS);
    expect([...input]).toEqual([B_MCP]);
  });
});
