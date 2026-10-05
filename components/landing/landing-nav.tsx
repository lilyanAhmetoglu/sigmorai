import { SiteLogo } from '@/components/hud/site-logo';
import { PixelButton } from '@/components/pixel-button';
import { AUTH_ROUTES, AUTH_TEXT, LANDING_TEXT } from '@/lib/constants';

/**
 * Landing top bar over the hero art: logo, Sign in, Start free. Plain links,
 * not Clerk's <Show>, so the page stays static. Clerk's own pages send a
 * signed-in visitor on. Styles: landing.css.
 */
export function LandingNav() {
  return (
    <header className="landing-nav">
      <SiteLogo size={40} />
      <nav aria-label={LANDING_TEXT.navLabel} className="landing-nav-actions">
        <PixelButton href={AUTH_ROUTES.signIn} variant="ghost" size="sm">
          {AUTH_TEXT.signIn}
        </PixelButton>
        <PixelButton href={AUTH_ROUTES.signUp} size="sm">
          {AUTH_TEXT.startFree}
        </PixelButton>
      </nav>
    </header>
  );
}
