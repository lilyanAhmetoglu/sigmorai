'use client';

import { useAuth } from '@clerk/nextjs';
import type { ReactNode } from 'react';
import { PixelButton } from '@/components/pixel-button';
import { useHideSignedOut } from '@/components/use-hide-signed-out';
import { DASHBOARD_HREF, LANDING_TEXT } from '@/lib/constants';
import type { ButtonSize } from '@/lib/types';
import { cn } from '@/lib/utils';

type Props = {
  size: ButtonSize;
  /** Where a signed-in visitor goes. Default: the dashboard. */
  signedInHref?: string;
  /** The signed-out CTAs. Server-rendered, so the static page ships them. None: show nothing. */
  children?: ReactNode;
};

/**
 * Swaps the signed-out CTAs for "Continue quest" once Clerk loads and finds a
 * session, so public pages (/, /blog, /privacy) stay static. /dashboard sends
 * a player who has not onboarded on to /onboarding.
 */
export function LandingCta({ size, signedInHref = DASHBOARD_HREF, children }: Props) {
  const { isLoaded, isSignedIn } = useAuth();
  const hide = useHideSignedOut();

  if (isLoaded && isSignedIn) {
    return (
      <PixelButton href={signedInHref} size={size}>
        {LANDING_TEXT.continueQuest}
      </PixelButton>
    );
  }

  // Same rule as the header (useHideSignedOut): hidden only while a likely
  // player's Clerk loads, at most CLERK_WAIT_MS, so a visitor sees no flicker
  // and the CTAs still show if Clerk never loads. `invisible` keeps their
  // space (no layout shift); `contents` keeps the parent's flex gap.
  return <div className={cn('contents', hide && 'invisible')}>{children}</div>;
}
