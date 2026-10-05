import type { ChoiceState, LevelStatus, QuestStatus, TestStatus } from '@/lib/types';

/**
 * Fixed UI words the primitives render (product voice: short, plain). Keyed by
 * the option lists in ./ui.ts, so a new status can't ship without its text.
 */

/** Choice marks: an icon and a word, so a graded answer never relies on colour. */
export const CHOICE_STATE_TEXT: Record<ChoiceState, string> = {
  correct: '✓ Correct',
  wrong: '✗ Wrong',
};

/** LevelNode tile glyph. Open and current show the level number instead. */
export const LEVEL_GLYPHS: Partial<Record<LevelStatus, string>> = {
  locked: '·',
  done: '✓',
};
/** Screen-reader status for a LevelNode (the tile glyph is aria-hidden). */
export const LEVEL_STATUS_TEXT: Record<LevelStatus, string> = {
  locked: 'locked',
  open: 'open',
  current: 'current level',
  done: 'done',
};

/** QuestCard button label per status. */
export const QUEST_ACTION_TEXT: Record<QuestStatus, string> = {
  open: 'Start',
  done: 'Replay',
  locked: 'Locked',
};

/** TestResult chip (visible, aria-hidden) and its spoken word. */
export const TEST_STATUS_TEXT: Record<TestStatus, { tag: string; label: string }> = {
  pass: { tag: 'PASS', label: 'Passed' },
  fail: { tag: 'FAIL', label: 'Failed' },
  pending: { tag: '····', label: 'Not run yet' },
  running: { tag: 'RUN', label: 'Running' },
};

/** App shell and HudBar words. */
export const SHELL_TEXT = {
  skipLink: 'Skip to content',
  navLabel: 'Main',
  menu: 'Menu',
  soon: 'Soon',
  footerLeft: 'SIGMORAI.COM',
  footerRight: 'LEARN · BUILD · ASCEND',
} as const;

export const HUD_TEXT = {
  label: 'Your stats',
  loading: 'Loading your stats',
  error: "Your stats didn't load.",
  retry: 'Retry',
  notSetUp: 'Hero not set up',
  hp: 'HP',
  hpEmpty: '—',
  hpEmptyHint: 'HP shows inside a challenge',
  streak: 'STREAK',
  streakUnit: 'days',
} as const;

export const DIALOG_NEXT_TEXT = '▸ NEXT';
export const TOAST_DISMISS_TEXT = 'Dismiss';
