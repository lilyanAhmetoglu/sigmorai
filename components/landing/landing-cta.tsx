'use client';

import { useAuth } from '@clerk/nextjs';
import type { ReactNode } from 'react';
import { PixelButton } from '@/components/pixel-button';
import { DASHBOARD_HREF, LANDING_TEXT } from '@/lib/constants';
import type { ButtonSize } from '@/lib/types';

type Props = {
  size: ButtonSize;
  /** The signed-out CTAs. Server-rendered, so the static page ships them. */
  children: ReactNode;
};

/**
 * Swaps the landing CTAs for "Continue your quest" once Clerk loads and finds
 * a session. Until then (and on the prerendered HTML) the signed-out CTAs show,
 * so the page stays static. /dashboard sends a player who has not onboarded on
 * to /onboarding.
 */
export function LandingCta({ size, children }: Props) {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded || !isSignedIn) return children;
  return (
    <PixelButton href={DASHBOARD_HREF} size={size}>
      {LANDING_TEXT.continueQuest}
    </PixelButton>
  );
}
