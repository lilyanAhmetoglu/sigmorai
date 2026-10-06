/**
 * The sitemap's entries (app/sitemap.ts). Pure: the route reads the indexable
 * realms, the live ids and the posts; this only turns them into absolute URLs.
 * Listed (curriculum spec → SEO): the public pages (the leaderboard's
 * all-time view only, no range param), indexable realm pages,
 * live lessons (every track and the Math Tower) and every blog post. Never
 * listed: level maps, cases, quick checks and private pages.
 */
import type { MetadataRoute } from 'next';
import {
  BLOG_HREF,
  blogHref,
  FRONTIER_AREA,
  HOME_HREF,
  LEADERBOARD_HREF,
  MATH_HREF,
  PRIVACY_HREF,
  questHref,
  realmHref,
  REALMS_HREF,
} from '@/lib/constants';
import type { BlogPost } from '@/lib/types';
import { absoluteUrl, utcMidnight } from '@/lib/utils';
import { parseExerciseId } from './ids';

/** The public pages that are always there. */
const STATIC_HREFS = [
  HOME_HREF,
  REALMS_HREF,
  MATH_HREF,
  LEADERBOARD_HREF,
  BLOG_HREF,
  PRIVACY_HREF,
] as const;

/** A realm or Math Tower lesson: the only quest step a crawler should find. */
function isLessonId(id: string): boolean {
  const ref = parseExerciseId(id);
  return ref !== null && ref.area !== FRONTIER_AREA && 'step' in ref && ref.step === 'lesson';
}

export type SitemapInput = {
  siteUrl: string;
  /** Realm slugs with at least one live chapter (getRealmMeta → indexable). */
  realmSlugs: readonly string[];
  /** Live exercise ids of any step; only lessons are kept. */
  liveIds: Iterable<string>;
  /** Blog posts; a post's date is its lastModified. */
  posts: readonly Pick<BlogPost, 'date' | 'slug'>[];
};

export function sitemapEntries({
  siteUrl,
  realmSlugs,
  liveIds,
  posts,
}: SitemapInput): MetadataRoute.Sitemap {
  const url = (href: string) => absoluteUrl(siteUrl, href);
  return [
    ...STATIC_HREFS.map((href) => ({ url: url(href) })),
    ...realmSlugs.map((slug) => ({ url: url(realmHref(slug)) })),
    ...[...liveIds].filter(isLessonId).map((id) => ({ url: url(questHref(id)) })),
    ...posts.map((post) => ({
      url: url(blogHref(post.slug)),
      lastModified: utcMidnight(post.date),
    })),
  ];
}
