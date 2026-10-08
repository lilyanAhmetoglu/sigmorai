'use client';

import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import { PixelButton } from '@/components/pixel-button';
import { useHideSignedOut } from '@/components/use-hide-signed-out';
import { AUTH_ROUTES, AUTH_TEXT } from '@/lib/constants';

/** On that auth page (or one of Clerk's steps under it, e.g. /sign-in/factor-one). */
const isOn = (pathname: string, route: string) =>
  pathname === route || pathname.startsWith(`${route}/`);

/**
 * Sign in + Start free: the header's right side for a visitor. Plain links,
 * so they work before hydration and when Clerk fails to load. The one that
 * points at the current page is left out (no Sign in on /sign-in). Below sm
 * only Start free shows here; Sign in moves into the Menu (MenuSignIn), so
 * the header stays one row at 360px. Styles: hud-bar.css.
 */
export function SignedOutActions() {
  const pathname = usePathname();
  return (
    <div className="hud-actions">
      {!isOn(pathname, AUTH_ROUTES.signIn) && (
        <PixelButton
          href={AUTH_ROUTES.signIn}
          variant="secondary"
          size="sm"
          className="hud-sign-in"
        >
          {AUTH_TEXT.signIn}
        </PixelButton>
      )}
      {!isOn(pathname, AUTH_ROUTES.signUp) && (
        <PixelButton href={AUTH_ROUTES.signUp} size="sm">
          {AUTH_TEXT.startFree}
        </PixelButton>
      )}
    </div>
  );
}

/**
 * Sign in inside the mobile Menu panel, below sm only (the bar has no room for
 * it there). Shown unless Clerk says signed in, hidden on /sign-in, and kept
 * hidden while a likely player's Clerk loads (useHideSignedOut).
 */
export function MenuSignIn() {
  const pathname = usePathname();
  const { isLoaded, isSignedIn } = useAuth();
  const hide = useHideSignedOut();
  if ((isLoaded && isSignedIn) || hide || isOn(pathname, AUTH_ROUTES.signIn)) return null;
  return (
    <ul className="nav-list mobile-menu-auth">
      <li>
        <Link href={AUTH_ROUTES.signIn} className="nav-link">
          {AUTH_TEXT.signIn}
        </Link>
      </li>
    </ul>
  );
}
