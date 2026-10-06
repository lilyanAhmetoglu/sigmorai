import { describe, expect, test } from 'bun:test';
import { articleJsonLd, serializeJsonLd, siteJsonLd } from './json-ld';

const SITE = 'https://sigmorai.com';

describe('siteJsonLd', () => {
  test('a WebSite published by the Organization, absolute URLs', () => {
    const graph = siteJsonLd(`${SITE}/`)['@graph'] as Record<string, unknown>[];
    expect(graph.map((node) => node['@type'])).toEqual(['Organization', 'WebSite']);
    expect(graph[0]?.url).toBe(`${SITE}/`);
    expect(graph[1]?.publisher).toEqual({ '@id': `${SITE}/#organization` });
  });
});

describe('articleJsonLd', () => {
  test('a BlogPosting with the post title, summary, date and URL', () => {
    const data = articleJsonLd(
      { date: '2026-10-06', slug: 'be-specific', frontmatter: { title: 'T', description: 'D' } },
      SITE,
    );
    expect(data).toMatchObject({
      '@type': 'BlogPosting',
      headline: 'T',
      description: 'D',
      datePublished: '2026-10-06',
      url: `${SITE}/blog/be-specific`,
    });
  });
});

describe('serializeJsonLd', () => {
  test('a value can never close the script tag', () => {
    const json = serializeJsonLd({ '@context': 'https://schema.org', name: '</script><x>' });
    expect(json).not.toContain('<');
    expect(JSON.parse(json).name).toBe('</script><x>');
  });
});
