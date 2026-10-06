'use client';

import { useAuth } from '@clerk/nextjs';
import { type ReactNode, useSyncExternalStore } from 'react';
import { PixelButton } from '@/components/pixel-button';
import { DASHBOARD_HREF, LANDING_TEXT } from '@/lib/constants';
import type { ButtonSize } from '@/lib/types';
import { cn } from '@/lib/utils';

// Same "has hydrated" check as components/quest/reset-note.tsx.
const noSubscribe = () => () => {};

type Props = {
  size: ButtonSize;
  /** Where a signed-in visitor goes. Default: the dashboard. */
  signedInHref?: string;
  /** The signed-out CTAs. Server-rendered, so the static page ships them. */
  children: ReactNode;
};

/**
 * Swaps the landing CTAs for "Continue quest" once Clerk loads and finds a
 * session, so / stays static. /dashboard sends a player who has not onboarded
 * on to /onboarding.
 */
export function LandingCta({ size, signedInHref = DASHBOARD_HREF, children }: Props) {
  const { isLoaded, isSignedIn } = useAuth();
  const isClient = useSyncExternalStore(
    noSubscribe,
    () => true,
    () => false,
  );

  if (isLoaded && isSignedIn) {
    return (
      <PixelButton href={signedInHref} size={size}>
        {LANDING_TEXT.continueQuest}
      </PixelButton>
    );
  }

  // Hidden only while JS runs and Clerk is still loading: a signed-in player
  // never sees or tabs to Sign in / Start free, and `invisible` keeps their
  // space (no layout shift). The static HTML (isClient false) shows them, so
  // they still work if JS fails. `contents` keeps the parent's flex gap.
  return <div className={cn('contents', isClient && !isLoaded && 'invisible')}>{children}</div>;
}
