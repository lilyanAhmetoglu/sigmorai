import type { Accent, ChapterStep, RealmStatus, StepStatus, Tier } from '@/lib/types';
import { FRONTIER, MATH_TOWER } from './curriculum';
import { MATH_FLOOR_COUNT } from './exercises';
import { QUEST_ERROR_TEXT } from './ui-copy';

/**
 * Dashboard and realm page words (product voice: short, plain; lore only in
 * a DialogBox). A status always has an icon AND a word, never colour only.
 * Icons are decorative (rendered aria-hidden).
 */

type StatusText = { icon: string; label: string; accent: Accent };

/** `BUILDER` → `Builder`: a track label inside a sentence. */
const pathWord = (trackLabel: string) =>
  `${trackLabel.charAt(0)}${trackLabel.slice(1).toLowerCase()}`;

/** The Frontier's empty state, one sentence (its page and the dashboard panel). */
const FRONTIER_EMPTY =
  'No chapters yet. We add a chapter when official docs publish something new.';

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
  heading: (trackLabel: string) => `Explore realms · ${pathWord(trackLabel)} path`,
  /** Meta description of the catalog. */
  description:
    'Every Sigmorai realm on every path. Each one is a course: its chapters, then a boss, built from official docs.',
  intro: 'Every realm is a course: its chapters, then a boss, built from official docs.',
  trackSwitch: 'Path',
  signInNote: 'Sign in to save your progress and earn XP.',
  signIn: 'Sign in',
  /** "REALM 03" */
  number: (number: string) => `REALM ${number}`,
  /** A specialist realm (one path only) on its card and its "Your path" row: text, not colour only. */
  pathRealm: 'PATH REALM',
  /** "REALM 03 · INTERMEDIATE" */
  tag: (number: string, tier: Tier) => `REALM ${number} · ${TIER_TEXT[tier]}`,
  /** Catalog meta row: what a realm holds on this path ("6 CHAPTERS + BOSS"). */
  meta: (chapters: number) => `${chapters} CHAPTERS + BOSS`,
  /** A tier-locked catalog card: the tier is already in its tag. */
  lockedNote: 'Locked for now. It opens in a later update.',
  clearedLabel: 'LEVELS CLEARED',
  tierLocked: QUEST_ERROR_TEXT.TIER_LOCKED,
  /** The current step's state word (design: "▸ NEXT"). */
  next: 'NEXT',
  chapters: 'CHAPTERS',
  chapterLabel: (n: number) => `Chapter ${n}`,
  bossLabel: 'Boss battle',
  /** Under a chapter a shared chapter on another path cleared (shared-chapters spec). */
  creditedFrom: (trackLabel: string) => `Cleared on the ${pathWord(trackLabel)} path`,
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

/** "1 day", "14 days". */
const streakDays = (n: number) => `${n.toLocaleString('en')} ${n === 1 ? 'day' : 'days'}`;

/** Dashboard words. */
export const DASHBOARD_TEXT = {
  title: 'Dashboard',
  eyebrow: 'WELCOME BACK',
  greeting: (heroName: string) => `Hi, ${heroName}`,
  continueHeading: 'CONTINUE LEARNING',
  nothingOpen: 'Nothing new is open on your path right now.',
  nothingOpenHint: 'The next chapters are not built yet. They come soon.',
  /** The link under "YOUR PATH" (WORLD_MAP_TEXT.pathHeading) to the world map. */
  viewWorldMap: 'View on world map',
  /** Stat labels (design: isDash STATS). Only stats with real data. */
  streak: 'DAY STREAK',
  levelsCleared: 'LEVELS CLEARED',
  mathFloors: 'MATH FLOORS',
  /** "1 / 3": cleared live floors / live floors. */
  mathFloorsValue: (cleared: number, live: number) => `${cleared} / ${live}`,
  /** Screen-reader form of the value: "1 of 3". */
  mathFloorsSr: (cleared: number, live: number) => `${cleared} of ${live}`,
  /**
   * The MATH TOWER panel (design: isDash aside), plain product voice: no
   * Numerist Oru line here. The sentence carries the state, not the colour.
   */
  tower: {
    heading: MATH_TOWER.name.toUpperCase(),
    /** "FLOOR 2" (the Panel tab says MATH TOWER; the name is in the sentence). */
    floor: (n: number) => `FLOOR ${n}`,
    open: (name: string) => `${name} is open.`,
    climb: 'Climb',
    /** Screen-reader end of the Climb button's name. */
    climbTarget: (n: number) => ` to floor ${n}`,
    cleared: 'You cleared every open floor.',
    clearedHint: 'New floors come soon. You can replay any floor.',
    soon: 'The next floor is not built yet. It comes soon.',
    viewTower: 'View the tower',
  },
  /**
   * The FRONTIER panel (curriculum plan, amendment 2026-10-07 SIG-29): the
   * newest chapter not cleared yet, else one sentence. Plain product voice.
   */
  frontier: {
    heading: FRONTIER.name.toUpperCase(),
    /** "2026-10-05": the chapter's date, same as the chapter card. */
    date: (date: string) => date,
    open: (title: string) => `${title} is open.`,
    openButton: 'Open',
    /** Screen-reader end of the Open button's name. */
    openTarget: (title: string) => `: ${title}`,
    cleared: 'You cleared every Frontier chapter. New chapters come when the docs change.',
    /** The Frontier read failed; the rest of the dashboard still shows. */
    error: "The Frontier didn't load.",
    empty: FRONTIER_EMPTY,
    viewFrontier: 'View the Frontier',
  },
  browseAll: 'Browse all',
  browseIcon: '▸',
  stats: 'STATS',
  /**
   * DAILY QUEST note (design: isDash aside), plain product voice. Never shame
   * a broken streak, never fake urgency (DESIGN.md): no "lose", no "burning".
   * The icon is decorative (aria-hidden); the sentence carries the state.
   */
  dailyQuest: {
    heading: 'DAILY QUEST',
    done: {
      icon: '✓',
      text: (streak: number) => `Today's step is done. Streak: ${streakDays(streak)}.`,
    },
    alive: {
      icon: '▸',
      text: (streak: number) => `Clear one step today. Streak: ${streakDays(streak)}.`,
    },
    none: { icon: '▸', text: () => 'Clear one step today to start a streak.' },
  },
  loading: 'Loading your dashboard',
  error: "Your dashboard didn't load. Try again in a moment.",
  retry: 'Retry',
} as const;

