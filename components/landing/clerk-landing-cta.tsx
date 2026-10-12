'use client';

import { useAuth } from '@clerk/nextjs';
import type { ReactNode } from 'react';
import { PixelButton } from '@/components/pixel-button';
import { useHideSignedOut } from '@/components/use-hide-signed-out';
import { LANDING_TEXT } from '@/lib/constants';
import type { ButtonSize } from '@/lib/types';
import { cn } from '@/lib/utils';

type Props = { size: ButtonSize; signedInHref: string; children?: ReactNode };

/**
 * LandingCta with Clerk mounted. Only loaded lazily below a ClerkProvider
 * (useClerkMounted), so @clerk/* stays out of a visitor's landing JS.
 */
export function ClerkLandingCta({ size, signedInHref, children }: Props) {
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
  // player's Clerk loads, at most CLERK_WAIT_MS, so the CTAs still show if
  // Clerk never loads. `invisible` keeps their space (no layout shift);
  // `contents` keeps the parent's flex gap.
  return <div className={cn('contents', hide && 'invisible')}>{children}</div>;
}
