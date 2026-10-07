/**
 * Pure helpers for the blog pages: a post's place (realm, colour, art,
 * topic) from its linked lesson id, its reading time, its `##` headings for
 * the "On this page" list, and the "Keep reading" pick. No IO.
 */
import { headingId, headingText } from './headings';
import {
  BLOG_REALM_TOPIC,
  BLOG_TEXT,
  BLOG_WORDS_PER_MINUTE,
  FRONTIER,
  MATH_AREA,
  MATH_TOWER,
  REALMS,
} from '@/lib/constants';
import type {
  BlogCardView,
  BlogFilter,
  BlogHeading,
  BlogPlace,
  BlogPost,
  BlogTopic,
  RealmId,
} from '@/lib/types';
import { MATH_ART, realmAccent, realmArt } from './curriculum';
import { parseExerciseId } from './ids';

/** Realm, colour, scene and topic of a post, from its lesson id (`builder/r1/c1/lesson`). */
export function blogPlace(lessonId: string): BlogPlace {
  const ref = parseExerciseId(lessonId);
  if (ref?.area === 'chapter' || ref?.area === 'boss') {
    const id = ref.realm as RealmId;
    return {
      name: REALMS[id].name,
      accent: realmAccent(id),
      art: realmArt(id),
      topic: BLOG_REALM_TOPIC[id],
    };
  }
  if (ref?.area === MATH_AREA) {
    return { name: MATH_TOWER.name, accent: 'realm-math', art: MATH_ART, topic: 'math' };
  }
  // The Frontier (or an id the schema already refused): no scene, no topic.
  return { name: FRONTIER.name, accent: 'neutral', art: null, topic: null };
}

/** Whole minutes to read a body at BLOG_WORDS_PER_MINUTE, at least 1. */
export function readMinutes(body: string): number {
  const words = body.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
  return Math.max(1, Math.ceil(words / BLOG_WORDS_PER_MINUTE));
}

/** The card a list, the featured slot and "Keep reading" show. */
export function toBlogCard(post: BlogPost): BlogCardView {
  return {
    slug: post.slug,
    title: post.frontmatter.title,
    description: post.frontmatter.description,
    date: post.date,
    minutes: readMinutes(post.body),
    place: blogPlace(post.frontmatter.lesson),
    cover: post.frontmatter.cover,
  };
}

/** Whether a post of this topic shows under a filter. A post with no topic shows under ALL only. */
export const matchesFilter = (topic: BlogTopic | null, filter: BlogFilter) =>
  filter === 'all' || topic === filter;

const FENCE = /^ {0,3}(`{3,}|~{3,})/;
const H2 = /^ {0,3}##[ \t]+(.+?)(?:[ \t]+#+)?[ \t]*$/;

/** Every `##` heading of a body, in order, skipping fenced code. */
export function postHeadings(body: string): BlogHeading[] {
  const headings: BlogHeading[] = [];
  let fence: string | null = null;
  for (const line of body.split('\n')) {
    const open = FENCE.exec(line);
    if (open) {
      const mark = open[1][0];
      if (fence === null) fence = mark;
      else if (fence === mark) fence = null;
      continue;
    }
    if (fence !== null) continue;
    const match = H2.exec(line);
    if (match) {
      const text = headingText(match[1]);
      headings.push({ id: headingId(text), text });
    }
  }
  return headings;
}

/**
 * Problems with a post's headings as anchors: two headings with the same id,
 * or one that takes the page's own Sources id. For `content:check`.
 */
export function headingProblems(body: string): string[] {
  const seen = new Set<string>();
  const problems: string[] = [];
  for (const { id, text } of postHeadings(body)) {
    if (id === BLOG_TEXT.sourcesId) {
      problems.push(
        `the heading "${text}" clashes with the page's own Sources section. Rename it.`,
      );
    } else if (seen.has(id)) {
      problems.push(`two headings have the anchor "#${id}". Make each "##" heading unique.`);
    }
    seen.add(id);
  }
  return problems;
}

/** Up to `count` other posts: same topic first, then the rest, newest first within each. */
export function relatedPosts(
  cards: readonly BlogCardView[],
  slug: string,
  count: number,
): BlogCardView[] {
  const current = cards.find((c) => c.slug === slug);
  const others = cards.filter((c) => c.slug !== slug);
  const topic = current?.place.topic ?? null;
  const same = topic ? others.filter((c) => c.place.topic === topic) : [];
  const rest = others.filter((c) => !same.includes(c));
  return [...same, ...rest].slice(0, count);
}
