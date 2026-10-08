import type { Metadata } from 'next';
import { PublicHud } from '@/components/hud/public-hud';
import { SiteFooter } from '@/components/hud/site-footer';
import { SiteHeader } from '@/components/hud/site-header';
import { SkipLink } from '@/components/hud/skip-link';
import { PixelButton } from '@/components/pixel-button';
import {
  BLOG_HREF,
  HOME_HREF,
  MAIN_CONTENT_ID,
  NOT_FOUND_META,
  NOT_FOUND_TEXT,
  REALMS_HREF,
} from '@/lib/constants';

export const metadata: Metadata = {
  title: { absolute: NOT_FOUND_META.title },
};

/**
 * The site-wide 404: every unknown URL and any notFound() with no nearer
 * not-found file. It renders inside the root layout only, which has no header
 * or footer, so it brings the public-page shell itself: the same header and
 * footer as the marketing layout.
 */
export default function NotFound() {
  return (
    <>
      <SkipLink />
      <SiteHeader hud={<PublicHud />} />
      <main
        id={MAIN_CONTENT_ID}
        tabIndex={-1}
        className="max-w-reading mx-auto flex w-full min-w-0 flex-1 flex-col gap-6 px-4 py-10"
      >
        <div className="flex flex-col gap-3">
          <p className="page-eyebrow">{NOT_FOUND_TEXT.eyebrow}</p>
          <h1 className="page-title">{NOT_FOUND_TEXT.title}</h1>
          <p className="page-intro">{NOT_FOUND_TEXT.body}</p>
        </div>
        <nav aria-label={NOT_FOUND_TEXT.linksLabel} className="flex flex-wrap gap-3">
          <PixelButton href={HOME_HREF}>{NOT_FOUND_TEXT.home}</PixelButton>
          <PixelButton href={REALMS_HREF} variant="secondary">
            {NOT_FOUND_TEXT.realms}
          </PixelButton>
          <PixelButton href={BLOG_HREF} variant="secondary">
            {NOT_FOUND_TEXT.blog}
          </PixelButton>
        </nav>
      </main>
      <SiteFooter />
    </>
  );
}
