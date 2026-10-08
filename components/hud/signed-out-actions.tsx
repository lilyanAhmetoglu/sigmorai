'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useClerkMounted } from '@/components/clerk-gate';
import { PixelButton } from '@/components/pixel-button';
import { useHideForLikelyPlayer } from '@/components/use-session-hint';
import { AUTH_ROUTES, AUTH_TEXT } from '@/lib/constants';
import { isUnderPath } from '@/lib/utils';

// Lazy, so a visitor's page never downloads @clerk/* (ClerkGate).
const ClerkMenuSignIn = dynamic(() => import('./clerk-hud').then((mod) => mod.ClerkMenuSignIn));

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
      {!isUnderPath(pathname, AUTH_ROUTES.signIn) && (
        <PixelButton
          href={AUTH_ROUTES.signIn}
          variant="secondary"
          size="sm"
          className="hud-sign-in"
        >
          {AUTH_TEXT.signIn}
        </PixelButton>
      )}
      {!isUnderPath(pathname, AUTH_ROUTES.signUp) && (
        <PixelButton href={AUTH_ROUTES.signUp} size="sm">
          {AUTH_TEXT.startFree}
        </PixelButton>
      )}
    </div>
  );
}

/**
 * Sign in inside the mobile Menu panel, below sm only (the bar has no room for
 * it there). Hidden on /sign-in. Without Clerk mounted it shows, except
 * while a likely player's Clerk chunk downloads (useHideForLikelyPlayer, the
 * same rule ClerkMenuSignIn uses); with Clerk, ClerkMenuSignIn hides it for a
 * player.
 */
export function MenuSignIn() {
  const pathname = usePathname();
  const clerk = useClerkMounted();
  const hide = useHideForLikelyPlayer(!clerk);
  if (clerk) return <ClerkMenuSignIn />;
  return hide || isUnderPath(pathname, AUTH_ROUTES.signIn) ? null : <MenuSignInLink />;
}

/** The Menu's Sign in link itself, for MenuSignIn and ClerkMenuSignIn. */
export function MenuSignInLink() {
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
