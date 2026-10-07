import type { WorldLandmark, WorldPlace, WorldSlot, WorldSlotRealm } from '@/lib/types';
import { FRONTIER, MATH_TOWER } from './curriculum';
import { FRONTIER_HREF, MATH_HREF } from './nav';

/** Footprint sizes (art px). */
const CORE = { w: 160, h: 120 } as const;
const SLOT = { w: 80, h: 64 } as const;
const LANDMARK = { w: 80, h: 80 } as const;

/**
 * World map geometry (docs/plans/world-map-design-plan.md → Geometry). One
 * place for every position, so the art and the code agree: the art is made
 * to fit these numbers, never the other way round.
 *
 * Units are art pixels on a 1024×768 grid (64×48 tiles of 16). The page
 * shows the grid at a zoom step (ZOOM_STEPS): ½, 1 or 2 screen px per art px.
 * A place is a rectangle `{ x, y, w, h }` centred on its anchor (x, y), the
 * point its marker stands on.
 */
export const WORLD_MAP = {
  width: 1024,
  height: 768,
  tile: 16,
  /** Core realms (on every path), by realm id. */
  realms: {
    0: { x: 140, y: 640, ...CORE },
    1: { x: 140, y: 420, ...CORE },
    2: { x: 380, y: 600, ...CORE },
    3: { x: 330, y: 200, ...CORE },
    4: { x: 560, y: 400, ...CORE },
    5: { x: 640, y: 640, ...CORE },
    6: { x: 870, y: 560, ...CORE },
    7: { x: 860, y: 320, ...CORE },
    8: { x: 620, y: 140, ...CORE },
  } as Readonly<Record<number, WorldPlace>>,
  /** Open sea kept for specialist islands. */
  slots: [
    { id: 's1', x: 260, y: 520, ...SLOT },
    { id: 's2', x: 520, y: 520, ...SLOT },
    { id: 's3', x: 200, y: 280, ...SLOT },
    { id: 's4', x: 470, y: 260, ...SLOT },
    { id: 's5', x: 760, y: 680, ...SLOT },
    { id: 's6', x: 720, y: 470, ...SLOT },
    { id: 's7', x: 930, y: 440, ...SLOT },
    { id: 's8', x: 780, y: 170, ...SLOT },
    { id: 's9', x: 280, y: 700, ...SLOT },
    { id: 's10', x: 380, y: 420, ...SLOT },
  ] as readonly WorldSlot[],
  /**
   * Which specialist realm stands on which slot. Empty until the first
   * specialist realm ships (per-path PR 1b); each realm's PR adds one row.
   */
  slotRealms: [] as readonly WorldSlotRealm[],
  landmarks: [
    {
      id: 'math',
      name: MATH_TOWER.name,
      href: MATH_HREF,
      accent: 'math',
      x: 120,
      y: 180,
      ...LANDMARK,
    },
    {
      id: 'frontier',
      name: FRONTIER.name,
      href: FRONTIER_HREF,
      accent: 'neutral',
      x: 950,
      y: 110,
      ...LANDMARK,
    },
  ] as readonly WorldLandmark[],
} as const;

/**
 * Zoom steps, in screen px per art px. Whole-number scales of an asset only:
 * ½ will draw world-512.png at 1:1, 1 and 2 draw world.png (level art is 2×,
 * so nothing goes above 2). The overview is ½ under WORLD_OVERVIEW_MIN_WIDTH,
 * else 1 (world-map.css picks it, so it works with no JS).
 */
export const ZOOM_STEPS = [0.5, 1, 2] as const;

/** Viewport width (px) from which the overview is zoom 1 instead of ½. Mirrors world-map.css. */
export const WORLD_OVERVIEW_MIN_WIDTH = 1024;

/** Two markers at zoom ½ are at least this far apart (art px), so 44px targets never overlap. */
export const WORLD_MIN_ANCHOR_GAP = 96;
