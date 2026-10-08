import { Suspense } from 'react';
import { ClerkGate } from '@/components/clerk-gate';
import { HudErrorBoundary } from '@/components/hud/hud-error-boundary';
import { HudSkeleton } from '@/components/hud/hud-skeleton';
import { HudSlot } from '@/components/hud/hud-slot';
import { SiteFooter } from '@/components/hud/site-footer';
import { SiteHeader } from '@/components/hud/site-header';
import { SkipLink } from '@/components/hud/skip-link';
import { MAIN_CONTENT_ID } from '@/lib/constants';
import { hasSession } from '@/lib/data/user';

/**
 * The in-app shell (skip link, header + HUD, main, footer) for every route in
 * this (app) group. The public pages render the same SiteHeader
 * (PublicShell); only the HUD source differs. Here the HUD is read on the
 * server (auth() + DB) and streams in, so the page doesn't wait on the stats
 * query. There it is read on the client, so the public pages stay static.
 * Clerk mounts only for a signed-in player (hasSession: the proxy's request
 * headers, no DB and no network), so a visitor on /map or a lesson
 * downloads no Clerk.
 */
export default async function AppLayout({ children }: LayoutProps<'/'>) {
  return (
    <ClerkGate enabled={await hasSession()}>
      <SkipLink />
      <SiteHeader
        hud={
          <HudErrorBoundary>
            <Suspense fallback={<HudSkeleton />}>
              <HudSlot />
            </Suspense>
          </HudErrorBoundary>
        }
      />
      <main id={MAIN_CONTENT_ID} tabIndex={-1} className="app-main">
        {children}
      </main>
      <SiteFooter />
    </ClerkGate>
  );
}
