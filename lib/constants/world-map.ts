import type { HeroSide, WorldLandmark, WorldPlace, WorldSlot, WorldSlotRealm } from '@/lib/types';
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
  /**
   * The Hallucinant fog around the edge of the world: each tile along the
   * edge is covered min–max art px deep (whole tiles, seeded, so the inner
   * edge is ragged), drawn from `seed`.
   */
  edgeFog: { min: 16, max: 48, seed: 7 },
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
   * Which specialist realm stands on which slot. Each realm's PR adds one row
   * (path-curriculum spec): r9 Canvas Workshop sits by r5 MCP Bridgelands,
   * r10 Reel Hollow between r2 Tool Forge and r3 Context Library,
   * r11 Pigment Bazaar between r1 Prompt Forest and r2 Tool Forge,
   * r12 Echo Caverns between r2 Tool Forge and r10 Reel Hollow,
   * r13 Pattern Atelier between r3 Context Library and r4 Agent Citadel.
   */
  slotRealms: [
    { slot: 's5', realm: 9 },
    { slot: 's10', realm: 10 },
    { slot: 's1', realm: 11 },
    { slot: 's2', realm: 12 },
    { slot: 's4', realm: 13 },
  ] as readonly WorldSlotRealm[],
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
      // Near the east edge: its label ends at the land's right edge, so it stays on the map at ½.
      align: 'end',
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

/**
 * Viewport width (px) from which the overview is zoom 1 instead of ½. Mirrors
 * world-map.css (68rem): the 1024px stage plus the page gutters and box edge
 * must fit, or zoom 1 would scroll sideways.
 */
export const WORLD_OVERVIEW_MIN_WIDTH = 1088;

/** Two markers at zoom ½ are at least this far apart (art px), so 44px targets never overlap. */
export const WORLD_MIN_ANCHOR_GAP = 96;

/** A box in screen px, relative to a point: [left, top, right, bottom]. */
type Box = readonly [number, number, number, number];

/**
 * The hero on the world map (world-map.css → .world-hero), in screen px
 * around the current anchor: it does not scale with the zoom. It is a 48px
 * PixelAvatar (size sm). `sides` is its top-left corner on each side of the
 * 28px pin; world-map.css uses the same numbers (a test checks). Left and
 * right sit 16px off the anchor, at the pin's height. Above and below clear
 * the current marker's own text too: the tag above the pin ("YOU ARE HERE")
 * and, from zoom 1, the name and state below it.
 */
export const WORLD_HERO = {
  size: 48,
  pin: 28,
  sides: {
    left: [-64, -24],
    right: [16, -24],
    above: [-24, -100],
    below: [-24, 72],
  } satisfies Record<HeroSide, readonly [number, number]>,
  /** The current marker's tag ("YOU ARE HERE", the wider one), measured. */
  tag: [-53, -47, 53, -24] satisfies Box,
  /** Its name and state from zoom 1, measured (2 rows; the width allows a long name). */
  detail: [-80, 26, 80, 69] satisfies Box,
} as const;

/** The sides the hero tries, in order: left is the default look. */
export const HERO_SIDES = [
  'left',
  'right',
  'above',
  'below',
] as const satisfies readonly HeroSide[];

/**
 * A landmark label (world-map.css → .world-landmark), in screen px: 44px
 * tall, `top` px above the island's south edge. Its width is the name in the
 * 10px HUD font plus the padding. `char` is a little more than a Silkscreen
 * letter (measured: "MATH TOWER" 77px, "THE FRONTIER" 86px), so the box is
 * never smaller than the real label.
 */
const LANDMARK_LABEL = { top: -12, h: 44, pad: 24, char: 8 } as const;

/** The hero's box on one side, relative to the anchor (screen px). */
export function heroBox(side: HeroSide): Box {
  const [x, y] = WORLD_HERO.sides[side];
  return [x, y, x + WORLD_HERO.size, y + WORLD_HERO.size];
}

/** A box moved by (x, y). */
const at = (x: number, y: number, [l, t, r, b]: Box): Box => [x + l, y + t, x + r, y + b];

/** Two boxes overlap (touching edges do not count). */
const hits = (a: Box, b: Box) => a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3];

/**
 * Is the hero clear on this side of `anchor` at zoom `z`? Clear means it
 * stays on the stage and touches nothing that says something: no pin (its
 * own, a core realm's, or any slot's, as if a realm stood there), no
 * landmark label, and not its own marker's tag or name.
 */
export function heroClear(
  anchor: { x: number; y: number },
  side: HeroSide,
  z: number,
  geometry: typeof WORLD_MAP = WORLD_MAP,
): boolean {
  const ax = anchor.x * z;
  const ay = anchor.y * z;
  const hero = at(ax, ay, heroBox(side));
  if (hero[0] < 0 || hero[1] < 0 || hero[2] > geometry.width * z || hero[3] > geometry.height * z)
    return false;

  const half = WORLD_HERO.pin / 2;
  const pins = [...Object.values(geometry.realms), ...geometry.slots].map((p) =>
    at(p.x * z, p.y * z, [-half, -half, half, half]),
  );
  const labels = geometry.landmarks.map((m) => {
    const w = m.name.length * LANDMARK_LABEL.char + LANDMARK_LABEL.pad;
    const left = m.align === 'end' ? (m.x + m.w / 2) * z - w : m.x * z - w / 2;
    const top = (m.y + m.h / 2) * z + LANDMARK_LABEL.top;
    return [left, top, left + w, top + LANDMARK_LABEL.h] as Box;
  });
  const own = [
    at(ax, ay, [-half, -half, half, half]),
    at(ax, ay, WORLD_HERO.tag),
    at(ax, ay, WORLD_HERO.detail),
  ];
  return ![...pins, ...labels, ...own].some((box) => hits(hero, box));
}

/**
 * The side of its pin the hero stands on at `anchor`: the first of
 * HERO_SIDES that is clear at every zoom step, so the hero never hides a
 * pin or a label. Null when no side is clear (a test forbids that for every
 * core realm and slot).
 */
export function heroSide(
  anchor: { x: number; y: number },
  geometry: typeof WORLD_MAP = WORLD_MAP,
): HeroSide | null {
  return (
    HERO_SIDES.find((side) => ZOOM_STEPS.every((z) => heroClear(anchor, side, z, geometry))) ?? null
  );
}
