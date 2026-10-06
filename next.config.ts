import type { NextConfig } from 'next';
import { clerkFapiOrigin, securityHeaders } from './lib/security/headers';

const headers = securityHeaders({
  fapi: clerkFapiOrigin(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY),
  dev: process.env.NODE_ENV === 'development',
  preview: process.env.VERCEL_ENV === 'preview',
});

const nextConfig: NextConfig = {
  // lib/content loaders read content/ from disk at runtime; ship it with every server route.
  outputFileTracingIncludes: { '/*': ['./content/**/*'] },
  // The image optimizer serves only the blog covers. Everything else is `unoptimized` (pixel art must not blur).
  images: { localPatterns: [{ pathname: '/blog/covers/**' }] },
  // No "X-Powered-By: Next.js": it only helps someone fingerprint the stack.
  poweredByHeader: false,
  // CSP, framing, sniffing, referrer and feature limits on every route (SIG-27).
  async headers() {
    return [{ source: '/(.*)', headers }];
  },
};

export default nextConfig;
