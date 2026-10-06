import { describe, expect, test } from 'bun:test';
import { NewsletterSchema, type BlogCardView, type BlogTopic } from '@/lib/types';
import {
  blogPlace,
  headingProblems,
  matchesFilter,
  postHeadings,
  readMinutes,
  relatedPosts,
} from './blog';
import { headingId, headingText } from './headings';

describe('blogPlace', () => {
  test('a realm lesson: realm name, colour, art and topic', () => {
    expect(blogPlace('builder/r1/c1/lesson')).toEqual({
      name: 'Prompt Forest',
      accent: 'realm-1',
      art: '/levels/realm-01',
      topic: 'prompting',
    });
    expect(blogPlace('strategist/r5/c2/lesson').topic).toBe('agents');
    expect(blogPlace('builder/r2/c1/lesson').topic).toBe('building');
    expect(blogPlace('builder/r8/c1/lesson').topic).toBe('quality');
  });

  test('a Math Tower lesson is math, with the tower art', () => {
    expect(blogPlace('math/f1/lesson')).toEqual({
      name: 'Math Tower',
      accent: 'realm-math',
      art: '/levels/math',
      topic: 'math',
    });
  });

  test('a Frontier lesson has no art and no topic', () => {
    const place = blogPlace('frontier/2026-10-05-new-thing/lesson');
    expect(place.art).toBeNull();
    expect(place.topic).toBeNull();
  });
});

describe('readMinutes', () => {
  test('at least one minute, rounded up', () => {
    expect(readMinutes('')).toBe(1);
    expect(readMinutes('word '.repeat(201))).toBe(2);
  });
  test('punctuation alone is not a word', () => {
    expect(readMinutes('- - - -')).toBe(1);
  });
});

describe('headings', () => {
  test('ids are plain lower-case slugs', () => {
    expect(headingId('What prompt caching does')).toBe('what-prompt-caching-does');
    expect(headingId('Évals & prod!')).toBe('evals-prod');
    expect(headingId('!!!')).toBe('section');
  });

  test('heading text unwraps inline Markdown', () => {
    expect(headingText('Use `cache_control` in **one** [place](https://x.y)')).toBe(
      'Use cache_control in one place',
    );
  });

  test('only ## headings, never inside fenced code', () => {
    const body = [
      '## First',
      'text',
      '### Not this',
      '```md',
      '## Not code',
      '```',
      '## Second ##',
    ].join('\n');
    expect(postHeadings(body)).toEqual([
      { id: 'first', text: 'First' },
      { id: 'second', text: 'Second' },
    ]);
  });

  test('duplicate anchors and the Sources id are problems', () => {
    expect(headingProblems('## A\n## B')).toEqual([]);
    expect(headingProblems('## A\n## a')).toHaveLength(1);
    expect(headingProblems('## Sources')).toHaveLength(1);
  });
});

const card = (slug: string, topic: BlogTopic | null): BlogCardView => ({
  slug,
  title: slug,
  description: '',
  date: '2026-10-06',
  minutes: 1,
  place: { name: '', accent: 'neutral', art: null, topic },
});

describe('filters and related posts', () => {
  test('a post without a topic shows under ALL only', () => {
    expect(matchesFilter(null, 'all')).toBe(true);
    expect(matchesFilter(null, 'agents')).toBe(false);
    expect(matchesFilter('agents', 'agents')).toBe(true);
  });

  test('same topic first, then the rest, never the post itself', () => {
    const cards = [
      card('a', 'math'),
      card('b', 'agents'),
      card('c', 'agents'),
      card('d', 'prompting'),
    ];
    expect(relatedPosts(cards, 'c', 3).map((c) => c.slug)).toEqual(['b', 'a', 'd']);
    expect(relatedPosts(cards, 'a', 2).map((c) => c.slug)).toEqual(['b', 'c']);
  });
});

describe('NewsletterSchema', () => {
  test('trims and lower-cases a valid email', () => {
    expect(NewsletterSchema.parse({ email: '  Ada@Example.COM ' }).email).toBe('ada@example.com');
  });
  test('refuses junk, empty and over-long input', () => {
    for (const email of ['', 'nope', 'a@', null, `${'a'.repeat(250)}@b.co`]) {
      expect(NewsletterSchema.safeParse({ email }).success).toBe(false);
    }
  });
});