/** Level map words, one realm's side view (Sigmorai App.dc.html → isMap). */
export const MAP_TEXT = {
  /** "Bootstrap Village · Level map · Sigmorai" */
  title: (realmName: string) => `${realmName} · Level map · Sigmorai`,
  description: (realmName: string) =>
    `The ${realmName} level map: every chapter and the boss, built from official docs.`,
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
  loading: 'Loading the level map',
  error: "The level map didn't load. Try again in a moment.",
  retry: 'Retry',
} as const;

/** `0.5` → `½`: a zoom step as text. */
const zoomWord = (zoom: number) => (zoom === 0.5 ? '½' : String(zoom));

/**
 * World map words (app/(app)/map/(world); world-map spec). Plain product
 * voice: no NPC, no lore. A state is always an icon AND a word.
 */
export const WORLD_MAP_TEXT = {
  title: 'World map',
  metaTitle: 'World map · Sigmorai',
  description:
    'The world of Sigmorai: every realm on your path, what you cleared and where you are.',
  /** "STRATEGIST PATH" */
  eyebrow: (trackLabel: string) => `${trackLabel} PATH`,
  intro: 'Each land is a realm on your path. Open a land to see its level map.',
  /** The map box (a labelled section). */
  mapLabel: 'World map',
  hint: 'Scroll or swipe to move around the map. Zoom with + and −.',
  /**
   * "03 Prompt Forest, in progress, 2 of 7 cleared, you are here": starts with
   * the visible number and name (WCAG 2.5.3); the "·" in a state word is dropped.
   */
  marker: (
    number: string,
    name: string,
    state: string,
    cleared: number,
    total: number,
    tag?: string,
  ) =>
    `${number} ${name}, ${state.replace(/\s*·\s*/g, ' ').toLowerCase()}, ${cleared} of ${total} cleared${tag ? `, ${tag.toLowerCase()}` : ''}`,
  /** On the current realm, for a player with a hero. */
  youAreHere: 'YOU ARE HERE',
  /** On the first open realm, for a visitor. */
  startHere: 'START HERE',
  /** The list heading: "YOUR PATH" for a player, "REALMS ON THIS PATH" for a visitor. */
  pathHeading: 'YOUR PATH',
  pathHeadingVisitor: 'REALMS ON THIS PATH',
  /** The level map's link back to the world map. */
  backIcon: '◂',
  back: 'World map',
  zoomIn: 'Zoom in',
  zoomOut: 'Zoom out',
  zoomInIcon: '+',
  zoomOutIcon: '−',
  /** "ZOOM ½×" */
  zoomLabel: (zoom: number) => `ZOOM ${zoomWord(zoom)}×`,
  loading: 'Loading the world map',
  error: "The world map didn't load. Try again in a moment.",
  retry: 'Retry',
} as const;

/**
 * Math Tower page words (app/(app)/math). Plain product voice: the tower's
 * NPC speaks only inside a DialogBox, and this page has none.
 */
export const MATH_TEXT = {
  title: MATH_TOWER.name,
  eyebrow: `SIDE REALM · ${MATH_FLOOR_COUNT} FLOORS`,
  /** Meta description and the line under the title. */
  description: `The math behind AI systems, one floor at a time: vectors, probability, statistics and more. ${MATH_FLOOR_COUNT} free floors, each a short lesson and a quick check.`,
  intro: `The math behind AI systems, one floor at a time. Each floor is a short lesson and a quick check. Clear a floor's quick check to open the next floor. Every floor is free on every path.`,
  floorsHeading: 'FLOORS',
  /** "FLOOR 3" */
  floorLabel: (n: number) => `FLOOR ${n}`,
  /** Visually hidden heading over a floor's formulas. */
  formulas: 'Formulas',
  backIcon: '◂',
  back: 'All realms',
  loading: 'Loading the Math Tower',
  error: "The Math Tower didn't load. Try again in a moment.",
  retry: 'Retry',
} as const;

/**
 * The Frontier page words (app/(app)/frontier; curriculum plan, amendment
 * 2026-10-07 SIG-29). Plain product voice: no NPC, no lore.
 */
export const FRONTIER_TEXT = {
  title: FRONTIER.name,
  eyebrow: 'SIDE REALM · NEW IN THE DOCS',
  /** Meta description, and the fixed description of every Frontier lesson. */
  description:
    'Short chapters on what is new in official AI docs. Open on every path, in any order.',
  intro:
    'What is new in official AI docs, newest first. Each chapter is a short lesson and a quick check. Every chapter is open, in any order, on every path.',
  chaptersHeading: 'CHAPTERS',
  empty: FRONTIER_EMPTY,
  minutes: (n: number) => `${n} min`,
  backIcon: '◂',
  back: 'All realms',
  loading: 'Loading the Frontier',
  error: "The Frontier didn't load. Try again in a moment.",
  retry: 'Retry',
} as const;

/** The "Side realms" link row on /realms. */
export const SIDE_REALMS_TEXT = {
  heading: 'SIDE REALMS',
  icon: '▸',
} as const;
