import type { MetadataRoute } from 'next';
import { SITE_URL, SITEMAP_HREF } from '@/lib/constants';
import { robotsRules } from '@/lib/content/robots';

/**
 * /robots.txt. The rules: lib/content/robots.ts. No per-environment branch:
 * Vercel already sends `X-Robots-Tag: noindex` on preview deployments.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: robotsRules(),
    sitemap: new URL(SITEMAP_HREF, SITE_URL).href,
  };
}
