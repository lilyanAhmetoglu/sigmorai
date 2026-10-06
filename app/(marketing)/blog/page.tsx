import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingHeader } from '@/components/hud/marketing-header';
import { Panel } from '@/components/panel';
import {
  BLOG_FEED_HREF,
  BLOG_HREF,
  BLOG_META,
  BLOG_TEXT,
  blogHref,
  MAIN_CONTENT_ID,
} from '@/lib/constants';
import { listBlogPosts } from '@/lib/content/load';
import { dateLabel } from '@/lib/utils';

export const metadata: Metadata = {
  title: { absolute: BLOG_META.title },
  description: BLOG_META.description,
  alternates: {
    canonical: BLOG_HREF,
    types: { 'application/rss+xml': BLOG_FEED_HREF },
  },
};

/**
 * The blog list: one panel per post, newest first. Static: the posts are
 * files in content/blog, read at build time. Plain product voice, no lore.
 */
export default async function BlogPage() {
  const posts = await listBlogPosts();
  return (
    <>
      <MarketingHeader />
      <main
        id={MAIN_CONTENT_ID}
        tabIndex={-1}
        className="max-w-reading mx-auto flex w-full min-w-0 flex-1 flex-col gap-6 px-4 py-8"
      >
        <div className="flex flex-col gap-3">
          <p className="page-eyebrow">{BLOG_TEXT.eyebrow}</p>
          <h1 className="page-title">{BLOG_TEXT.title}</h1>
          <p className="page-intro">{BLOG_TEXT.intro}</p>
          <p className="m-0">
            <a href={BLOG_FEED_HREF} className="text-body inline-flex min-h-11 items-center">
              {BLOG_TEXT.feed}
            </a>
          </p>
        </div>

        {posts.length === 0 ? (
          <Panel tone="sunken">
            <p className="text-body leading-body text-text-2 m-0">{BLOG_TEXT.empty}</p>
          </Panel>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-4 p-0">
            {posts.map((post) => (
              <li key={post.slug}>
                <Panel className="flex flex-col gap-2">
                  <h2 className="font-display text-h4 m-0 leading-tight break-words">
                    <Link href={blogHref(post.slug)} className="inline-flex min-h-11 items-center">
                      {post.frontmatter.title}
                    </Link>
                  </h2>
                  <p className="text-small text-text-3 order-first m-0">
                    <span className="sr-only">{BLOG_TEXT.publishedLabel} </span>
                    <time dateTime={post.date}>{dateLabel(post.date)}</time>
                  </p>
                  <p className="text-body leading-body text-text-2 m-0">
                    {post.frontmatter.description}
                  </p>
                </Panel>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
