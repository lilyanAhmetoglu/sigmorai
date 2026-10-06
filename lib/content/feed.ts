/**
 * The blog's RSS 2.0 feed (app/(marketing)/blog/feed.xml). Pure: no IO, no
 * clock, so the same posts always give the same bytes. No feed package: RSS
 * is a few tags, and every text value goes through escapeXml.
 */
import { BLOG_FEED_HREF, BLOG_HREF, BLOG_META, blogHref } from '@/lib/constants';
import type { BlogPost } from '@/lib/types';

const XML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
};

/** Escapes text for an XML element or attribute. */
export function escapeXml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => XML_ENTITIES[c]);
}

/** `2026-10-06` → `Tue, 06 Oct 2026 00:00:00 GMT` (RFC 822, as RSS 2.0 wants). */
export const rssDate = (date: string) => new Date(`${date}T00:00:00Z`).toUTCString();

/** A site path as an absolute URL on `siteUrl` (trailing slash or not). */
const absolute = (siteUrl: string, href: string) => new URL(href, siteUrl).toString();

type FeedPost = Pick<BlogPost, 'date' | 'slug'> & {
  frontmatter: Pick<BlogPost['frontmatter'], 'title' | 'description'>;
};

/** RSS 2.0 for `posts` (already newest first). Links are absolute on `siteUrl`. */
export function rssFeed(posts: readonly FeedPost[], siteUrl: string): string {
  const tag = (name: string, value: string) => `<${name}>${escapeXml(value)}</${name}>`;
  const items = posts.map((post) => {
    const link = absolute(siteUrl, blogHref(post.slug));
    return [
      '    <item>',
      `      ${tag('title', post.frontmatter.title)}`,
      `      ${tag('link', link)}`,
      `      <guid isPermaLink="true">${escapeXml(link)}</guid>`,
      `      ${tag('pubDate', rssDate(post.date))}`,
      `      ${tag('description', post.frontmatter.description)}`,
      '    </item>',
    ].join('\n');
  });
  const channel = [
    `    ${tag('title', BLOG_META.feedTitle)}`,
    `    ${tag('link', absolute(siteUrl, BLOG_HREF))}`,
    `    ${tag('description', BLOG_META.description)}`,
    '    <language>en</language>',
    `    <atom:link href="${escapeXml(absolute(siteUrl, BLOG_FEED_HREF))}" rel="self" type="application/rss+xml" />`,
    ...(posts[0] ? [`    ${tag('lastBuildDate', rssDate(posts[0].date))}`] : []),
    ...items,
  ];
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    ...channel,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n');
}
