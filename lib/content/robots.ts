/**
 * The robots.txt rules (app/robots.ts). Pure, like lib/content/sitemap.ts.
 * Three groups: every crawler; the AI search agents with the same rules (AI
 * search may cite lessons); the AI training agents, kept out of the whole
 * site (lib/constants/site.ts). A named group replaces `*` for that bot, so
 * the search group must repeat DISALLOW.
 */
import type { MetadataRoute } from 'next';
import {
  AI_SEARCH_AGENTS,
  AI_TRAINING_AGENTS,
  AUTH_ROUTES,
  DASHBOARD_HREF,
  ONBOARDING_HREF,
  PROFILE_HREF,
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

export function robotsRules(): MetadataRoute.Robots['rules'] {
  return [
    { userAgent: '*', allow: '/', disallow: DISALLOW },
    { userAgent: [...AI_SEARCH_AGENTS], allow: '/', disallow: DISALLOW },
    { userAgent: [...AI_TRAINING_AGENTS], disallow: '/' },
  ];
}
