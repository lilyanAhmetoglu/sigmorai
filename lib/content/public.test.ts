import { describe, expect, test } from 'bun:test';
import type { PublicChallenge } from '@/lib/types';
import { loadCase, loadChallenge, loadQuickCheck } from './load';
import { toPublicCase, toPublicChallenge, toPublicQuickCheck } from './public';

const VALID = `${import.meta.dir}/__fixtures__/valid`;

/** Every key anywhere in a JSON value, so a nested secret can't hide. */
function keysOf(value: unknown): Set<string> {
  const keys = new Set<string>();
  const walk = (v: unknown) => {
    if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') {
      for (const [k, child] of Object.entries(v)) {
        keys.add(k);
        walk(child);
      }
    }
  };
  walk(JSON.parse(JSON.stringify(value)));
  return keys;
}

describe('public views strip secrets', () => {
  test('challenge: no hidden tests, no solution', async () => {
    const full = await loadChallenge('builder/r0/c1/challenge', VALID);
    const pub = toPublicChallenge(full);
    const keys = keysOf(pub);
    expect(keys.has('hiddenTests')).toBe(false);
    expect(keys.has('solution')).toBe(false);
    expect(JSON.stringify(pub)).not.toContain(full.hiddenTests[0].code);
    expect(pub.visibleTests).toEqual(full.visibleTests);
    expect(pub.starter).toBe(full.starter);
  });

  test('case: no correct flags, no explanations', async () => {
    const full = await loadCase('strategist/r0/c1/challenge', VALID);
    const pub = toPublicCase(full);
    const keys = keysOf(pub);
    expect(keys.has('correct')).toBe(false);
    expect(keys.has('explanation')).toBe(false);
    expect(pub.questions[0].options.map((o) => o.text)).toEqual(
      full.questions[0].options.map((o) => o.text),
    );
  });

  test('quick check: no correct flags, no explanations', async () => {
    const pub = toPublicQuickCheck(await loadQuickCheck('builder/r0/c1/quick-check', VALID));
    const keys = keysOf(pub);
    expect(keys.has('correct')).toBe(false);
    expect(keys.has('explanation')).toBe(false);
    expect(pub.questions).toHaveLength(3);
  });

  test('a full object does not type-check as a public one', async () => {
    const full = await loadChallenge('builder/r0/c1/challenge', VALID);
    // @ts-expect-error: only toPublicChallenge makes a PublicChallenge.
    const leaked: PublicChallenge = full;
    expect(leaked).toBeDefined();
  });

  test('the full object stays intact (views copy, never mutate)', async () => {
    const full = await loadCase('strategist/r0/c1/challenge', VALID);
    toPublicCase(full);
    expect(full.questions[0].options[1].correct).toBe(true);
  });
});
