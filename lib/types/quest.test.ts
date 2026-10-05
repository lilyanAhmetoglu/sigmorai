import { describe, expect, test } from 'bun:test';
import { SubmitCaseInputSchema, SubmitQuickCheckInputSchema } from './quest';

const SEED = '0123456789abcdef0123456789abcdef';
const CASE = { exerciseId: 'strategist/r0/c1/challenge', seed: SEED, answers: [0, 1, 2] };

describe('answer inputs take ids, a seed and indexes only', () => {
  test('a valid case input parses', () => {
    expect(SubmitCaseInputSchema.safeParse(CASE).success).toBe(true);
  });

  test('an extra grade, pass flag or XP key is rejected (.strict)', () => {
    for (const extra of [{ passed: true }, { xp: 150 }, { score: 3 }, { level: 9 }]) {
      expect(SubmitCaseInputSchema.safeParse({ ...CASE, ...extra }).success).toBe(false);
    }
  });

  test('each action takes only its own step', () => {
    expect(SubmitQuickCheckInputSchema.safeParse(CASE).success).toBe(false);
    const quick = { ...CASE, exerciseId: 'strategist/r0/c1/quick-check' };
    expect(SubmitQuickCheckInputSchema.safeParse(quick).success).toBe(true);
    expect(SubmitCaseInputSchema.safeParse(quick).success).toBe(false);
  });

  test('a bad seed or a negative index is rejected', () => {
    expect(SubmitCaseInputSchema.safeParse({ ...CASE, seed: 'abc' }).success).toBe(false);
    expect(SubmitCaseInputSchema.safeParse({ ...CASE, answers: [-1, 0, 0] }).success).toBe(false);
  });
});
