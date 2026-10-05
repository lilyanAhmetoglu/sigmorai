/**
 * Deterministic 8×8 avatar sprite from a seed (port of PixelAvatar.jsx).
 * Pure TS: returns palette index + cells; the component maps them to colours.
 * The bit maths copy the design exactly (including signed `>>`), so a seed
 * draws the same sprite here as in the design file.
 */

import { AVATAR_GRID } from '@/lib/constants';

/** One lit cell. `tone` 0 = main colour, 1 = highlight. */
export type SpriteCell = { x: number; y: number; tone: 0 | 1 };

export type AvatarSprite = { palette: number; cells: SpriteCell[] };

/** 32-bit FNV-1a over code points. */
export function hashSeed(seed: string): number {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}

export function avatarSprite(seed: string, paletteCount: number): AvatarSprite {
  const h = hashSeed(seed);
  const cells: SpriteCell[] = [];
  const half = AVATAR_GRID / 2;
  let r = h;
  for (let y = 0; y < AVATAR_GRID; y++) {
    for (let x = 0; x < half; x++) {
      r = (Math.imul(r, 1103515245) + 12345) >>> 0;
      const on = y > 0 && y < AVATAR_GRID - 1 && (r >> 16) % 3 !== 0;
      if (!on) continue;
      const tone = (r >> 8) % 4 === 0 ? 1 : 0;
      cells.push({ x, y, tone }, { x: AVATAR_GRID - 1 - x, y, tone });
    }
  }
  return { palette: paletteCount > 0 ? h % paletteCount : 0, cells };
}
