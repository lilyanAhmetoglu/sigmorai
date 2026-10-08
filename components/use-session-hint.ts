'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { CLERK_WAIT_MS } from '@/lib/constants';
import { hasClerkSessionHint } from '@/lib/utils';

/**
 * Read again when the tab comes back: a sign-in or sign-out in another tab
 * changes the cookie, and there is no portable cookie-change event.
 */
const subscribe = (onChange: () => void) => {
  window.addEventListener('focus', onChange);
  document.addEventListener('visibilitychange', onChange);
  return () => {
    window.removeEventListener('focus', onChange);
    document.removeEventListener('visibilitychange', onChange);
  };
};

/**
 * Whether Clerk's `__client_uat` cookie says a player is likely signed in
 * (hasClerkSessionHint). False on the server and during hydration, so the
 * HTML and the first client render match. No @clerk/* import: plain branches
 * on a visitor's page use it. Only a hint for what to load and show; never
 * an auth check.
 */
export const useSessionHint = (): boolean =>
  useSyncExternalStore(
    subscribe,
    () => hasClerkSessionHint(document.cookie),
    () => false,
  );

/**
 * Whether to hide the signed-out CTAs (Sign in, Start free) for now: true
 * while `waiting` (Clerk not loaded yet) and a player is likely, for at most
 * CLERK_WAIT_MS. A visitor sees the CTAs from the first paint; a player does
 * not see them flash; if Clerk never loads they show after the wait. The
 * plain branches (no Clerk yet) call it as is; useHideSignedOut passes
 * Clerk's own `!isLoaded`. Callers hide with `invisible` (space kept, not
 * focusable).
 */
export function useHideForLikelyPlayer(waiting = true): boolean {
  const active = useSessionHint() && waiting;
  const [waited, setWaited] = useState(false);

  useEffect(() => {
    if (!active) return;
    const id = setTimeout(() => setWaited(true), CLERK_WAIT_MS);
    return () => clearTimeout(id);
  }, [active]);

  return active && !waited;
}
