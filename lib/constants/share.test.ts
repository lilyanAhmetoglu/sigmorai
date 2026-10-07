import { describe, expect, test } from 'bun:test';
import { LEADERBOARD_RANGES } from './leaderboard';
import { SHARE_ENDPOINTS, SHARE_RANGE_TEXT, SHARE_TEXT } from './share';

describe('share text', () => {
  test('fills in the page details', () => {
    expect(SHARE_TEXT.realm('Prompt Forest', 'Prompts that work')).toBe(
      'Prompt Forest on Sigmorai: Prompts that work',
    );
    expect(SHARE_TEXT.rank(4, SHARE_RANGE_TEXT.week)).toBe(
      "I'm #4 on the Sigmorai leaderboard (this week).",
    );
    expect(SHARE_TEXT.cleared('Pick a model')).toBe('I cleared "Pick a model" on Sigmorai.');
  });

  test('every range reads as words', () => {
    for (const range of LEADERBOARD_RANGES) expect(SHARE_RANGE_TEXT[range]).toBeTruthy();
  });

  test('no hype words in the prefilled text', () => {
    const texts = [
      SHARE_TEXT.realm('A', 'b'),
      SHARE_TEXT.post('A'),
      SHARE_TEXT.math,
      SHARE_TEXT.leaderboard,
      SHARE_TEXT.rank(1, 'all time'),
      SHARE_TEXT.cleared('A'),
    ];
    for (const text of texts) expect(text).not.toMatch(/!|amazing|epic|ultimate|🚀/i);
  });

  test('every network endpoint is https', () => {
    for (const href of Object.values(SHARE_ENDPOINTS))
      expect(href.startsWith('https://')).toBe(true);
  });
});
