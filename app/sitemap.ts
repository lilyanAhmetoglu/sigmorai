import type { MetadataRoute } from 'next';
import { MATH_AREA, REALMS, SITE_URL, TRACKS } from '@/lib/constants';
import { listBlogPosts } from '@/lib/content/load';
import { sitemapEntries } from '@/lib/content/sitemap';
import { getRealmMeta, liveIds } from '@/lib/data/realms';

/**
 * /sitemap.xml. Static: content ships with the deploy, so it is built once at
 * build time (no auth(), no request data). What it lists: lib/content/sitemap.ts.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [metas, ids, posts] = await Promise.all([
    Promise.all(REALMS.map((realm) => getRealmMeta(realm.slug))),
    Promise.all([...TRACKS.map((track) => liveIds(track)), liveIds(MATH_AREA)]),
    listBlogPosts(),
  ]);
  return sitemapEntries({
    siteUrl: SITE_URL,
    realmSlugs: REALMS.filter((_, i) => metas[i]?.indexable).map((realm) => realm.slug),
    liveIds: ids.flatMap((set) => [...set]),
    posts,
  });
}
