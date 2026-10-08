import type {
  HeroSide,
  RealmStatus,
  WorldLandmark,
  WorldPlace,
  WorldGlyphKind,
  WorldClearBox,
  ZoomStep,
  WorldSlot,
  WorldSlotRealm,
} from '@/lib/types';
import { FRONTIER, MATH_TOWER } from './curriculum';
import { FRONTIER_HREF, MATH_HREF } from './nav';

/**
 * Footprint sizes (art px). Each place has its own: a land is as big as the
 * sea around it allows (no two footprints overlap; a test checks). A slot no
 * realm uses yet keeps the small SLOT size.
 */
const SLOT = { w: 80, h: 64 } as const;
const LANDMARK = { w: 96, h: 96 } as const;

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
  edgeFog: { min: 16, max: 64, seed: 7 },
  /**
   * How a drawn coast is shaped (coastBands): rows of `step` art px (4
   * screen px at zoom ½, so a step never splits a pixel); the ends follow a
   * superellipse of power `round` (2 = an ellipse, higher = squarer) at
   * `fill` of the footprint's width, plus
   * a random walk of up to `wobble` steps, a bay `depth` steps deep on one
   * side, and a cape `rows` rows long that reaches the footprint edge on
   * the other. All in whole steps, seeded per land.
   */
  coast: { step: 8, round: 2.6, fill: 0.9, wobble: 2, bay: { depth: 2 }, cape: { rows: 2 } },
  /** Core realms (on every path), by realm id. */
  realms: {
    0: { x: 140, y: 640, w: 160, h: 144 },
    1: { x: 140, y: 420, w: 160, h: 152 },
    2: { x: 380, y: 600, w: 160, h: 120 },
    3: { x: 330, y: 200, w: 160, h: 136 },
    4: { x: 560, y: 400, w: 192, h: 136 },
    5: { x: 640, y: 640, w: 160, h: 136 },
    6: { x: 870, y: 560, w: 160, h: 136 },
    7: { x: 860, y: 320, w: 192, h: 136 },
    8: { x: 620, y: 140, w: 192, h: 136 },
  } as Readonly<Record<number, WorldPlace>>,
  /** Open sea kept for specialist islands. */
  slots: [
    { id: 's1', x: 260, y: 520, w: 80, h: 128 },
    { id: 's2', x: 532, y: 520, w: 128, h: 80 },
    { id: 's3', x: 192, y: 284, w: 96, h: 96 },
    { id: 's4', x: 482, y: 264, w: 128, h: 96 },
    { id: 's5', x: 792, y: 684, w: 128, h: 96 },
    { id: 's6', x: 720, y: 470, w: 96, h: 128 },
    { id: 's7', x: 930, y: 440, ...SLOT },
    { id: 's8', x: 780, y: 150, ...SLOT },
    { id: 's9', x: 280, y: 700, ...SLOT },
    { id: 's10', x: 380, y: 420, w: 128, h: 96 },
  ] as readonly WorldSlot[],
  /**
   * Which specialist realm stands on which slot. Each realm's PR adds one row
   * (path-curriculum spec): r9 Canvas Workshop sits by r5 MCP Bridgelands,
   * r10 Reel Hollow between r2 Tool Forge and r3 Context Library,
   * r11 Pigment Bazaar between r1 Prompt Forest and r2 Tool Forge,
   * r12 Echo Caverns between r2 Tool Forge and r10 Reel Hollow,
   * r13 Pattern Atelier between r3 Context Library and r4 Agent Citadel,
   * r14 Agent Workshop (builder) between r4 Agent Citadel and r5 MCP Bridgelands,
   * r15 Guild Hall (strategist) between r1 Prompt Forest and r2 Tool Forge.
   */
  slotRealms: [
    { slot: 's5', realm: 9 },
    { slot: 's10', realm: 10 },
    { slot: 's1', realm: 11 },
    { slot: 's2', realm: 12 },
    { slot: 's4', realm: 13 },
    { slot: 's6', realm: 14 },
    { slot: 's3', realm: 15 },
  ] as readonly WorldSlotRealm[],
  landmarks: [
    {
      id: 'math',
      name: MATH_TOWER.name,
      href: MATH_HREF,
      accent: 'math',
      x: 120,
      y: 132,
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
      y: 158,
      ...LANDMARK,
    },
  ] as readonly WorldLandmark[],
  /**
   * The compass rose (decoration), centred on (x, y), `size` art px square.
   * In open sea north of the middle: a test keeps it off every land, pin
   * and label.
   */
  compass: { x: 470, y: 96, size: 76 },
} as const;

/**
 * The art slot for the Higgsfield world (PR 3). When `ready` is true, the
 * page draws `src` (a 2048×1536 PNG: the 1024×768 grid at 2×, so ½, 1 and 2
 * stay whole-number scales) as the base layer, pixelated, under the
 * coastlines, trail and pins, and skips the drawn sea, land fill and
 * terrain. Flip `ready` in the same PR that commits the file: a test checks
 * that `ready` and the file agree. A flag, not a runtime file check, because
 * a Vercel function does not see `public/` on disk.
 */
