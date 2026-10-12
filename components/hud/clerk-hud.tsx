'use client';

import { Show, UserButton, useAuth } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useHideSignedOut } from '@/components/use-hide-signed-out';
import { AUTH_ROUTES, HUD_API_HREF, HUD_FETCH_TIMEOUT_MS } from '@/lib/constants';
import type { HudState } from '@/lib/types';
import { cn, isUnderPath } from '@/lib/utils';
import { HudBar } from './hud-bar';
import { HudErrorView } from './hud-error-boundary';
import { HudSkeleton } from './hud-skeleton';
import { MenuSignInLink, SignedOutActions } from './signed-out-actions';

/**
 * The header's Clerk branches. Only ever loaded lazily, below a mounted
 * ClerkProvider (useClerkMounted), by PublicHud, MenuSignIn, AccountButton
 * and AuthControls. So @clerk/* stays out of a visitor's page JS, and no
 * Clerk hook runs without its provider.
 */

const SIGNED_OUT: HudState = { status: 'signed-out' };

/** One fetch result, tied to the user it was read for, so a sign-out or switch never shows old stats. */
type Loaded = { userId: string; state: HudState } | { userId: string; failed: true };

/**
 * PublicHud with Clerk mounted: reads Clerk on the client and, for a player,
 * fetches the same HudState the in-app header reads on the server
 * (app/api/hud). Same HudBar, skeleton and error view as the in-app slot.
 * Until Clerk says "signed in" it shows Sign in + Start free, hidden (space
 * kept) only while a likely player's Clerk loads, for at most CLERK_WAIT_MS
 * (useHideSignedOut). The fetch times out after HUD_FETCH_TIMEOUT_MS; a
 * timeout, a bad status or a body that fails HudStateSchema is the error
 * view with Retry.
 */
export function ClerkPublicHud() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const hideSignedOut = useHideSignedOut();
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => {
    setLoaded(null);
    setAttempt((n) => n + 1);
  }, []);

  useEffect(() => {
    if (!isSignedIn || !userId) return;
    // One controller for both the timeout and the cleanup (no AbortSignal.any:
    // it is missing before Safari 17.4). `cancelled` tells the two apart.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), HUD_FETCH_TIMEOUT_MS);
    let cancelled = false;
    // The schema (and Zod, ~95 KB gzipped) loads only here, for a player.
    // Fetched in parallel with the HUD.
    Promise.all([
      fetch(HUD_API_HREF, { cache: 'no-store', signal: controller.signal }).then((res) =>
        res.ok ? (res.json() as Promise<unknown>) : Promise.reject(new Error(`HUD ${res.status}`)),
      ),
      import('@/lib/types'),
    ])
      .then(([body, { HudStateSchema }]) =>
        setLoaded({ userId, state: HudStateSchema.parse(body) }),
      )
      .catch(() => {
        // Aborted by the cleanup (unmount, user switch): not an error to show.
        if (!cancelled) setLoaded({ userId, failed: true });
      })
      .finally(() => clearTimeout(timer));
    return () => {
      cancelled = true;
      clearTimeout(timer);
      controller.abort();
    };
  }, [isSignedIn, userId, attempt]);

  if (!isLoaded || !isSignedIn || !userId) {
    // `contents` keeps the header's flex layout; `invisible` keeps the space.
    return (
      <div className={cn('contents', hideSignedOut && 'invisible')}>
        <HudBar state={SIGNED_OUT} />
      </div>
    );
  }
  if (!loaded || loaded.userId !== userId) return <HudSkeleton />;
  if ('failed' in loaded) return <HudErrorView onRetry={retry} />;
  return <HudBar state={loaded.state} />;
}

/**
 * MenuSignIn with Clerk mounted: shown unless Clerk says signed in, and kept
 * hidden while a likely player's Clerk loads (useHideSignedOut).
 */
export function ClerkMenuSignIn() {
  const pathname = usePathname();
  const { isLoaded, isSignedIn } = useAuth();
  const hide = useHideSignedOut();
  if ((isLoaded && isSignedIn) || hide || isUnderPath(pathname, AUTH_ROUTES.signIn)) return null;
  return <MenuSignInLink />;
}

/** Clerk's account button (it owns sign-out). Its trigger is ~28px; grown to the 44px tap target. */
export function ClerkAccountButton() {
  return (
    <UserButton
      appearance={{
        elements: { userButtonTrigger: 'min-h-11 min-w-11', userButtonAvatarBox: 'size-9' },
      }}
    />
  );
}

/** AuthControls with Clerk mounted: Clerk's own signed-in / signed-out state picks. */
export function ClerkAuthControls() {
  return (
    <>
      <Show when="signed-out">
        <SignedOutActions />
      </Show>
      <Show when="signed-in">
        <ClerkAccountButton />
      </Show>
    </>
  );
}
