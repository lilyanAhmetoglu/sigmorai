'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useHydrated } from '@/components/use-hydrated';
import { CLERK_WAIT_MS } from '@/lib/constants';
import { hasClerkSessionHint } from '@/lib/utils';

/**
 * Whether static pages should hide their signed-out CTAs (Sign in, Start free)
 * for now. True only after hydration, while Clerk still loads, when Clerk's
 * cookie says a player is likely signed in, and for at most CLERK_WAIT_MS.
 * So a visitor sees the CTAs from the first paint with no flicker, a player
 * doesn't see them flash, and if Clerk never loads they show after the wait.
 * Callers hide with `invisible` (space kept, not focusable).
 */
export function useHideSignedOut(): boolean {
  const { isLoaded } = useAuth();
  const hydrated = useHydrated();
  const [waited, setWaited] = useState(false);

  useEffect(() => {
    if (isLoaded) return;
    const id = setTimeout(() => setWaited(true), CLERK_WAIT_MS);
    return () => clearTimeout(id);
  }, [isLoaded]);

  return hydrated && !isLoaded && !waited && hasClerkSessionHint(document.cookie);
}
