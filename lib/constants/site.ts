/**
 * Site-wide identity and URLs: the root metadata, canonical links and auth
 * entry points read from here.
 */

export const SITE_NAME = 'Sigmorai';

/** Production origin. NEXT_PUBLIC_SITE_URL overrides it per environment (.env.example). */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sigmorai.com';

export const SITE_DESCRIPTION = 'A pixel-art RPG for learning AI engineering and agentic systems.';

/** --ink-900 (--surface-1): browser theme colour and the app icon background. */
export const BRAND_COLOR = '#131126';

/** Clerk's sign-in and sign-up pages (app/(marketing)/sign-in, app/(marketing)/sign-up). */
export const AUTH_ROUTES = {
  signIn: '/sign-in',
  signUp: '/sign-up',
} as const;

/** The query param Clerk's sign-in/sign-up keep through every step and redirect to at the end. */
export const CLERK_REDIRECT_PARAM = 'redirect_url';

/** Labels for the links to AUTH_ROUTES (header auth controls and the landing hero). */
export const AUTH_TEXT = {
  signIn: 'Sign in',
  startFree: 'Start free',
} as const;

/**
 * AI agents that robots.txt names on purpose (app/robots.ts). Maintainer
 * decision 2026-10-06: AI search yes, training no.
 *
 * AI_SEARCH_AGENTS get the same rules as `*`, so AI search and assistants can
 * read and cite the public lessons. ChatGPT-User, Claude-User and
 * Perplexity-User fetch a page when a person asks for it; their vendors say
 * these user-fetch agents may not follow robots.txt.
 */
export const AI_SEARCH_AGENTS = [
  'OAI-SearchBot',
  'ChatGPT-User',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
] as const;

/**
 * AI_TRAINING_AGENTS are disallowed from `/`: pages may not be used to train
 * models. Google-Extended and Applebot-Extended are robots.txt control tokens,
 * not crawlers: Googlebot and Applebot still crawl for search, and these
 * tokens only say whether the pages may be used for AI training.
 */
export const AI_TRAINING_AGENTS = [
  'GPTBot',
  'ClaudeBot',
  'CCBot',
  'Google-Extended',
  'Applebot-Extended',
] as const;

/** llms.txt words that no page meta already gives (lib/content/llms.ts). Plain voice. */
export const LLMS_TEXT = {
  sections: { learn: 'Learn', blog: 'Blog', optional: 'Optional' },
  realmsLabel: 'Realms',
  blogLabel: 'Blog',
  leaderboardLabel: 'Leaderboard',
  sitemapLabel: 'Sitemap',
  sitemap: 'Every public page: realms, lessons and blog posts.',
  feedLabel: 'RSS feed',
  feed: 'Every blog post, newest first.',
  privacyLabel: 'Privacy',
} as const;
