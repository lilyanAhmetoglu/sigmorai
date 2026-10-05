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
 * this (app) group. A route group, not the root layout, so the full-screen
 * sign-in pages (and later the landing page, which has its own hero nav in the
 * design) stay outside it without a second root layout.
 * The HUD streams in: the page doesn't wait on the stats query.
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
