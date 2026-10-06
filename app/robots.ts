import type { MetadataRoute } from 'next';
import { DASHBOARD_HREF, ONBOARDING_HREF, PROFILE_HREF, SITE_URL } from '@/lib/constants';

/**
 * /robots.txt. Private pages and the API stay out of crawls. No per-environment
 * branch: Vercel already sends `X-Robots-Tag: noindex` on preview deployments.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [DASHBOARD_HREF, PROFILE_HREF, ONBOARDING_HREF, '/api/'],
    },
    sitemap: new URL('/sitemap.xml', SITE_URL).href,
  };
}
