'use client';

import { useAuth } from '@clerk/nextjs';
import { useHideForLikelyPlayer } from '@/components/use-session-hint';

/**
 * useHideForLikelyPlayer for the Clerk branches (below a mounted
 * ClerkProvider): hidden only while Clerk itself still loads. The plain
 * branches call useHideForLikelyPlayer directly, so they don't import
 * @clerk/* into a visitor's page.
 */
export function useHideSignedOut(): boolean {
  const { isLoaded } = useAuth();
  return useHideForLikelyPlayer(!isLoaded);
}
