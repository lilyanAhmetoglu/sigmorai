import type { Metadata } from 'next';
import { JsonLd } from '@/components/json-ld';
import { AudienceSection } from '@/components/landing/audience-section';
import { LandingHero } from '@/components/landing/landing-hero';
import { LandingNav } from '@/components/landing/landing-nav';
import { LANDING_META, MAIN_CONTENT_ID, SITE_URL } from '@/lib/constants';
import { siteJsonLd } from '@/lib/content/json-ld';
import { socialMetadata } from '@/lib/og/metadata';

// Relative URLs resolve against metadataBase (app/layout.tsx).
export const metadata: Metadata = {
  title: { absolute: LANDING_META.title },
  description: LANDING_META.description,
  alternates: { canonical: '/' },
  // The image comes from app/(marketing)/opengraph-image.tsx; Twitter falls back to og:image.
  ...socialMetadata({ title: LANDING_META.title, description: LANDING_META.description, url: '/' }),
};

/** Public landing page. Static: no auth read, so it prerenders. */
export default function LandingPage() {
  return (
    <>
      <JsonLd data={siteJsonLd(SITE_URL)} />
      <LandingNav />
      <main id={MAIN_CONTENT_ID} tabIndex={-1} className="landing-main">
        <LandingHero />
        <AudienceSection />
      </main>
    </>
  );
}
