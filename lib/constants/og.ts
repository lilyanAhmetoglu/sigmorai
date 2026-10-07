/**
 * Share-image (Open Graph) sizes, used by lib/og/og-card.tsx and every
 * opengraph-image.tsx. Words drawn on the images are in ./share.ts (OG_TEXT).
 */

/** The share image: 1200×630 PNG (Open Graph and X large card). */
export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = 'image/png';

/** Native size of public/art/hero-<layer>.png (the landing hero, drawn at 1×). */
export const OG_HERO_ART = { width: 1920, height: 640 } as const;
/** Native size of public/levels/<scene>/<layer>.png. */
export const OG_LEVEL_ART = { width: 1024, height: 240 } as const;
/** Whole-pixel scale that fills the 630px height: 3 × 240 = 720 (crops 90px off the sky). */
export const OG_LEVEL_ART_SCALE = 3;
