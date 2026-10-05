import { describe, expect, test } from 'bun:test';
import { isUnderBase, urlKey } from './source-urls';

const BASES = ['https://platform.claude.com/docs', 'https://www.anthropic.com/engineering'];

describe('urlKey', () => {
  test('drops www, case, query, hash and trailing slash', () => {
    expect(urlKey('https://WWW.Anthropic.com/engineering/x/?a=1#b')).toBe(
      'anthropic.com/engineering/x',
    );
  });

  test('http and junk are not keys', () => {
    expect(urlKey('http://platform.claude.com/docs')).toBeNull();
    expect(urlKey('not a url')).toBeNull();
  });
});

describe('isUnderBase', () => {
  test.each([
    'https://platform.claude.com/docs',
    'https://platform.claude.com/docs/en/build-with-claude/token-counting',
    'https://platform.claude.com/docs/en/x?lang=en#note',
    'https://anthropic.com/engineering/some-post',
  ])('under an official base: %s', (url) => {
    expect(isUnderBase(url, BASES)).toBe(true);
  });

  test.each([
    'https://platform.claude.com/docsevil/page',
    'https://platform.claude.com/other',
    'https://evil.com/platform.claude.com/docs',
    'http://platform.claude.com/docs/en/x',
  ])('not under a base: %s', (url) => {
    expect(isUnderBase(url, BASES)).toBe(false);
  });
});
