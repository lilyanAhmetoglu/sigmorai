/**
 * /llms.txt (app/llms.txt): a short Markdown guide to the site for AI tools,
 * in the llmstxt.org shape: H1 name, a blockquote summary, a paragraph, then
 * H2 link lists ("- [name](url): note"). "Optional" holds links a tool may
 * skip. Pure: no IO, so the same posts always give the same text. Every
 * label and note comes from the page meta in lib/constants.
 */
import {
  BLOG_FEED_HREF,
  BLOG_HREF,
  BLOG_META,
  blogHref,
  LANDING_META,
  LEADERBOARD_HREF,
  LEADERBOARD_TEXT,
  LLMS_TEXT,
  MATH_HREF,
  MAP_HREF,
  MATH_TEXT,
  PRIVACY_HREF,
  PRIVACY_META,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITEMAP_HREF,
  WORLD_MAP_TEXT,
} from '@/lib/constants';
import type { BlogPost } from '@/lib/types';
import { absoluteUrl } from '@/lib/utils';

type LlmsPost = Pick<BlogPost, 'slug'> & {
  frontmatter: Pick<BlogPost['frontmatter'], 'title' | 'description'>;
};

/** One line, and no brackets that would break a Markdown link. */
const clean = (text: string) => text.replace(/\s+/g, ' ').replace(/[[\]]/g, '').trim();

/** The llms.txt text. `posts` come newest first (listBlogPosts); links are absolute on `siteUrl`. */
export function llmsTxt(posts: readonly LlmsPost[], siteUrl: string): string {
  const link = (label: string, href: string, note: string) =>
    `- [${clean(label)}](${absoluteUrl(siteUrl, href)}): ${clean(note)}`;
  const section = (heading: string, lines: string[]) => [`## ${heading}`, '', ...lines, ''];
  const { sections } = LLMS_TEXT;
  return [
    `# ${SITE_NAME}`,
    '',
    `> ${SITE_DESCRIPTION}`,
    '',
    LANDING_META.description,
    '',
    ...section(sections.learn, [
      link(LLMS_TEXT.mapLabel, MAP_HREF, WORLD_MAP_TEXT.description),
      link(MATH_TEXT.title, MATH_HREF, MATH_TEXT.description),
    ]),
    ...section(sections.blog, [
      link(LLMS_TEXT.blogLabel, BLOG_HREF, BLOG_META.description),
      ...posts.map((post) =>
        link(post.frontmatter.title, blogHref(post.slug), post.frontmatter.description),
      ),
    ]),
    ...section(sections.optional, [
      link(LLMS_TEXT.leaderboardLabel, LEADERBOARD_HREF, LEADERBOARD_TEXT.description),
      link(LLMS_TEXT.sitemapLabel, SITEMAP_HREF, LLMS_TEXT.sitemap),
      link(LLMS_TEXT.feedLabel, BLOG_FEED_HREF, LLMS_TEXT.feed),
      link(LLMS_TEXT.privacyLabel, PRIVACY_HREF, PRIVACY_META.description),
    ]),
  ].join('\n');
}
