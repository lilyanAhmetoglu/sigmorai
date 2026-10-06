import type { Track } from './exercise';

/** One in-app nav entry (lib/constants/nav.ts). */
export type NavItem = {
  label: string;
  href: string;
  /** False until the route exists: rendered as text, never a link. */
  live: boolean;
};

/** Where the player is inside their current level (lib/xp/level.ts). */
export type LevelProgress = {
  level: number;
  /** XP earned since this level started. */
  into: number;
  /** XP from this level's start to the next level's start. */
  span: number;
};

/** HP for one challenge. Only the quest page knows it (HP is per challenge). */
export type HpValue = { value: number; max: number };

/** What the signed-in, onboarded player's HUD shows. */
export type HudStats = LevelProgress & {
  heroName: string;
  track: Track;
  /** Total XP (users.xp, the ledger cache). */
  xp: number;
  /** The shown streak: 0 once a UTC day was missed (lib/xp/streak.ts). */
  streak: number;
  /** A step was passed this UTC day. */
  activeToday: boolean;
};

/**
 * The HUD reader's answer (lib/data/hud.ts). No users row = signed in with
 * Clerk but not onboarded yet (the track picker writes the row).
 */
export type HudState =
  { status: 'signed-out' } | { status: 'onboarding' } | { status: 'ready'; stats: HudStats };
