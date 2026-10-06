import { describe, expect, test } from 'bun:test';
import { llmsTxt } from './llms';

const SITE = 'https://sigmorai.com';
const post = (slug: string, title: string, description: string) => ({
  slug,
  frontmatter: { title, description },
});

const text = llmsTxt(
  [post('be-specific', 'Be [very] specific', 'Why a clear\nprompt wins.')],
  `${SITE}/`,
);
const lines = text.split('\n');

describe('llmsTxt', () => {
  test('starts with the H1 name and a blockquote summary (llmstxt.org)', () => {
    expect(lines[0]).toBe('# Sigmorai');
    expect(lines[2]?.startsWith('> ')).toBe(true);
  });

  test('links the public pages as absolute URLs, in H2 sections, Optional last', () => {
    const headings = lines.filter((l) => l.startsWith('## '));
    expect(headings).toEqual(['## Learn', '## Blog', '## Optional']);
    for (const path of ['/realms', '/math', '/blog', '/leaderboard', '/sitemap.xml']) {
      expect(text).toContain(`](${SITE}${path}): `);
    }
  });

  test('lists each post as one clean link line', () => {
    expect(lines).toContain(
      `- [Be very specific](${SITE}/blog/be-specific): Why a clear prompt wins.`,
    );
  });

  test('never links a private page', () => {
    for (const path of ['/dashboard', '/profile', '/onboarding', '/api/']) {
      expect(text).not.toContain(`${SITE}${path}`);
    }
  });
});
