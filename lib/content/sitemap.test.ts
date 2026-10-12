import { describe, expect, test } from 'bun:test';
import { sitemapEntries } from './sitemap';

const SITE = 'https://sigmorai.com';

const entries = sitemapEntries({
  siteUrl: `${SITE}/`,
  realmSlugs: ['bootstrap-village'],
  liveIds: [
    'strategist/r0/c1/lesson',
    'strategist/r0/c1/challenge',
    'strategist/r0/c1/quick-check',
    'builder/r0/boss/challenge',
    'math/f1/lesson',
    'math/f1/quick-check',
    'frontier/2026-10-05-some-slug/lesson',
    'frontier/2026-10-05-some-slug/quick-check',
  ],
  posts: [{ date: '2026-10-06', slug: 'be-specific' }],
});
const urls = entries.map((e) => e.url);

describe('sitemapEntries', () => {
  test('lists the public pages, indexable realms, live lessons and posts, in that order', () => {
    expect(urls).toEqual([
      `${SITE}/`,
      `${SITE}/map`,
      `${SITE}/math`,
      `${SITE}/frontier`,
      `${SITE}/leaderboard`,
      `${SITE}/blog`,
      `${SITE}/privacy`,
      `${SITE}/realms/bootstrap-village`,
      `${SITE}/quest/strategist/r0/c1/lesson`,
      `${SITE}/quest/math/f1/lesson`,
      `${SITE}/quest/frontier/2026-10-05-some-slug/lesson`,
      `${SITE}/blog/be-specific`,
    ]);
  });

  test('never lists a case, a quick check (Frontier too) or a level map', () => {
    expect(urls.some((u) => /challenge|quick-check|\/map\//.test(u))).toBe(false);
  });

  test('a post is last modified on its date (midnight UTC)', () => {
    expect(entries.at(-1)?.lastModified).toEqual(new Date('2026-10-06T00:00:00Z'));
  });

  test('every URL is absolute on the site origin', () => {
    expect(urls.every((u) => u.startsWith(`${SITE}/`))).toBe(true);
  });
});
