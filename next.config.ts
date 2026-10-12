import type { NextConfig } from 'next';
import { MAP_HREF, REALMS_HREF } from './lib/constants/nav';
import { clerkFapiOrigin, securityHeaders } from './lib/security/headers';

const headers = securityHeaders({
  fapi: clerkFapiOrigin(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY),
  dev: process.env.NODE_ENV === 'development',
  preview: process.env.VERCEL_ENV === 'preview',
});

/** What every share image reads at render time: the logo and the Pixelify Sans woff files. */
const OG_FILES = ['./public/logo/**/*', './node_modules/@fontsource/pixelify-sans/files/*.woff'];

const nextConfig: NextConfig = {
  // lib/content loaders read content/ from disk at runtime; ship it with every server route.
  // The share images read art and fonts via process.cwd() (lib/og/og-card.tsx), which the
  // tracer can't follow. They are prerendered, but ship the files in case one renders on demand.
  // The certificate image (and its certificate.png download) is per player and always renders
  // on demand: it needs the logo and fonts.
  outputFileTracingIncludes: {
    '/*': ['./content/**/*'],
    '/realms/*/opengraph-image*': [...OG_FILES, './public/levels/**/*'],
    '/blog/*/opengraph-image*': [...OG_FILES, './public/blog/covers/**/*'],
    '/cert/*/*/opengraph-image*': OG_FILES,
    '/cert/*/*/certificate.png': OG_FILES,
  },
  // The image optimizer serves only the blog covers. Everything else is `unoptimized` (pixel art must not blur).
  images: { localPatterns: [{ pathname: '/blog/covers/**' }] },
  // No "X-Powered-By: Next.js": it only helps someone fingerprint the stack.
  poweredByHeader: false,
  // CSP, framing, sniffing, referrer and feature limits on every route (SIG-27).
  async headers() {
    return [{ source: '/(.*)', headers }];
  },
  // The realms list merged into the world map (maintainer, 2026-10-12). 308, so old links and
  // search results move over. The query (`?track=`) passes through on its own. Only the exact
  // path: the realm pages (/realms/<slug>) stay.
  async redirects() {
    return [{ source: REALMS_HREF, destination: MAP_HREF, permanent: true }];
  },
};

export default nextConfig;
