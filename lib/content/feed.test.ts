import { describe, expect, test } from 'bun:test';
import { BLOG_META } from '@/lib/constants';
import { escapeXml, rssDate, rssFeed } from './feed';

const post = (date: string, slug: string, title = 'A post', description = 'What it covers.') => ({
  date,
  slug,
  frontmatter: { title, description },
});

describe('escapeXml', () => {
  test('escapes the five XML characters', () => {
    expect(escapeXml(`a & b < c > d "e" 'f'`)).toBe(
      'a &amp; b &lt; c &gt; d &quot;e&quot; &apos;f&apos;',
    );
  });
});

describe('rssDate', () => {
  test('RFC 822 at midnight UTC', () => {
    expect(rssDate('2026-10-06')).toBe('Tue, 06 Oct 2026 00:00:00 GMT');
  });
});

describe('rssFeed', () => {
  const xml = rssFeed(
    [post('2026-10-06', 'new', 'Tools & <tags>'), post('2026-09-30', 'old')],
    'https://sigmorai.com/',
  );

  test('an RSS 2.0 channel with a self link', () => {
    expect(xml).toStartWith('<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"');
    expect(xml).toContain(`<title>${BLOG_META.feedTitle}</title>`);
    expect(xml).toContain('<link>https://sigmorai.com/blog</link>');
    expect(xml).toContain('href="https://sigmorai.com/blog/feed.xml" rel="self"');
    expect(xml).toContain('<lastBuildDate>Tue, 06 Oct 2026 00:00:00 GMT</lastBuildDate>');
  });

  test('one item per post, in the given order, with absolute links and escaped text', () => {
    expect(xml.match(/<item>/g)).toHaveLength(2);
    expect(xml.indexOf('/blog/new')).toBeLessThan(xml.indexOf('/blog/old'));
    expect(xml).toContain('<title>Tools &amp; &lt;tags&gt;</title>');
    expect(xml).toContain('<guid isPermaLink="true">https://sigmorai.com/blog/new</guid>');
    expect(xml).not.toContain('<tags>');
  });

  test('a site URL without a trailing slash gives the same links', () => {
    expect(rssFeed([post('2026-10-06', 'new')], 'https://sigmorai.com')).toContain(
      '<link>https://sigmorai.com/blog/new</link>',
    );
  });

  test('no posts: a valid empty channel, no lastBuildDate', () => {
    const empty = rssFeed([], 'https://sigmorai.com');
    expect(empty).not.toContain('<item>');
    expect(empty).not.toContain('lastBuildDate');
    expect(empty).toContain('</channel>');
  });
});
