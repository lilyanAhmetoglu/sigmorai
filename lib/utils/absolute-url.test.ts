import { describe, expect, test } from 'bun:test';
import { absoluteUrl } from './absolute-url';

describe('absoluteUrl', () => {
  test('joins a path to the origin, with or without a trailing slash', () => {
    expect(absoluteUrl('https://sigmorai.com', '/blog')).toBe('https://sigmorai.com/blog');
    expect(absoluteUrl('https://sigmorai.com/', '/blog')).toBe('https://sigmorai.com/blog');
  });

  test('the home path keeps its slash', () => {
    expect(absoluteUrl('https://sigmorai.com', '/')).toBe('https://sigmorai.com/');
  });
});
