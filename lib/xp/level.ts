import { LEVEL_XP_STEP } from '@/lib/constants';
import type { LevelProgress } from '@/lib/types';

/** XP where `level` starts: LEVEL_XP_STEP × level². */
export function levelStartXp(level: number): number {
  return LEVEL_XP_STEP * level * level;
}

/**
 * Level = floor(sqrt(xp / LEVEL_XP_STEP)) (docs/build-prompt.md).
 * Bad input (negative, NaN, Infinity) is level 0.
 */
export function levelForXp(xp: number): number {
  if (!Number.isFinite(xp) || xp <= 0) return 0;
  let level = Math.floor(Math.sqrt(xp / LEVEL_XP_STEP));
  // Float sqrt can land one off at exact squares; fix it with integer maths.
  while (levelStartXp(level + 1) <= xp) level++;
  while (level > 0 && levelStartXp(level) > xp) level--;
  return level;
}

/** Level plus the XP into it and the size of it, for the HUD XPBar. */
export function levelProgress(xp: number): LevelProgress {
  const safeXp = Number.isFinite(xp) && xp > 0 ? Math.floor(xp) : 0;
  const level = levelForXp(safeXp);
  const start = levelStartXp(level);
  return { level, into: safeXp - start, span: levelStartXp(level + 1) - start };
}
