import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/constants';

/**
 * The Open Graph and Twitter tags of a shareable page. The image itself comes
 * from the route's opengraph-image.tsx (file metadata wins over this object,
 * so it is never dropped); X falls back to og:image. `url` is a site path,
 * resolved against metadataBase (app/layout.tsx).
 */
export function socialMetadata({
  title,
  description,
  url,
  type = 'website',
}: {
  title: string;
  description: string;
  url: string;
  type?: 'website' | 'article';
}): Pick<Metadata, 'openGraph' | 'twitter'> {
  return {
    openGraph: { type, url, siteName: SITE_NAME, locale: 'en_US', title, description },
    twitter: { card: 'summary_large_image', title, description },
  };
}
