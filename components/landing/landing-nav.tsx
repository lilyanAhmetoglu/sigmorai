import { SiteLogo } from '@/components/hud/site-logo';
import { LandingCta } from '@/components/landing/landing-cta';
import { PixelButton } from '@/components/pixel-button';
import { AUTH_ROUTES, AUTH_TEXT, LANDING_TEXT } from '@/lib/constants';

/**
 * Landing top bar over the hero art: logo, Sign in, Start free. Not Clerk's
 * <Show> (a server auth read would make / dynamic): LandingCta swaps in
 * "Continue your quest" on the client. Styles: landing.css.
 */
export function LandingNav() {
  return (
    <header className="landing-nav">
      <SiteLogo size={40} />
      <nav aria-label={LANDING_TEXT.navLabel} className="landing-nav-actions">
        <LandingCta size="sm">
          <PixelButton href={AUTH_ROUTES.signIn} variant="ghost" size="sm">
            {AUTH_TEXT.signIn}
          </PixelButton>
          <PixelButton href={AUTH_ROUTES.signUp} size="sm">
            {AUTH_TEXT.startFree}
          </PixelButton>
        </LandingCta>
      </nav>
    </header>
  );
}
