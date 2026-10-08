'use client';

import dynamic from 'next/dynamic';
import { useClerkMounted } from '@/components/clerk-gate';
import type { HudState } from '@/lib/types';
import { HudBar } from './hud-bar';

const SIGNED_OUT: HudState = { status: 'signed-out' };

// Lazy, so a visitor's page never downloads @clerk/* (ClerkGate).
const ClerkPublicHud = dynamic(() => import('./clerk-hud').then((mod) => mod.ClerkPublicHud));

/**
 * The header HUD on pages whose layout doesn't read auth() on the server
 * (the marketing and (auth) groups, the site 404). A server read would make
 * the public pages dynamic. Without Clerk mounted (a visitor) it is Sign in +
 * Start free: plain links in the static HTML, so they work before JS and
 * when Clerk fails. With Clerk mounted, ClerkPublicHud reads Clerk on the
 * client and, for a player, fetches the HUD from app/api/hud.
 */
export function PublicHud() {
  return useClerkMounted() ? <ClerkPublicHud /> : <HudBar state={SIGNED_OUT} />;
}
