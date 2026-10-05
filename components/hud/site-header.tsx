import type { ReactNode } from 'react';
import { LIVE_NAV_ITEMS, SHELL_TEXT } from '@/lib/constants';
import { MobileMenu } from './mobile-menu';
import { NavLinks } from './nav-links';
import { SiteLogo } from './site-logo';

type Props = {
  /** The HUD slot (HudBar, or its loading / error state). */
  hud: ReactNode;
};

/** Top bar (sticky from lg): logo, nav (row from lg, Menu below; hidden while no page is live), HUD. Styles: app-shell.css. */
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
