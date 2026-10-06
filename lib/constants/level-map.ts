/**
 * Level map geometry, from design/assets/levels/layout.json. The art is a
 * 1024×240 grid of 16px tiles, shown at `scale` (2×, nearest-neighbour), so
 * the map is 2048×480 screen px. `nodes` are tile columns: six chapters, then
 * the boss. `groundY` is the art row the path runs on.
 */
export const LEVEL_MAP = {
  width: 1024,
  height: 240,
  groundY: 192,
  nodes: [4, 11, 19, 27, 35, 44, 58],
  tile: 16,
  scale: 2,
} as const;

/** Screen x (px) of node `i`: the centre of its tile column, scaled. */
export const levelNodeX = (i: number): number =>
  (LEVEL_MAP.nodes[i] * LEVEL_MAP.tile + LEVEL_MAP.tile / 2) * LEVEL_MAP.scale;
