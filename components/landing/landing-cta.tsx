'use client';

import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';
import { useClerkMounted } from '@/components/clerk-gate';
import { useHideForLikelyPlayer } from '@/components/use-session-hint';
import { DASHBOARD_HREF } from '@/lib/constants';
import type { ButtonSize } from '@/lib/types';
import { cn } from '@/lib/utils';

// Lazy, so a visitor's landing never downloads @clerk/* (ClerkGate).
const ClerkLandingCta = dynamic(() =>
  import('./clerk-landing-cta').then((mod) => mod.ClerkLandingCta),
);

type Props = {
  size: ButtonSize;
  /** Where a signed-in visitor goes. Default: the dashboard. */
  signedInHref?: string;
  /** The signed-out CTAs. Server-rendered, so the static page ships them. None: show nothing. */
  children?: ReactNode;
};

/**
 * Swaps the signed-out CTAs for "Continue quest" once Clerk loads and finds a
 * session, so public pages (/, /blog, /privacy) stay static. Without Clerk
 * mounted it is just the CTAs, hidden (space kept) only while a likely
 * player's Clerk chunk downloads, for at most CLERK_WAIT_MS
 * (useHideForLikelyPlayer). /dashboard sends a player who has not onboarded
 * on to /onboarding.
 */
export function LandingCta({ size, signedInHref = DASHBOARD_HREF, children }: Props) {
  const clerk = useClerkMounted();
  const hide = useHideForLikelyPlayer(!clerk);
  // `contents` keeps the parent's flex gap; `invisible` keeps the space.
  if (!clerk) return <div className={cn('contents', hide && 'invisible')}>{children}</div>;
  return (
    <ClerkLandingCta size={size} signedInHref={signedInHref}>
      {children}
    </ClerkLandingCta>
  );
}
