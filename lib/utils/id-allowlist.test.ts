import { describe, expect, test } from 'bun:test';
import { parseIdAllowlist } from './id-allowlist';

describe('parseIdAllowlist', () => {
  test('unset or blank is an empty list', () => {
    expect(parseIdAllowlist(undefined).size).toBe(0);
    expect(parseIdAllowlist('').size).toBe(0);
    expect(parseIdAllowlist('  ,  , ').size).toBe(0);
  });
  test('splits on commas, trims, drops empties', () => {
    expect([...parseIdAllowlist(' user_2Abc ,user_9xyz,,')]).toEqual(['user_2Abc', 'user_9xyz']);
  });
  test('ids are case-sensitive and match whole', () => {
    const list = parseIdAllowlist('user_2Abc');
    expect(list.has('user_2Abc')).toBe(true);
    expect(list.has('user_2abc')).toBe(false);
    expect(list.has('user_2Ab')).toBe(false);
  });
});
