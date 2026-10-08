import type { Metadata } from 'next';
import { FeaturedPost } from '@/components/blog/featured-post';
import { NewsletterBox } from '@/components/blog/newsletter-box';
import { PostCard } from '@/components/blog/post-card';
import { PostFilters } from '@/components/blog/post-filters';
import { JsonLd } from '@/components/json-ld';
import { Panel } from '@/components/panel';
import {
  BLOG_FEED_HREF,
  BLOG_HREF,
  BLOG_META,
  BLOG_TEXT,
  MAIN_CONTENT_ID,
  SITE_URL,
} from '@/lib/constants';
import { toBlogCard } from '@/lib/content/blog';
import { blogJsonLd } from '@/lib/content/json-ld';
import { listBlogPosts } from '@/lib/content/load';

export const metadata: Metadata = {
  title: { absolute: BLOG_META.title },
  description: BLOG_META.description,
  alternates: {
    canonical: BLOG_HREF,
    types: { 'application/rss+xml': BLOG_FEED_HREF },
  },
};

const LATEST_ID = 'latest-posts';

/**
 * The blog list (Sigmorai Blog.dc.html → isIndex): THE SIGMORAI CHRONICLE
 * header, the newest post featured, the rest as realm-tagged cards with
 * topic filters, then the newsletter box. Static: the posts are files in
 * content/blog, read at build time. Plain product voice, no lore.
 */
export default async function BlogPage() {
  const posts = await listBlogPosts();
  const [featured, ...rest] = posts.map(toBlogCard);

  return (
    <>
      <JsonLd data={blogJsonLd(posts, SITE_URL)} />
      <main id={MAIN_CONTENT_ID} tabIndex={-1} className="blog-main">
        <header className="blog-header">
          <p className="blog-eyebrow">{BLOG_TEXT.eyebrow}</p>
          <h1 className="blog-title">{BLOG_TEXT.title}</h1>
          <p className="blog-intro">{BLOG_TEXT.intro}</p>
          <a href={BLOG_FEED_HREF} className="blog-feed">
            {BLOG_TEXT.feed}
          </a>
        </header>

        {featured ? (
          <FeaturedPost post={featured} />
        ) : (
          <Panel tone="sunken">
            <p className="text-body leading-body text-text-2 m-0">{BLOG_TEXT.empty}</p>
          </Panel>
        )}

        {rest.length > 0 && (
          <section className="post-list" aria-labelledby={LATEST_ID}>
            <PostFilters
              heading={
                <h2 id={LATEST_ID} className="post-list-title">
                  {BLOG_TEXT.latestTitle}
                </h2>
              }
              headingId={LATEST_ID}
              items={rest.map((post) => ({
                key: post.slug,
                topic: post.place.topic,
                card: <PostCard post={post} />,
              }))}
            />
          </section>
        )}

        <NewsletterBox />
      </main>
    </>
  );
}
