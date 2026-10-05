import type {
  ChoiceState,
  LevelStatus,
  QuestErrorCode,
  QuestStatus,
  SandboxKind,
  TestStatus,
  Track,
} from '@/lib/types';
import { CHAPTER_COUNT } from './exercises';
import { HERO_NAME_MAX, HERO_NAME_MIN } from './users';

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
  footerLeft: 'SIGMORAI.COM',
  footerRight: 'LEARN · BUILD · ASCEND',
} as const;

export const HUD_TEXT = {
  label: 'Your stats',
  loading: 'Loading your stats',
  error: "Your stats didn't load.",
  retry: 'Retry',
  setUp: 'Set up your hero',
  hp: 'HP',
  streak: 'STREAK',
  streakUnit: 'days',
} as const;

export const DIALOG_NEXT_TEXT = '▸ NEXT';
export const TOAST_DISMISS_TEXT = 'Dismiss';

/** Track name and one-line summary (design TR table: label + short). */
export const TRACK_TEXT: Record<Track, { label: string; short: string }> = {
  builder: { label: 'BUILDER', short: 'You write small Python programs. APIs, tools, agents.' },
  strategist: {
    label: 'STRATEGIST',
    short: 'No code. You judge real business cases: use cases, ROI, rules.',
  },
};

const HERO_NAME_RULE = `${HERO_NAME_MIN}–${HERO_NAME_MAX} characters: letters, numbers, spaces and . ' _ -`;

/** Onboarding (track picker) words. Field errors are fixed text, never Zod's messages. */
export const ONBOARDING_TEXT = {
  title: 'Create your hero',
  panel: 'NEW HERO',
  intro:
    "Pick a hero name and a path. Your hero name shows on the leaderboard. You can't change your path yet.",
  sprite: 'YOUR SPRITE',
  spriteHint: 'Drawn from your hero name. Same name, same sprite.',
  heroName: 'HERO NAME',
  heroNameHint: HERO_NAME_RULE,
  heroNameError: `Use ${HERO_NAME_RULE}`,
  path: 'Choose your path',
  beginnerHint: 'Not a coder? Pick strategist: no code.',
  trackError: 'Pick a path.',
  submitNote: "You can't change your path yet. Your hero name is public.",
  submit: 'Start',
  submitting: 'Saving…',
  unauthorized: 'Your session ended. Sign in again.',
  serverError: "Your hero wasn't saved. Try again in a moment.",
  loading: 'Loading hero setup',
  loadError: "Hero setup didn't load. Try again in a moment.",
  retry: 'Retry',
} as const;

/** Profile page words. */
export const PROFILE_TEXT = {
  title: 'Profile',
  panel: 'PLAYER',
  pathSuffix: 'PATH',
  avatarLabel: 'Sprite avatar for',
  totalXp: 'TOTAL XP',
  level: 'LEVEL',
  noXp: 'No XP yet. You earn XP by clearing lessons.',
  loading: 'Loading your profile',
  error: "Your profile didn't load. Try again in a moment.",
  retry: 'Retry',
} as const;

/**
 * Why a quest press was refused (QuestErrorCode). Reset times are not in the
 * text: the server sends `resetsAt` (UTC) and the browser shows local time.
 */
export const QUEST_ERROR_TEXT: Record<QuestErrorCode, string> = {
  UNAUTHENTICATED: 'Sign in to run and submit.',
  NOT_ONBOARDED: 'Set up your hero first.',
  INVALID_INPUT: 'This exercise is not available.',
  TIER_LOCKED: 'Advanced realms are locked. They come later.',
  NOT_OPEN: 'Clear the chapter before this one first.',
  NO_HP: 'No HP left for this challenge today.',
  CAP_REACHED: 'You reached the daily limit.',
  RUN_IN_PROGRESS: 'A run is already in progress. Wait for it to finish.',
  // Run and Submit both use this; Submit's "no HP was used" note is UI copy (Phase B).
  RUNNER_FAILED: 'The code runner failed. This is not your code. Try again.',
};

/** NOT_OPEN for chapter N: the chapter before it is not cleared. */
export const notOpenText = (previousChapter: number) => `Clear chapter ${previousChapter} first.`;
/** NOT_OPEN for a boss. */
export const BOSS_NOT_OPEN_TEXT = `Clear all ${CHAPTER_COUNT} chapters first.`;
/** CAP_REACHED: "You used 40 of 40 runs today." */
export const capReachedText = (kind: SandboxKind, used: number, cap: number) =>
  `You used ${used} of ${cap} ${kind === 'run' ? 'runs' : 'graded runs'} today.`;
