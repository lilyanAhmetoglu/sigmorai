import type { ChoiceState, LevelStatus, QuestErrorCode, QuestStatus, Track } from '@/lib/types';
import { QUICK_CHECK_QUESTIONS } from './content';
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
  builder: { label: 'BUILDER', short: 'You judge real design cases: prompts, tools, agents, RAG.' },
  strategist: {
    label: 'STRATEGIST',
    short: 'You judge real business cases: use cases, ROI, rules.',
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
  beginnerHint:
    'No code on either path. New to AI, or using it at work? Pick strategist. Want to design AI systems? Pick builder.',
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
  noXp: 'No XP yet. You earn XP by clearing lessons, cases and quick checks.',
  loading: 'Loading your profile',
  error: "Your profile didn't load. Try again in a moment.",
  retry: 'Retry',
} as const;

/** Why a quest press was refused (QuestErrorCode). */
export const QUEST_ERROR_TEXT: Record<QuestErrorCode, string> = {
  UNAUTHENTICATED: 'Sign in to save your progress.',
  NOT_ONBOARDED: 'Set up your hero first.',
  INVALID_INPUT: 'This step is not available.',
  TIER_LOCKED: 'Advanced realms are locked. They come later.',
  NOT_OPEN: 'Clear the chapter before this one first.',
  NO_HP:
    'No HP left for this case today. HP refills at 00:00 UTC. The lesson and quick check stay open.',
  SERVER_ERROR: 'Something failed on our side. Nothing was saved. Try again in a moment.',
};

/**
 * Quest page words (lessons, cases, quick checks). Product voice only: no lore
 * outside a DialogBox. The learner never sees the word "challenge": the step
 * is a "Case". Times are not in the text: the page shows `resetsAt` in local
 * time right after these lines, then `localTimeSuffix`.
 */
export const QUEST_TEXT = {
  localTimeSuffix: '(your time).',
  cleared: (xp: number) => `LEVEL CLEARED · +${xp} XP`,
  clearedBody: 'Added to your total. Press Continue to go on.',
  notifications: 'Notifications',
  noticeHeading: 'Quest',
  notAvailable: 'This step is not available yet.',
  notAvailableHint: 'Lessons are not built yet.',
  // Tags: "BOOTSTRAP VILLAGE · CHAPTER 1 · CASE"
  chapterTag: (n: number) => `CHAPTER ${n}`,
  bossTag: 'BOSS',
  caseTag: 'CASE',
  quickCheckTag: 'QUICK CHECK',
  quickCheckTitle: 'Quick check',
  quickCheckIntro: `${QUICK_CHECK_QUESTIONS} questions on this chapter. Get them all right for XP. It costs no HP.`,
  caseFile: 'CASE FILE',
  exhibit: 'EXHIBIT',
  questionsLabel: 'Questions',
  /** Decorative: rendered aria-hidden through PixelButton's `icon`. */
  submitIcon: '▸',
  submitAnswers: 'Submit answers',
  submitting: 'Checking…',
  tryAgain: 'Try again',
  continue: 'Continue',
  signInToSubmit: 'Sign in to submit',
  answerAll: 'Answer every question to submit.',
  caseNote: 'Costs 1 HP if any answer is wrong.',
  quickCheckNote: 'No HP cost.',
  replayNote: 'Practice · no HP, no XP.',
  noHp: 'No HP left for this case. HP refills at',
  resultHeading: 'Result',
  passed: 'All answers correct.',
  passedReplay: 'Cleared again · XP already earned.',
  failed: (right: number, total: number) =>
    `${right} of ${total} correct. Each wrong answer has a note under it.`,
  /** Added to `failed` only when the Try again button shows. */
  failedRetry: 'Then try again.',
  hpLeft: (hp: number, max: number) => `${hp} of ${max} HP left today.`,
  xpToastTitle: (xp: number) => `+${xp} XP`,
  xpToastText: (title: string) => `Quest cleared: ${title}`,
  levelUpTitle: (level: number) => `Level ${level} reached`,
  /** The action may have finished (and spent HP) before the reply was lost. */
  noReply: 'No reply from the server. Reload the page to see your HP and result.',
  locked: 'LOCKED',
  /** The back link (questBackHref): the quest's realm page until the world map ships. */
  backIcon: '◂',
  back: 'Back to realm',
  loading: 'Loading the quest',
  loadError: "The quest didn't load. Try again in a moment.",
  retry: 'Retry',
} as const;

/** NOT_OPEN for chapter N: the chapter before it is not cleared. */
export const notOpenText = (previousChapter: number) => `Clear chapter ${previousChapter} first.`;
/** NOT_OPEN for a boss. */
export const BOSS_NOT_OPEN_TEXT = `Clear all ${CHAPTER_COUNT} chapters first.`;
