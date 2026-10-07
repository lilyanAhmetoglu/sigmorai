import { LandingCta } from '@/components/landing/landing-cta';
import { SiteLogo } from './site-logo';

/**
 * The plain header of a public text page (privacy, blog): the logo, no HUD
 * and no app nav. A signed-in player gets "Continue quest" back to the app
 * (LandingCta reads Clerk on the client, so these pages stay static); a
 * visitor sees only the logo. Styles: app-shell.css (.site-header).
 */
export function MarketingHeader() {
  return (
    <header className="site-header">
      <div className="site-header-bar justify-between">
        <SiteLogo />
        <LandingCta size="sm">{null}</LandingCta>
      </div>
    </header>
  );
}
