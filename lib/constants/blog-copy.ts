import { SITE_NAME } from './site';

/**
 * Blog page words (app/(marketing)/blog). Plain product voice, no lore: NPC
 * lines live only in DialogBoxes, and a post has none. Post titles and
 * descriptions come from each post's frontmatter, not from here.
 */

export const BLOG_META = {
  title: `Blog · ${SITE_NAME}`,
  description: `Short notes on new ${SITE_NAME} levels: what each one covers and why it matters.`,
  /** The RSS channel title. */
  feedTitle: `${SITE_NAME} blog`,
} as const;

export const BLOG_TEXT = {
  eyebrow: 'BLOG',
  title: 'Blog',
  intro: `Short notes on new ${SITE_NAME} levels. Each post sums up one lesson and links to it. The lesson cites the source pages.`,
  empty: 'No posts yet. New levels get a post here.',
  feed: 'RSS feed',
  /** Prefix for the screen-reader date line on a post. */
  publishedLabel: 'Published',
  openLesson: 'Open the lesson',
  sourcesTitle: 'SOURCES',
  sourcesIntro: 'The lesson behind this post cites these pages.',
  back: 'All posts',
  backIcon: '←',
  notFound: 'There is no post at this address.',
  loadError: "This page didn't load.",
  retry: 'Try again',
} as const;
