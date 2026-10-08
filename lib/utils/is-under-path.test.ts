import { describe, expect, test } from 'bun:test';
import { isUnderPath } from './is-under-path';

describe('isUnderPath', () => {
  test('matches the route itself and pages under it', () => {
    expect(isUnderPath('/blog', '/blog')).toBe(true);
    expect(isUnderPath('/blog/be-specific', '/blog')).toBe(true);
  });
  test('does not match a look-alike prefix', () => {
    expect(isUnderPath('/blogroll', '/blog')).toBe(false);
    expect(isUnderPath('/', '/blog')).toBe(false);
  });
});
