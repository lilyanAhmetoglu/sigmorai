import { SiteFooter } from '@/components/hud/site-footer';
import { SkipLink } from '@/components/hud/skip-link';

/**
 * Public marketing pages. No app shell (HudBar, nav): the landing page brings
 * its own hero nav, as in the design. Same footer as the app.
 */
export default function MarketingLayout({ children }: LayoutProps<'/'>) {
  return (
    <>
      <SkipLink />
      {children}
      <SiteFooter />
    </>
  );
}
