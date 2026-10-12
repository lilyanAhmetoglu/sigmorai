'use client';

import dynamic from 'next/dynamic';
import { createContext, startTransition, use, useEffect, useState, type ReactNode } from 'react';
import { useSessionHint } from '@/components/use-session-hint';
import { decideClerk } from '@/lib/utils';

type Provider = (typeof import('@clerk/nextjs'))['ClerkProvider'];

/**
 * For a gate open from the first render (`enabled` true on the server): its
 * own chunk, server-rendered and preloaded. Not `ssr: false`: that drops the
 * children from the server HTML too, and the (app) and (auth) layouts must
 * still render on the server.
 */
const ServerClerkProvider = dynamic(() => import('@clerk/nextjs').then((mod) => mod.ClerkProvider));

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
   * true: Clerk from the first render (a signed-in player in (app), the
   * (auth) pages). false or unset: only after hydration, when the
   * `__client_uat` cookie says a player is likely (decideClerk). false is
   * the (app) layout's server answer; it can be stale, because Next keeps a
   * layout on client navigation.
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
 *
 * Opening later (no server yes) downloads the chunk with a plain import(),
 * not next/dynamic: a failed download then leaves the page as it is, with no
 * Clerk, instead of throwing in render. The import only runs once the gate
 * decides to open, so a visitor downloads no Clerk. The swap runs in a
 * transition (the old page stays on screen) and React remounts the children
 * once (accepted for v1).
 */
export function ClerkGate({ enabled, children }: Props) {
  const want = decideClerk(enabled, useSessionHint());
  const [fromServer] = useState(enabled === true);
  const [late, setLate] = useState<Provider | null>(null);

  useEffect(() => {
    if (!want || fromServer || late) return;
    let live = true;
    import('@clerk/nextjs')
      .then((mod) => {
        if (live) startTransition(() => setLate(() => mod.ClerkProvider));
      })
      // No Clerk: the plain branches stay, and their CTAs show after CLERK_WAIT_MS.
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [want, fromServer, late]);

  const ClerkProvider = fromServer ? ServerClerkProvider : late;
  if (!ClerkProvider) return children;
  return (
    <ClerkMountedContext value>
      <ClerkProvider>{children}</ClerkProvider>
    </ClerkMountedContext>
  );
}