export const WORLD_MAP_ART = {
  src: '/map/world-base.png',
  width: 2048,
  height: 1536,
  ready: false,
} as const;

/**
 * Terrain glyphs: tiny pixel sprites drawn on the lands, one sprite pixel =
 * `WORLD_GLYPH_PX` art px (so 2 screen px at zoom ½, never a half pixel). Rows of the same
 * length; `#` is ink, `+` is shade, `*` is the realm tint, `.` is empty.
 */
export const WORLD_GLYPH_PX = 4;

export const WORLD_GLYPHS = {
  tree: ['..#..', '.#+#.', '#+++#', '.###.', '..#..'],
  pine: ['..#..', '.#+#.', '.#+#.', '#+++#', '#####', '..#..'],
  mountain: ['....#....', '...#+#...', '..#.++#..', '.#..+++#.', '#########'],
  hill: ['..###..', '.#+++#.', '#+++++#'],
  house: ['..#..', '.#*#.', '#***#', '.#+#.', '.###.'],
  tower: ['#.#.#', '#####', '.#*#.', '.#+#.', '.#+#.', '.###.'],
  spire: ['..#..', '..#..', '.#*#.', '.#+#.', '##+##', '#+++#', '#####'],
  forge: ['.+...', '+....', '.##..', '.##..', '#####', '#*+*#', '#####'],
  tent: ['..*..', '..#..', '.#+#.', '#+*+#', '#+#+#'],
  bridge: ['#######', '#+#+#+#', '#.....#'],
  cave: ['.###.', '#+++#', '#+.+#', '#...#'],
} as const;

/**
 * Which glyphs each land shows, by realm id or landmark id: a hint of its
 * theme (Prompt Forest: trees, Production Peaks: mountains). A realm not
 * listed gets hills and trees.
 */
export const WORLD_TERRAIN: Readonly<Record<string, readonly WorldGlyphKind[]>> = {
  0: ['house', 'tree', 'house'],
  1: ['pine', 'tree'],
  2: ['forge', 'hill'],
  3: ['tower', 'hill'],
  4: ['tower', 'mountain'],
  5: ['bridge', 'hill'],
  6: ['tent', 'hill'],
  7: ['spire', 'mountain'],
  8: ['mountain', 'mountain', 'hill'],
  9: ['house', 'tree'],
  10: ['hill', 'tree'],
  11: ['tent', 'house'],
  12: ['cave', 'mountain'],
  13: ['house', 'tower'],
  14: ['forge', 'house'],
  15: ['house', 'tent'],
  math: ['tower'],
  frontier: ['tent', 'pine'],
};

export const WORLD_TERRAIN_DEFAULT: readonly WorldGlyphKind[] = ['hill', 'tree'];

/**
 * The state mark on each world-map pin (world-marker.tsx): a 7×7 ink sprite
 * at 2px a pixel, one shape per state, so the state is never colour only. The words stay in
 * the link's accessible name and in the "Your path" list; the map key
 * explains the shapes. Same letters as WORLD_GLYPHS (`#` ink, `.` empty).
 */
export const WORLD_STATUS_PIPS = {
  /** A tick. */
  cleared: ['.......', '......#', '.....##', '#...##.', '##.##..', '.###...', '..#....'],
  /** A pennant on a pole: you started here. */
  'in-progress': ['#......', '#####..', '######.', '#####..', '#......', '#......', '#......'],
  /** An open ring: not started yet. */
  open: ['..###..', '.#...#.', '#.....#', '#.....#', '#.....#', '.#...#.', '..###..'],
  /** A padlock. */
  'tier-locked': ['..###..', '.#...#.', '.#...#.', '#######', '###.###', '###.###', '#######'],
} as const satisfies Record<RealmStatus, readonly string[]>;

/**
 * The compass rose sprite (same letters as WORLD_GLYPHS, plus `*` = north,
 * `o` = paper), drawn at WORLD_COMPASS_PX art px per pixel and centred in
 * WORLD_MAP.compass. The N sits on top of the north arm.
 */
export const WORLD_COMPASS_PX = 4;

export const WORLD_COMPASS = [
  '....#...#....',
  '....##..#....',
  '....#.#.#....',
  '....#..##....',
  '....#...#....',
  '.............',
  '......#......',
  '.....#*#.....',
  '..#..#*#..#..',
  '.....#*#.....',
  '.....#*#.....',
  '.#####*#####.',
  '#+++++o+++++#',
  '.#####+#####.',
  '.....#+#.....',
  '.....#+#.....',
  '..#..#+#..#..',
  '.....#+#.....',
  '......#......',
] as const;

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

