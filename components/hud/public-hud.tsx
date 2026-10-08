'use client';

import { useAuth } from '@clerk/nextjs';
import { useCallback, useEffect, useState } from 'react';
import { useHideSignedOut } from '@/components/use-hide-signed-out';
import { HUD_API_HREF, HUD_FETCH_TIMEOUT_MS } from '@/lib/constants';
import { type HudState, HudStateSchema } from '@/lib/types';
import { cn } from '@/lib/utils';
import { HudBar } from './hud-bar';
import { HudErrorView } from './hud-error-boundary';
import { HudSkeleton } from './hud-skeleton';

const SIGNED_OUT: HudState = { status: 'signed-out' };

/** One fetch result, tied to the user it was read for, so a sign-out or switch never shows old stats. */
type Loaded = { userId: string; state: HudState } | { userId: string; failed: true };

/**
 * The header HUD on static pages (the marketing group, the site 404). A
 * server auth() read would make them dynamic, so this reads Clerk on the
 * client and, for a player, fetches the same HudState the in-app header
 * reads on the server (app/api/hud). Same HudBar, skeleton and error view as
 * the in-app slot.
 * Until Clerk says "signed in" it shows Sign in + Start free: plain links in
 * the static HTML, so they work before JS and when Clerk fails. They are
 * hidden (space kept) only while a likely player's Clerk loads, for at most
 * CLERK_WAIT_MS (useHideSignedOut). The fetch times out after
 * HUD_FETCH_TIMEOUT_MS; a timeout, a bad status or a body that fails
 * HudStateSchema is the error view with Retry.
 */
export function PublicHud() {
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
    fetch(HUD_API_HREF, { cache: 'no-store', signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HUD ${res.status}`))))
      .then((body: unknown) => setLoaded({ userId, state: HudStateSchema.parse(body) }))
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
