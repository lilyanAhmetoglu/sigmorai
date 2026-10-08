/**
 * Level map geometry, from design/assets/levels/layout.json. The art is a
 * 1024×240 grid of 16px tiles, shown at `scale` (2×, nearest-neighbour), so
 * the map is 2048×480 screen px. `nodes` are tile columns: the design's six
 * chapters, then the boss. `groundY` is the art row the path runs on.
 */
export const LEVEL_MAP = {
  width: 1024,
  height: 240,
  groundY: 192,
  nodes: [4, 11, 19, 27, 35, 44, 58],
  tile: 16,
  scale: 2,
} as const;

/** The chapter count the design's node columns were drawn for (6; the last node is the boss). */
const DESIGN_CHAPTERS = LEVEL_MAP.nodes.length - 1;

/**
 * Tile columns of a realm's nodes: one per chapter, then the boss. A realm
 * with the design's chapter count keeps the design's exact columns, so the
 * art still lines up. Any other count spreads its nodes evenly between the
 * first column and the boss column (path-curriculum spec: 12 chapters + boss
 * ≈ every 4.5 columns). Columns may be fractional.
 */
export function levelNodeColumns(chapters: number): number[] {
  if (chapters === DESIGN_CHAPTERS) return [...LEVEL_MAP.nodes];
  const first = LEVEL_MAP.nodes[0];
  const step = (LEVEL_MAP.nodes[DESIGN_CHAPTERS] - first) / chapters;
  return Array.from({ length: chapters + 1 }, (_, i) => first + i * step);
}

/**
 * Screen x (px) of node `i` in a realm of `chapters` chapters: the centre of
 * its tile column, rounded to a whole art pixel, scaled.
 */
export const levelNodeX = (i: number, chapters: number): number =>
  Math.round(levelNodeColumns(chapters)[i] * LEVEL_MAP.tile + LEVEL_MAP.tile / 2) * LEVEL_MAP.scale;

/**
 * The smallest distance (screen px) between two neighbouring nodes. The level
 * map sets it as `--node-gap`, which also caps a node label's width, so
 * labels never overlap (224px for 6 chapters, 144px for 12).
 */
export function levelNodeGap(chapters: number): number {
  const xs = Array.from({ length: chapters + 1 }, (_, i) => levelNodeX(i, chapters));
  return Math.min(...xs.slice(1).map((x, i) => x - xs[i]));
}
