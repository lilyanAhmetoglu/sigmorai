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

/** Graded answer marks on a Choice (design/components/forms). Ungraded = no state. */
export const CHOICE_STATES = ['correct', 'wrong'] as const;

/** World-map node (design/components/game). "open" is the base style. */
export const LEVEL_STATUSES = ['locked', 'open', 'current', 'done'] as const;
/** Quest tile. "open" is the base style. */
export const QUEST_STATUSES = ['open', 'done', 'locked'] as const;
/** One test row in the challenge runner. "pending" is the base style. */
export const TEST_STATUSES = ['pass', 'fail', 'pending', 'running'] as const;

/** How long a toast stays before it closes by itself. It also has a Dismiss button. */
export const TOAST_DURATION_MS = 8_000;

/** Reset asks for a second press within this time before it throws the code away. */
export const RESET_CONFIRM_MS = 4_000;
