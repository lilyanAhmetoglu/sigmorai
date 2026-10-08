'use client';

import { useAuth, useClerk } from '@clerk/nextjs';
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { HUD_API_HREF } from '@/lib/constants';
import type { HudState } from '@/lib/types';
import { HudBar } from './hud-bar';
import { HudErrorView } from './hud-error-boundary';
import { HudSkeleton } from './hud-skeleton';

// Same "has hydrated" check as components/landing/landing-cta.tsx.
const noSubscribe = () => () => {};

const SIGNED_OUT: HudState = { status: 'signed-out' };

/** One fetch result, tied to the user it was read for, so a sign-out or switch never shows old stats. */
type Loaded = { userId: string; state: HudState } | { userId: string; failed: true };

/**
 * The header HUD on static pages (the marketing group, the site 404). A
 * server auth() read would make them dynamic, so this reads Clerk on the
 * client and, for a player, fetches the same HudState the in-app header
 * reads on the server (app/api/hud). Same HudBar, skeleton and error view as
 * the in-app slot.
 * The static HTML ships Sign in + Start free (they work before JS). While
 * Clerk loads they are hidden but keep their space, so a player never sees
 * them flash; if Clerk fails to load they show again.
 */
export function PublicHud() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { status } = useClerk();
  const isClient = useSyncExternalStore(
    noSubscribe,
    () => true,
    () => false,
  );
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => {
    setLoaded(null);
    setAttempt((n) => n + 1);
  }, []);

  useEffect(() => {
    if (!isSignedIn || !userId) return;
    const controller = new AbortController();
    fetch(HUD_API_HREF, { cache: 'no-store', signal: controller.signal })
      .then((res) => (res.ok ? (res.json() as Promise<HudState>) : Promise.reject(res.status)))
      .then((state) => setLoaded({ userId, state }))
      .catch(() => {
        if (!controller.signal.aborted) setLoaded({ userId, failed: true });
      });
    return () => controller.abort();
  }, [isSignedIn, userId, attempt]);

  if (!isClient || status === 'error' || (isLoaded && !isSignedIn)) {
    return <HudBar state={SIGNED_OUT} />;
  }
  if (!isLoaded) {
    return (
      <div className="invisible contents">
        <HudBar state={SIGNED_OUT} />
      </div>
    );
  }
  if (!loaded || loaded.userId !== userId) return <HudSkeleton />;
  if ('failed' in loaded) return <HudErrorView onRetry={retry} />;
  return <HudBar state={loaded.state} />;
}
