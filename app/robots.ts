import type { MetadataRoute } from 'next';
import {
  AI_CRAWLERS,
  AUTH_ROUTES,
  DASHBOARD_HREF,
  ONBOARDING_HREF,
  PROFILE_HREF,
  SITE_URL,
  SITEMAP_HREF,
} from '@/lib/constants';

/** Private pages, Clerk's auth pages and the API stay out of every crawl. */
const DISALLOW = [
  DASHBOARD_HREF,
  PROFILE_HREF,
  ONBOARDING_HREF,
  AUTH_ROUTES.signIn,
  AUTH_ROUTES.signUp,
  '/api/',
];

/**
 * /robots.txt. One group for every crawler, and one that names the AI
 * crawlers (AI_CRAWLERS) with the same rules, so the choice to let AI search
 * cite lessons is written down. A named group replaces `*` for that bot, so
 * both groups must share DISALLOW. No per-environment branch: Vercel already
 * sends `X-Robots-Tag: noindex` on preview deployments.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: DISALLOW },
      { userAgent: [...AI_CRAWLERS], allow: '/', disallow: DISALLOW },
    ],
    sitemap: new URL(SITEMAP_HREF, SITE_URL).href,
  };
}
