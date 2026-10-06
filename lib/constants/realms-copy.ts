import type { Accent, ChapterStep, RealmStatus, StepStatus, Tier } from '@/lib/types';
import { CHAPTER_COUNT } from './exercises';
import { QUEST_ERROR_TEXT } from './ui-copy';

/**
 * Dashboard and realm page words (product voice: short, plain; lore only in
 * a DialogBox). A status always has an icon AND a word, never colour only.
 * Icons are decorative (rendered aria-hidden).
 */

type StatusText = { icon: string; label: string; accent: Accent };

/** UI form of a tier (design: realms catalog filter). */
export const TIER_TEXT: Record<Tier, string> = {
  beginner: 'BEGINNER',
  intermediate: 'INTERMEDIATE',
  advanced: 'ADVANCED',
};

/** The learner never sees "challenge": the step is a "Case". */
export const STEP_TEXT: Record<ChapterStep, string> = {
  lesson: 'Lesson',
  challenge: 'Case',
  'quick-check': 'Quick check',
};

/** Chapter lock ("clear the one before") and tier lock ("comes later") read differently (spec). */
export const STEP_STATUS_TEXT: Record<StepStatus, StatusText> = {
  done: { icon: '✓', label: 'DONE', accent: 'success' },
  open: { icon: '▸', label: 'OPEN', accent: 'accent' },
  locked: { icon: '·', label: 'LOCKED', accent: 'neutral' },
  'tier-locked': { icon: '·', label: 'COMING LATER', accent: 'neutral' },
  soon: { icon: '…', label: 'COMING SOON', accent: 'neutral' },
};

export const REALM_STATUS_TEXT: Record<RealmStatus, StatusText> = {
  cleared: { icon: '✓', label: 'CLEARED', accent: 'success' },
  'in-progress': { icon: '▸', label: 'IN PROGRESS', accent: 'xp' },
  open: { icon: '▸', label: 'OPEN', accent: 'accent' },
  'tier-locked': { icon: '·', label: 'ADVANCED · LOCKED', accent: 'neutral' },
};

/** The realm's main button, by its state. A cleared realm is replayed. */
export const REALM_ACTION_TEXT: Record<RealmStatus, string> = {
  cleared: 'Replay',
  'in-progress': 'Continue',
  open: 'Start',
  'tier-locked': 'View realm',
};

/** Realm card and realm page words. */
export const REALMS_TEXT = {
  title: 'Realms',
  eyebrow: 'ALL REALMS',
  /** "Explore realms · Builder path" (the label comes in caps). */
  heading: (trackLabel: string) =>
    `Explore realms · ${trackLabel.charAt(0)}${trackLabel.slice(1).toLowerCase()} path`,
  /** Meta description of the catalog. */
  description: `Every Sigmorai realm on the builder and strategist paths: ${CHAPTER_COUNT} chapters and a boss each, built from official docs.`,
  intro: `Every realm is a course: ${CHAPTER_COUNT} chapters and a boss, built from official docs.`,
  trackSwitch: 'Path',
  signInNote: 'Sign in to save your progress and earn XP.',
  signIn: 'Sign in',
  /** "REALM 03" */
  number: (number: string) => `REALM ${number}`,
  /** "REALM 03 · INTERMEDIATE" */
  tag: (number: string, tier: Tier) => `REALM ${number} · ${TIER_TEXT[tier]}`,
  /** Catalog meta row: what a realm holds. */
  meta: `${CHAPTER_COUNT} CHAPTERS + BOSS`,
  /** A tier-locked catalog card: the tier is already in its tag. */
  lockedNote: 'Locked for now. It opens in a later update.',
  clearedLabel: 'LEVELS CLEARED',
  tierLocked: QUEST_ERROR_TEXT.TIER_LOCKED,
  /** The current step's state word (design: "▸ NEXT"). */
  next: 'NEXT',
  chapters: 'CHAPTERS',
  chapterLabel: (n: number) => `Chapter ${n}`,
  bossLabel: 'Boss battle',
  bossGlyph: 'B',
  /** Chapter row chevron, closed / open (follows <details open>). */
  chevronClosed: '▸',
  chevronOpen: '▾',
  nothingLive: 'No chapters in this realm are ready yet. They come soon.',
  backIcon: '◂',
  back: 'All realms',
  notFound: 'This realm does not exist.',
  loading: 'Loading the realms',
  loadingRealm: 'Loading the realm',
  error: "The realms didn't load. Try again in a moment.",
  errorRealm: "This realm didn't load. Try again in a moment.",
  retry: 'Retry',
} as const;

/** Dashboard words. */
export const DASHBOARD_TEXT = {
  title: 'Dashboard',
  eyebrow: 'WELCOME BACK',
  greeting: (heroName: string) => `Hi, ${heroName}`,
  continueHeading: 'CONTINUE LEARNING',
  nothingOpen: 'Nothing new is open on your path right now.',
  nothingOpenHint: 'The next chapters are not built yet. They come soon.',
  realmsHeading: 'YOUR REALMS',
  noActiveRealms: 'You cleared every open realm. Browse all realms to replay one.',
  /** Stat labels (design: isDash STATS). Only stats with real data. */
  streak: 'DAY STREAK',
  levelsCleared: 'LEVELS CLEARED',
  browseAll: 'Browse all',
  browseIcon: '▸',
  stats: 'STATS',
  loading: 'Loading your dashboard',
  error: "Your dashboard didn't load. Try again in a moment.",
  retry: 'Retry',
} as const;

/** World map words (Sigmorai App.dc.html → isMap). */
export const MAP_TEXT = {
  /** "Bootstrap Village · World map · Sigmorai" */
  title: (realmName: string) => `${realmName} · World map · Sigmorai`,
  description: (realmName: string) =>
    `The ${realmName} level map: ${CHAPTER_COUNT} chapters and a boss, built from official docs.`,
  realmNav: 'Other realms',
  prevIcon: '◂',
  nextIcon: '▸',
  prevRealm: (name: string) => `Previous realm: ${name}`,
  nextRealm: (name: string) => `Next realm: ${name}`,
  /** "2/7 CLEARED": chapters + boss cleared in this realm. */
  progress: (cleared: number, total: number) => `${cleared}/${total} CLEARED`,
  /** Visually hidden heading over the node list. */
  levels: 'Levels',
  /** Under the strip: how a locked level opens. */
  hint: "Clear a chapter's case to open the next one.",
  allRealms: 'All realms',
  chapterList: 'Chapter list',
  /** The realm page's link to its map. */
  viewOnMap: 'View on map',
  loading: 'Loading the map',
  error: "The map didn't load. Try again in a moment.",
  retry: 'Retry',
} as const;