/**
 * Viewport height (px) from which the overview is zoom 1. Mirrors
 * world-map.css (52rem): the box is at most the screen under the 4rem
 * header, so zoom 1 shows the whole 768px stage only from 768 + 64 px.
 * Shorter screens start at ½, so the first view is the whole world.
 */
export const WORLD_OVERVIEW_MIN_HEIGHT = 832;

/** Two markers at zoom ½ are at least this far apart (art px), so 44px targets never overlap. */
export const WORLD_MIN_ANCHOR_GAP = 96;

/** A box in screen px, relative to a point: [left, top, right, bottom]. */
type Box = readonly [number, number, number, number];

/**
 * The hero on the world map (world-map.css → .world-hero), in screen px
 * around the current anchor: it does not scale with the zoom. It is a 48px
 * PixelAvatar (size sm). `sides` is its top-left corner on each side of the
 * 28px pin; world-map.css uses the same numbers (a test checks). Left sits
 * 16px off the anchor, right 24px (past the state pip), at the pin's height. Above and below clear
 * the current marker's own text too: the tag above the pin ("YOU ARE HERE")
 * and, from zoom 1, the name and state below it.
 */
export const WORLD_HERO = {
  size: 48,
  pin: 28,
  /**
   * The pin with its state pip (world-map.css → .world-marker-pip: 16px,
   * 6px past the pin's top-right corner, plus its 2px drop shadow).
   */
  pinBox: [-14, -20, 22, 14] satisfies Box,
  sides: {
    left: [-64, -24],
    right: [24, -24],
    above: [-24, -100],
    below: [-24, 72],
  } satisfies Record<HeroSide, readonly [number, number]>,
  /** The current marker's tag ("YOU ARE HERE", the wider one), measured. */
  tag: [-53, -47, 53, -24] satisfies Box,
  /** Its name plate from zoom 1, measured (one row; the width allows a long name). */
  detail: [-80, 24, 80, 44] satisfies Box,
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

/** A landmark's label link box at zoom `z` (screen px, stage origin): [left, top, right, bottom]. */
export function landmarkLabel(m: WorldLandmark, z: number): Box {
  const w = m.name.length * LANDMARK_LABEL.char + LANDMARK_LABEL.pad;
  const left = m.align === 'end' ? (m.x + m.w / 2) * z - w : m.x * z - w / 2;
  const top = (m.y + m.h / 2) * z + LANDMARK_LABEL.top;
  return [left, top, left + w, top + LANDMARK_LABEL.h];
}

/** Extra screen px kept free around a pin, so drawn terrain never touches it. */
const PIN_GAP = 4;

/**
 * Everything on the stage that says something, as boxes in art px, each
 * tagged with the zoom step it is for (null: the compass, every zoom):
 * every pin (core realms and slots, plus PIN_GAP), every marker's name
 * (shown from zoom 1), landmark labels, the compass, and for the current
 * realm its tag and the hero. Drawn terrain (terrainGlyphs) stays out of
 * every box of each zoom it shows at, so a glyph never hides a pin or a word.
 */
export function worldKeepClear(
  current: { x: number; y: number } | null = null,
  geometry: typeof WORLD_MAP = WORLD_MAP,
): WorldClearBox[] {
  const [pl, pt, pr, pb] = WORLD_HERO.pinBox;
  const pin: Box = [pl - PIN_GAP, pt - PIN_GAP, pr + PIN_GAP, pb + PIN_GAP];
  const anchors = [...Object.values(geometry.realms), ...geometry.slots];
  const boxes: [Box, ZoomStep | null][] = [];
  for (const z of ZOOM_STEPS) {
    const art = ([l, t, r, b]: Box): Box => [l / z, t / z, r / z, b / z];
    for (const p of anchors) {
      boxes.push([at(p.x, p.y, art(pin)), z]);
      if (z >= 1) boxes.push([at(p.x, p.y, art(WORLD_HERO.detail)), z]);
    }
    for (const m of geometry.landmarks) boxes.push([art(landmarkLabel(m, z)), z]);
    if (current) {
      boxes.push([at(current.x, current.y, art(WORLD_HERO.tag)), z]);
      const side = heroSide(current, geometry) ?? 'left';
      boxes.push([at(current.x, current.y, art(heroBox(side))), z]);
    }
  }
  const { x, y, size } = geometry.compass;
  boxes.push([[x - size / 2, y - size / 2, x + size / 2, y + size / 2], null]);
  return boxes.map(([[l, t, r, b], zoom]) => ({ x: l, y: t, w: r - l, h: b - t, zoom }));
}

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

  const pins = [...Object.values(geometry.realms), ...geometry.slots].map((p) =>
    at(p.x * z, p.y * z, WORLD_HERO.pinBox),
  );
  const labels = geometry.landmarks.map((m) => landmarkLabel(m, z));
  const own = [
    at(ax, ay, WORLD_HERO.pinBox),
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
