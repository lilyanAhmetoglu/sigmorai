import { FIRST_LEVEL, LEVEL_XP_STEP } from '@/lib/constants';
import type { LevelProgress } from '@/lib/types';

/**
 * XP where `level` starts: LEVEL_XP_STEP × (level − 1)². LV 1 starts at 0,
 * LV 2 at 100, LV 3 at 400. A level below LV 1 also starts at 0.
 */
export function levelStartXp(level: number): number {
  const steps = Math.max(0, level - FIRST_LEVEL);
  return LEVEL_XP_STEP * steps * steps;
}

/**
 * Level = floor(sqrt(xp / LEVEL_XP_STEP)) + 1 (docs/build-prompt.md).
 * A new player is LV 1. Bad input (negative, NaN, Infinity) is LV 1.
 */
export function levelForXp(xp: number): number {
  if (!Number.isFinite(xp) || xp <= 0) return FIRST_LEVEL;
  let level = Math.floor(Math.sqrt(xp / LEVEL_XP_STEP)) + FIRST_LEVEL;
  // Float sqrt can land one off at exact squares; fix it with integer maths.
  while (levelStartXp(level + 1) <= xp) level++;
  while (level > FIRST_LEVEL && levelStartXp(level) > xp) level--;
  return level;
}

/** Level plus the XP into it and the size of it, for the HUD XPBar. */
export function levelProgress(xp: number): LevelProgress {
  const safeXp = Number.isFinite(xp) && xp > 0 ? Math.floor(xp) : 0;
  const level = levelForXp(safeXp);
  const start = levelStartXp(level);
  return { level, into: safeXp - start, span: levelStartXp(level + 1) - start };
}
