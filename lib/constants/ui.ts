/**
 * Option names for the design-system primitives (design/components/core).
 * Names only: the styles for each one live in app/styles/components/*.css,
 * keyed by data-* attributes. Derived types are in lib/types/ui.ts.
 */

export const BUTTON_VARIANTS = [
  'primary',
  'xp',
  'success',
  'secondary',
  'danger',
  'ghost',
] as const;
export const BUTTON_SIZES = ['sm', 'md', 'lg'] as const;

export const PANEL_TONES = ['default', 'sunken', 'raised', 'story'] as const;
export const PANEL_PADDINGS = ['none', 'sm', 'md', 'lg'] as const;

export const AVATAR_SIZES = ['sm', 'md', 'lg'] as const;
/** Avatar sprite is AVATAR_GRID × AVATAR_GRID art pixels. */
export const AVATAR_GRID = 8;
/** Sprite palettes defined in pixel-avatar.css (data-palette 0..4). */
export const AVATAR_PALETTE_COUNT = 5;

/**
 * Tints set by data-accent in accents.css. Every primitive takes one
 * `accent` prop (the design .d.ts files use color/frame/kind; unified on purpose).
 */
export const ACCENTS = [
  'accent',
  'xp',
  'success',
  'info',
  'danger',
  'math',
  'neutral',
  'realm-0',
  'realm-1',
  'realm-2',
  'realm-3',
  'realm-4',
  'realm-5',
  'realm-6',
  'realm-7',
  'realm-8',
  'realm-math',
] as const;
