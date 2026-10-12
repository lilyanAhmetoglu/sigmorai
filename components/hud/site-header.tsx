import type { ReactNode } from 'react';
import { LIVE_NAV_ITEMS, SHELL_TEXT } from '@/lib/constants';
import { MobileMenu } from './mobile-menu';
import { NavLinks } from './nav-links';
import { SiteLogo } from './site-logo';

type Props = {
  /**
   * The header's right side: HudBar, or its loading / error state. The (app)
   * layout passes the server slot (HudSlot in Suspense); public pages pass PublicHud.
   */
  hud: ReactNode;
};

/**
 * The one site header, on every page (the (app) layout and PublicShell, for
 * the (marketing) and (auth) layouts and the site 404): logo, nav (row from xl, Menu below; hidden while no page is
 * live), HUD. Sticky from lg. Styles: app-shell.css.
 */
export function SiteHeader({ hud }: Props) {
  return (
    <header className="site-header">
      <div className="site-header-bar">
        <SiteLogo />
        {LIVE_NAV_ITEMS.length > 0 && (
          <>
            <nav className="site-nav" aria-label={SHELL_TEXT.navLabel}>
              <NavLinks />
            </nav>
            <MobileMenu />
          </>
        )}
        {hud}
      </div>
    </header>
  );
}
