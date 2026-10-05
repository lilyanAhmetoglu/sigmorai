/**
 * Site-wide identity and URLs: the root metadata, canonical links and auth
 * entry points read from here.
 */

export const SITE_NAME = 'Sigmorai';

/** Production origin. NEXT_PUBLIC_SITE_URL overrides it per environment (.env.example). */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sigmorai.com';

export const SITE_DESCRIPTION = 'A pixel-art RPG for learning AI engineering and agentic systems.';

/** Clerk's sign-in and sign-up pages (app/sign-in, app/sign-up). */
export const AUTH_ROUTES = {
  signIn: '/sign-in',
  signUp: '/sign-up',
} as const;

/** Labels for the links to AUTH_ROUTES (HUD auth controls, landing nav and hero). */
export const AUTH_TEXT = {
  signIn: 'Sign in',
  startFree: 'Start free',
} as const;
