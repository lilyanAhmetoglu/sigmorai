import type { REALM_STATUSES, STEP_STATUSES } from '@/lib/constants';
import type { RealmId, Tier } from './curriculum';
import type { ChapterStep, Track } from './exercise';

export type StepStatus = (typeof STEP_STATUSES)[number];
export type RealmStatus = (typeof REALM_STATUSES)[number];

/** One step of a chapter (or the boss case) and its state for this player. */
export type StepView = { step: ChapterStep; exerciseId: string; status: StepStatus };

/** A chapter, or the boss (`chapter: null`). Status comes from its case. */
export type ChapterView = {
  chapter: number | null;
  title: string;
  status: StepStatus;
  steps: StepView[];
  /** Done only by credit from a shared chapter on this track (shared-chapters spec): "Cleared on the … path". */
  creditedFrom?: Track;
};

export type RealmView = {
  id: RealmId;
  slug: string;
  name: string;
  npc: string;
  tier: Tier;
  topic: string;
  lore: string;
  status: RealmStatus;
  /** Chapters (and boss) whose case is cleared, out of `chapters.length`. */
  cleared: number;
  chapters: ChapterView[];
};

/** The step "Continue" opens: the first open step on the track, in map order. */
export type NextStep = { realm: RealmId; chapter: number | null; step: StepView };

/** A whole track for one player (or a visitor: no progress). */
export type TrackMap = { track: Track; realms: RealmView[]; next: NextStep | null };
