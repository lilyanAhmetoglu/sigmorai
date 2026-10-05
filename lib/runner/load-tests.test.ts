import { describe, expect, test } from 'bun:test';
import { loadRunnableChallenge } from './load-tests';

describe('loadRunnableChallenge', () => {
  test('a strategist challenge (a case) is not runnable: null, no throw', async () => {
    expect(await loadRunnableChallenge('strategist/r0/c1/challenge')).toBeNull();
    expect(await loadRunnableChallenge('strategist/r0/boss/challenge')).toBeNull();
  });

  test('a non-challenge or bad id is null', async () => {
    expect(await loadRunnableChallenge('math/f1/quick-check')).toBeNull();
    expect(await loadRunnableChallenge('not-an-id')).toBeNull();
  });

  test('a builder challenge with no file (stub chapter) is null', async () => {
    expect(await loadRunnableChallenge('builder/r0/c6/challenge')).toBeNull();
  });
});
