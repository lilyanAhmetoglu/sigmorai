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

/**
 * The share image (app/opengraph-image.tsx). Satori can't read CSS variables,
 * so the colours are the token values copied from design/tokens/colors.css.
 */
export const SHARE_IMAGE = {
  alt: `${SITE_NAME}: the pixel-art hero scene with the ${SITE_NAME} logo`,
  colors: {
    /** --ink-950 (--border-outline, shadows) */
    outline: '#0a0913',
    /** --ink-900 (--surface-1) */
    surface: '#131126',
    /** --ink-100 (--text-1) */
    text: '#f2f1fa',
    /** --spark-500 (--xp) */
    accent: '#ffc53d',
  },
} as const;
