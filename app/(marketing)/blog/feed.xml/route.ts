import { SITE_URL } from '@/lib/constants';
import { rssFeed } from '@/lib/content/feed';
import { listBlogPosts } from '@/lib/content/load';

/** Built once at build time, like the pages: posts only change with a deploy. */
export const dynamic = 'force-static';

/** The blog's RSS 2.0 feed, linked from /blog (<link rel="alternate">). */
export async function GET() {
  const xml = rssFeed(await listBlogPosts(), SITE_URL);
  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
