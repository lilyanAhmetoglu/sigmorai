import { PublicHud } from '@/components/hud/public-hud';
import { SiteFooter } from '@/components/hud/site-footer';
import { SiteHeader } from '@/components/hud/site-header';
import { SkipLink } from '@/components/hud/skip-link';

/**
 * Public pages (landing, blog, privacy, sign-in, sign-up): the same header
 * and footer as the app, so the site has one header everywhere. The pages
 * stay static: the header's right side reads Clerk on the client
 * (PublicHud), not auth() on the server as the (app) layout does. Each page
 * brings its own <main>.
 */
export default function MarketingLayout({ children }: LayoutProps<'/'>) {
  return (
    <>
      <SkipLink />
      <SiteHeader hud={<PublicHud />} />
      {children}
      <SiteFooter />
    </>
  );
}
