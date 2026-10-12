'use client';

import dynamic from 'next/dynamic';
import { useClerkMounted } from '@/components/clerk-gate';
import { SignedOutActions } from './signed-out-actions';

// Lazy, so a page without Clerk never downloads @clerk/* (ClerkGate).
const ClerkAccountButton = dynamic(() =>
  import('./clerk-hud').then((mod) => mod.ClerkAccountButton),
);
const ClerkAuthControls = dynamic(() => import('./clerk-hud').then((mod) => mod.ClerkAuthControls));

/**
 * Clerk's account button (it owns sign-out). HudBar shows it only in a
 * player's state, which only comes with Clerk mounted; without Clerk there
 * is nothing to show.
 */
export function AccountButton() {
  return useClerkMounted() ? <ClerkAccountButton /> : null;
}

/**
 * Sign in / sign up when signed out, the account button when signed in, from
 * Clerk's own state. For places that don't know the HUD state (the HUD error
 * view). HudBar picks from its state instead. Without Clerk mounted the
 * visitor is signed out.
 */
export function AuthControls() {
  return useClerkMounted() ? <ClerkAuthControls /> : <SignedOutActions />;
}
