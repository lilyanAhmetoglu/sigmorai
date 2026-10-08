import { Suspense } from 'react';
import { HudErrorBoundary } from '@/components/hud/hud-error-boundary';
import { HudSkeleton } from '@/components/hud/hud-skeleton';
import { HudSlot } from '@/components/hud/hud-slot';
import { SiteFooter } from '@/components/hud/site-footer';
import { SiteHeader } from '@/components/hud/site-header';
import { SkipLink } from '@/components/hud/skip-link';
import { MAIN_CONTENT_ID } from '@/lib/constants';

/**
 * The in-app shell (skip link, header + HUD, main, footer) for every route in
 * this (app) group. The (marketing) layout renders the same SiteHeader; only
 * the HUD source differs. Here the HUD is read on the server (auth() + DB)
 * and streams in, so the page doesn't wait on the stats query. There it is
 * read on the client, so the public pages stay static.
 */
export default function AppLayout({ children }: LayoutProps<'/'>) {
  return (
    <>
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
    </>
  );
}
