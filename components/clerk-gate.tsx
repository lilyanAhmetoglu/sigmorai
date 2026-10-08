'use client';

import dynamic from 'next/dynamic';
import { createContext, startTransition, use, useEffect, useState, type ReactNode } from 'react';
import { useHydrated } from '@/components/use-hydrated';
import { decideClerk } from '@/lib/utils';

/**
 * Its own chunk, so @clerk/* is not in a visitor's page JS. Not `ssr: false`:
 * that drops the children from the server HTML too, and the (app) and (auth)
 * layouts must still render on the server. When the gate opens after
 * hydration it only downloads now.
 */
const ClerkProvider = dynamic(() => import('@clerk/nextjs').then((mod) => mod.ClerkProvider));

const ClerkMountedContext = createContext(false);

/**
 * True below a mounted ClerkProvider. Clerk's hooks and components throw
 * without one, so a component that can render on a page without Clerk
 * branches on this and keeps its Clerk branch in a lazy module
 * (components/hud/clerk-hud.tsx, components/landing/clerk-landing-cta.tsx).
 */
export const useClerkMounted = (): boolean => use(ClerkMountedContext);

type Props = {
  /**
   * true: always mount Clerk (a signed-in player in (app), the (auth) pages).
   * false: never. Unset: a public page; mount after hydration only when the
   * `__client_uat` cookie says a player is likely (decideClerk).
   */
  enabled?: boolean;
  children: ReactNode;
};

/**
 * Mounts ClerkProvider only where a page needs it (curriculum plan,
 * amendments 2026-10-08). When Clerk mounts it always loads with its UI:
 * never pass prefetchUI={false} (Clerk can't add the UI later in that tab),
 * and keep one provider config (a second provider reuses the loaded Clerk).
 * Once open it stays open for this layout, so a sign-out (which refreshes the
 * layout with enabled=false) doesn't pull Clerk out from under its own flow.
 * Opening later swaps the subtree (React remounts the children once); the
 * swap runs in a transition, so the old page stays on screen while the
 * provider chunk downloads.
 */
export function ClerkGate({ enabled, children }: Props) {
  const hydrated = useHydrated();
  const want = decideClerk(enabled, hydrated, hydrated ? document.cookie : '');
  const [mounted, setMounted] = useState(want);

  useEffect(() => {
    if (want && !mounted) startTransition(() => setMounted(true));
  }, [want, mounted]);

  if (!mounted) return children;
  return (
    <ClerkMountedContext value>
      <ClerkProvider>{children}</ClerkProvider>
    </ClerkMountedContext>
  );
}
