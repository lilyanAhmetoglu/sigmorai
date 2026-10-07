import { describe, expect, test } from 'bun:test';
import { SHARE_NETWORKS } from '@/lib/constants';
import { networkShareHref, shareLinks, withUtm } from './share-links';

const SITE = 'https://sigmorai.com';

describe('withUtm', () => {
  test('makes the path absolute and adds the three share tags', () => {
    const url = new URL(withUtm(SITE, '/blog/be-specific', 'linkedin'));
    expect(url.origin + url.pathname).toBe('https://sigmorai.com/blog/be-specific');
    expect(url.searchParams.get('utm_source')).toBe('linkedin');
    expect(url.searchParams.get('utm_medium')).toBe('social');
    expect(url.searchParams.get('utm_campaign')).toBe('share');
  });

  test('keeps the page query and replaces old utm values', () => {
    const url = new URL(withUtm(SITE, '/realms/prompt-forest?track=builder&utm_source=x', 'copy'));
    expect(url.searchParams.get('track')).toBe('builder');
    expect(url.searchParams.getAll('utm_source')).toEqual(['copy']);
  });

  test('works with a trailing slash on the site URL', () => {
    expect(withUtm(`${SITE}/`, '/math', 'native')).toStartWith('https://sigmorai.com/math?');
  });
});

describe('networkShareHref', () => {
  const url = withUtm(SITE, '/leaderboard?range=week', 'x');
  const text = 'I\'m #4 on the Sigmorai leaderboard (this week). 100% & "fair"';

  test('LinkedIn takes the URL only', () => {
    const href = new URL(networkShareHref('linkedin', url, text));
    expect(href.origin + href.pathname).toBe('https://www.linkedin.com/sharing/share-offsite/');
    expect(href.searchParams.get('url')).toBe(url);
    expect([...href.searchParams.keys()]).toEqual(['url']);
  });

  test('X takes the text and the URL, both encoded', () => {
    const raw = networkShareHref('x', url, text);
    expect(raw).not.toContain('&utm_medium');
    const href = new URL(raw);
    expect(href.origin + href.pathname).toBe('https://x.com/intent/post');
    expect(href.searchParams.get('text')).toBe(text);
    expect(href.searchParams.get('url')).toBe(url);
  });

  test('Facebook takes the URL as u', () => {
    const href = new URL(networkShareHref('facebook', url, text));
    expect(href.origin + href.pathname).toBe('https://www.facebook.com/sharer/sharer.php');
    expect(href.searchParams.get('u')).toBe(url);
  });
});

describe('shareLinks', () => {
  test('one https link per network, in order, each tagged with its own source', () => {
    const links = shareLinks(SITE, '/math', 'The Math Tower');
    expect(links.map((l) => l.network)).toEqual([...SHARE_NETWORKS]);
    for (const { network, href } of links) {
      expect(href.startsWith('https://')).toBe(true);
      const shared = new URL(href).searchParams.get(network === 'facebook' ? 'u' : 'url')!;
      expect(new URL(shared).searchParams.get('utm_source')).toBe(network);
    }
  });
});

describe('shareLinks with options', () => {
  test('takes an absolute URL and a subset of networks', () => {
    const links = shareLinks(SITE, 'https://sigmorai.com/certificates/abc', 'A', ['linkedin']);
    expect(links.map((l) => l.network)).toEqual(['linkedin']);
    const shared = new URL(new URL(links[0].href).searchParams.get('url')!);
    expect(shared.pathname).toBe('/certificates/abc');
    expect(shared.searchParams.get('utm_source')).toBe('linkedin');
  });
});
