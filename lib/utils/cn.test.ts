import { describe, expect, test } from 'bun:test';
import { cn } from './cn';

describe('cn', () => {
  test('joins truthy parts with one space', () => {
    expect(cn('a', false, 'b', null, undefined, '', 'c')).toBe('a b c');
  });

  test('returns an empty string when nothing is truthy', () => {
    expect(cn(false, null)).toBe('');
  });
});
