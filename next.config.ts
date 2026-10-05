import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // lib/content loaders read content/ from disk at runtime; ship it with every server route.
  outputFileTracingIncludes: { '/*': ['./content/**/*'] },
};

export default nextConfig;
