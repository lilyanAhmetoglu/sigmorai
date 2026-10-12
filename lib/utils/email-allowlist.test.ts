import { describe, expect, test } from 'bun:test';
import { isOnEmailAllowlist, parseEmailAllowlist } from './email-allowlist';

describe('parseEmailAllowlist', () => {
  test('unset or blank is an empty list', () => {
    expect(parseEmailAllowlist(undefined).size).toBe(0);
    expect(parseEmailAllowlist('').size).toBe(0);
    expect(parseEmailAllowlist('  ,  , ').size).toBe(0);
  });
  test('splits on commas, trims and lower-cases', () => {
    expect([...parseEmailAllowlist(' Tester@Example.com ,b@example.org,,')]).toEqual([
      'tester@example.com',
      'b@example.org',
    ]);
  });
});

describe('isOnEmailAllowlist', () => {
  const list = parseEmailAllowlist('tester@example.com');
  test('matches ignoring case and outer spaces', () => {
    expect(isOnEmailAllowlist(list, 'TESTER@example.com ')).toBe(true);
  });
  test('no partial or look-alike match', () => {
    expect(isOnEmailAllowlist(list, 'tester@example.co')).toBe(false);
    expect(isOnEmailAllowlist(list, 'xtester@example.com')).toBe(false);
    expect(isOnEmailAllowlist(new Set(), 'tester@example.com')).toBe(false);
  });
});
