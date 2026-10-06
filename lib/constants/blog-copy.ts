import { SITE_NAME } from './site';

/**
 * Blog page words (app/(marketing)/blog), from design/ui_kits/webapp/Sigmorai
 * Blog.dc.html. Plain product voice, no lore: NPC lines live only in
 * DialogBoxes, and a post has none. Post titles and descriptions come from
 * each post's frontmatter, not from here.
 * Changed from the design on purpose: the curriculum is vendor-neutral and
 * learners write no code (no-code pivot), so the copy says so.
 */

export const BLOG_META = {
  title: `Blog · ${SITE_NAME}: AI engineering guides, from prompts to production agents`,
  description: `Short, sourced guides on prompting, tool use, MCP, evals and multi-agent systems. Each post sums up one ${SITE_NAME} lesson and cites the official docs behind it.`,
  /** The RSS channel title. */
  feedTitle: `${SITE_NAME} blog`,
  /** schema.org Blog name (JSON-LD). */
  jsonLdName: `${SITE_NAME} Blog`,
} as const;

export const BLOG_TEXT = {
  eyebrow: `THE ${SITE_NAME.toUpperCase()} CHRONICLE`,
  title: 'AI engineering guides, from first prompt to production agents',
  intro:
    'Short, sourced explainers on the topics behind each realm. Each post cites the official docs its lesson is built from.',
  empty: 'No posts yet. New levels get a post here.',
  feed: 'RSS feed',
  /** Screen-reader prefix for a post's date line. */
  publishedLabel: 'Published',
  featured: 'FEATURED',
  readGuide: 'Read guide',
  readGuideIcon: '▸',
  latestTitle: 'Latest posts',
  latestLabel: 'All posts',
  filtersLabel: 'Filter posts by topic',
  filterEmpty: 'No posts on this topic yet.',
  /** `6` → `6 MIN READ`. */
  readTime: (minutes: number) => `${minutes} MIN READ`,
  breadcrumbLabel: 'Breadcrumb',
  breadcrumbBlog: 'BLOG',
  breadcrumbSep: '▸',
  author: `${SITE_NAME} Editors`,
  sourcedNote: 'SOURCED FROM THE DOCS',
  tocTitle: 'ON THIS PAGE',
  tocLabel: 'On this page',
  questTag: 'TRY THE QUEST',
  questTitle: (realm: string) => `Practice this in ${realm}`,
  questText: 'Read the lesson, solve the case, earn the XP.',
  questAction: 'Start quest',
  questActionIcon: '▸',
  relatedTitle: 'Keep reading',
  sourcesTitle: 'Sources',
  sourcesId: 'sources',
  sourcesIntro: 'The lesson behind this post cites these pages.',
  back: 'All posts',
  backIcon: '←',
  loadError: "This page didn't load.",
  retry: 'Try again',
} as const;

/** The DISPATCH FROM LATENTIA box (blog list and post). Plain words; the eyebrow is the design's. */
export const NEWSLETTER_TEXT = {
  eyebrow: 'DISPATCH FROM LATENTIA',
  title: 'New realms and guides, when they ship',
  intro: 'When the docs change, we write it up. No hype, one email.',
  label: 'Email',
  placeholder: 'you@example.com',
  submit: 'Subscribe',
  sending: 'Sending…',
  /** Resend's Contacts API sends no confirmation email, so we never say "Check your inbox". */
  success: "You're on the list.",
  privacy: 'We keep your email at Resend to send the dispatch. Each email has an unsubscribe link.',
  privacyLink: 'Privacy',
  errors: {
    invalid_email: 'Enter a valid email address, like you@example.com.',
    not_open: 'Sign-up is not open yet.',
    busy: 'Too many sign-ups right now. Try again in a minute.',
    server_error: 'Sign-up failed. Try again later.',
  },
  /** Hidden from people; a bot that fills it is dropped. */
  honeypotLabel: 'Leave this field empty',
} as const;
