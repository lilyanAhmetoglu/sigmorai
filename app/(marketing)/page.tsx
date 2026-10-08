import type { Metadata } from 'next';
import { JsonLd } from '@/components/json-ld';
import { AudienceSection } from '@/components/landing/audience-section';
import { HowItWorks } from '@/components/landing/how-it-works';
import { LandingHero } from '@/components/landing/landing-hero';
import { LatestPosts } from '@/components/landing/latest-posts';
import { RealmsPreview } from '@/components/landing/realms-preview';
import {
  DEFAULT_TRACK,
  LANDING_META,
  LANDING_POST_COUNT,
  MAIN_CONTENT_ID,
  SITE_URL,
} from '@/lib/constants';
import { toBlogCard } from '@/lib/content/blog';
import { siteJsonLd } from '@/lib/content/json-ld';
import { listBlogPosts, loadTrackOutline } from '@/lib/content/load';
import { socialMetadata } from '@/lib/og/metadata';

// Relative URLs resolve against metadataBase (app/layout.tsx).
export const metadata: Metadata = {
  title: { absolute: LANDING_META.title },
  description: LANDING_META.description,
  alternates: { canonical: '/' },
  // The image comes from app/(marketing)/opengraph-image.tsx; Twitter falls back to og:image.
  ...socialMetadata({ title: LANDING_META.title, description: LANDING_META.description, url: '/' }),
};

/**
 * Public landing page: hero, the realm map, who it is for, how it works, the
 * newest posts (design order). Static: no auth read, and the outline and posts are content
 * files read at build time, so it prerenders.
 */
export default async function LandingPage() {
  const [outline, posts] = await Promise.all([loadTrackOutline(DEFAULT_TRACK), listBlogPosts()]);
  return (
    <>
      <JsonLd data={siteJsonLd(SITE_URL)} />
      <main id={MAIN_CONTENT_ID} tabIndex={-1} className="landing-main">
        <LandingHero />
        <RealmsPreview outline={outline} />
        <AudienceSection />
        <HowItWorks />
        <LatestPosts posts={posts.slice(0, LANDING_POST_COUNT).map(toBlogCard)} />
      </main>
    </>
  );
}
