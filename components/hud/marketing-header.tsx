import { SiteLogo } from './site-logo';

/**
 * The plain header of a public text page (privacy, blog): the logo only, no
 * HUD and no app nav. Styles: app-shell.css (.site-header).
 */
export function MarketingHeader() {
  return (
    <header className="site-header">
      <div className="site-header-bar">
        <SiteLogo />
      </div>
    </header>
  );
}
