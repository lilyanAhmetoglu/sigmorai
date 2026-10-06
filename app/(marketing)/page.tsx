import type { Metadata } from 'next';
import { AudienceSection } from '@/components/landing/audience-section';
import { LandingHero } from '@/components/landing/landing-hero';
import { LandingNav } from '@/components/landing/landing-nav';
import { LANDING_META, MAIN_CONTENT_ID, SITE_NAME } from '@/lib/constants';

// Relative URLs resolve against metadataBase (app/layout.tsx).
export const metadata: Metadata = {
  title: { absolute: LANDING_META.title },
  description: LANDING_META.description,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: SITE_NAME,
    locale: 'en_US',
    title: LANDING_META.title,
    description: LANDING_META.description,
  },
  // The image comes from app/(marketing)/opengraph-image.tsx; Twitter falls back to og:image.
  twitter: {
    card: 'summary_large_image',
    title: LANDING_META.title,
    description: LANDING_META.description,
  },
};

/** Public landing page. Static: no auth read, so it prerenders. */
export default function LandingPage() {
  return (
    <>
      <LandingNav />
      <main id={MAIN_CONTENT_ID} tabIndex={-1} className="landing-main">
        <LandingHero />
        <AudienceSection />
      </main>
    </>
  );
}
