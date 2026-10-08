import {
  WORLD_COMPASS,
  WORLD_COMPASS_PX,
  WORLD_GLYPH_PX,
  WORLD_GLYPHS,
  WORLD_MAP,
  WORLD_STATUS_PIPS,
} from '@/lib/constants';
import type { RealmStatus, TrailSegment, WorldGlyph } from '@/lib/types';

/**
 * The drawn parts of the world map that are not lands (world-map.tsx draws
 * those): sprites, the trail, the compass and the frame, SVG only, inside
 * the map's aria-hidden <svg>; and the status pip, its own small svg. Colours come from world-map.css classes,
 * never from here.
 */

/** Sprite letter → data-px (world-map.css colours it): ink, shade, tint, paper. */
const PIXEL: Record<string, string> = {
  '#': 'ink',
  '+': 'shade',
  '*': 'tint',
  o: 'paper',
};

type Run = { x: number; y: number; w: number; px: string };

/** A sprite as horizontal runs of one letter, so a row is a few rects, not one per pixel. */
function spriteRuns(rows: readonly string[]): Run[] {
  const runs: Run[] = [];
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const c = row[x];
      let end = x + 1;
      while (end < row.length && row[end] === c) end++;
      if (PIXEL[c]) runs.push({ x, y, w: end - x, px: PIXEL[c] });
      x = end;
    }
  });
  return runs;
}

/** Runs of each glyph kind, built once. */
const GLYPH_RUNS = Object.fromEntries(
  Object.entries(WORLD_GLYPHS).map(([kind, rows]) => [kind, spriteRuns(rows)]),
) as Record<keyof typeof WORLD_GLYPHS, Run[]>;

const COMPASS_RUNS = spriteRuns(WORLD_COMPASS);

const PIP_RUNS = Object.fromEntries(
  Object.entries(WORLD_STATUS_PIPS).map(([status, rows]) => [status, spriteRuns(rows)]),
) as Record<RealmStatus, Run[]>;

type SpriteProps = { runs: Run[]; x: number; y: number; px: number; fromZoom?: 1 };

function Sprite({ runs, x, y, px, fromZoom }: SpriteProps) {
  return (
    <g transform={`translate(${x} ${y})`} data-from-zoom={fromZoom}>
      {runs.map((r, i) => (
        <rect key={i} data-px={r.px} x={r.x * px} y={r.y * px} width={r.w * px} height={px} />
      ))}
    </g>
  );
}

/**
 * A realm's state as a small ink shape (WORLD_STATUS_PIPS), for a pin and
 * the map key. Its own <svg>, decoration only: the words are in the link's
 * accessible name and in the key.
 */
export function StatusPip({ status, className }: { status: RealmStatus; className?: string }) {
  const rows = WORLD_STATUS_PIPS[status];
  return (
    <svg
      className={className}
      viewBox={`0 0 ${rows[0].length} ${rows.length}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      <Sprite runs={PIP_RUNS[status]} x={0} y={0} px={1} />
    </svg>
  );
}

/** Terrain on one land (placed by terrainGlyphs). */
export function Glyphs({ glyphs }: { glyphs: readonly WorldGlyph[] }) {
  return (
    <>
      {glyphs.map((g) => (
        <Sprite
          key={`${g.x},${g.y}`}
          runs={GLYPH_RUNS[g.kind]}
          x={g.x}
          y={g.y}
          px={WORLD_GLYPH_PX}
          fromZoom={g.fromZoom}
        />
      ))}
    </>
  );
}

/** Snap to the 4 art px grid, so the arrow stays on whole screen px at ½. */
const snap = (v: number) => Math.round(v / 4) * 4;

/** A chevron at a segment's middle, pointing from `a` to `b` (the walking way). */
function arrowPoints(s: TrailSegment) {
  const angle = Math.atan2(s.b.y - s.a.y, s.b.x - s.a.x);
  const cx = snap((s.a.x + s.b.x) / 2);
  const cy = snap((s.a.y + s.b.y) / 2);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return (
    [
      [-8, -8],
      [8, 0],
      [-8, 8],
      [-4, 0],
    ] as const
  )
    .map(([x, y]) => `${snap(cx + x * cos - y * sin)},${snap(cy + x * sin + y * cos)}`)
    .join(' ');
}

/**
 * The path's route between neighbours: a solid ember line once its first
 * realm is cleared, square "footsteps" ahead, and an arrow at each middle
 * pointing the way. Solid vs dashed carries the state, not the colour.
 */
export function Trail({ trail }: { trail: readonly TrailSegment[] }) {
  return (
    <>
      {trail.map((s) => (
        <g key={`${s.from}-${s.to}`} className="world-trail" data-cleared={s.cleared || undefined}>
          <line className="world-trail-under" x1={s.a.x} y1={s.a.y} x2={s.b.x} y2={s.b.y} />
          <line className="world-trail-line" x1={s.a.x} y1={s.a.y} x2={s.b.x} y2={s.b.y} />
          <polygon className="world-trail-arrow" points={arrowPoints(s)} />
        </g>
      ))}
    </>
  );
}

/** The compass rose, centred in WORLD_MAP.compass. */
export function Compass() {
  const { x, y } = WORLD_MAP.compass;
  const w = WORLD_COMPASS[0].length * WORLD_COMPASS_PX;
  const h = WORLD_COMPASS.length * WORLD_COMPASS_PX;
  return (
    <g className="world-compass">
      <Sprite runs={COMPASS_RUNS} x={x - w / 2} y={y - h / 2} px={WORLD_COMPASS_PX} />
    </g>
  );
}

/** Corner block of the frame (art px). */
const CORNER = 16;

/**
 * The map's border: a thick outer rule, a thin inner rule, and a block with
 * a paper rivet on each corner, like the frame of an old printed map.
 */
export function Frame() {
  const { width: w, height: h } = WORLD_MAP;
  const corners = [
    [0, 0],
    [w - CORNER, 0],
    [0, h - CORNER],
    [w - CORNER, h - CORNER],
  ];
  return (
    <g className="world-frame">
      <rect className="world-frame-outer" x={2} y={2} width={w - 4} height={h - 4} />
      <rect className="world-frame-inner" x={12} y={12} width={w - 24} height={h - 24} />
      {corners.map(([x, y]) => (
        <g key={`${x},${y}`}>
          <rect data-px="ink" x={x} y={y} width={CORNER} height={CORNER} />
          <rect data-px="paper" x={x + 6} y={y + 6} width={4} height={4} />
        </g>
      ))}
    </g>
  );
}
