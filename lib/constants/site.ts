/**
 * Site-wide identity and URLs: the root metadata, canonical links and auth
 * entry points read from here.
 */

export const SITE_NAME = 'Sigmorai';

/** Production origin. NEXT_PUBLIC_SITE_URL overrides it per environment (.env.example). */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sigmorai.com';

export const SITE_DESCRIPTION = 'A pixel-art RPG for learning AI engineering and agentic systems.';

/** Clerk's sign-in and sign-up pages (app/sign-in, app/sign-up). */
export const AUTH_ROUTES = {
  signIn: '/sign-in',
  signUp: '/sign-up',
} as const;

/** Labels for the links to AUTH_ROUTES (HUD auth controls, landing nav and hero). */
export const AUTH_TEXT = {
  signIn: 'Sign in',
  startFree: 'Start free',
} as const;

/**
 * AI crawlers that robots.txt names on purpose (app/robots.ts). They get the
 * same allow and disallow rules as every other crawler, so AI search and
 * assistants can read and cite the public lessons. Search bots fetch pages
 * for answers; training bots (GPTBot, CCBot, Google-Extended,
 * Applebot-Extended) may also use pages to train models. Removing a name here
 * does not block it: it then follows the `*` group. Tokens from each vendor's
 * crawler docs.
 */
export const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
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
