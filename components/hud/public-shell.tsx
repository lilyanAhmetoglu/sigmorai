import type { ReactNode } from 'react';
import { ClerkGate } from '@/components/clerk-gate';
import { PublicHud } from './public-hud';
import { SiteFooter } from './site-footer';
import { SiteHeader } from './site-header';
import { SkipLink } from './skip-link';

type Props = {
  /**
   * Mount Clerk always (the (auth) pages, whose sign-in and sign-up forms are
   * Clerk). Unset: only after hydration for a likely player (ClerkGate).
   */
  clerk?: true;
  /** The page, with its own <main>. */
  children: ReactNode;
};

/**
 * The shell of every page whose layout reads no auth() on the server: the
 * (marketing) and (auth) groups and the site 404. Same header and footer as
 * the (app) layout, so the site has one header everywhere. The header's right
 * side reads Clerk on the client (PublicHud), so the public pages stay static.
 */
export function PublicShell({ clerk, children }: Props) {
  return (
    <ClerkGate enabled={clerk}>
      <SkipLink />
      <SiteHeader hud={<PublicHud />} />
      {children}
      <SiteFooter />
    </ClerkGate>
  );
}
