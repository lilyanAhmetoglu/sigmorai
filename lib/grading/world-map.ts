import { mapHref, WORLD_GLYPH_PX, WORLD_GLYPHS, WORLD_MAP } from '@/lib/constants';
import type {
  CoastBand,
  CoastShape,
  PathRealm,
  RealmView,
  TrackMap,
  TrailSegment,
  Track,
  WorldGeometry,
  WorldGlyph,
  WorldGlyphKind,
  WorldPlace,
  WorldRealm,
  WorldClearBox,
  WorldRect,
  WorldView,
} from '@/lib/types';
import { realmIsSoon } from './track-map';

/**
 * The world map's view of one path (world-map spec → API contract). Pure:
 * the states come from buildTrackMap (the same lock rule the Server Actions
 * run), the positions from the geometry constant.
 */

/** Where a realm stands: its core place, else the slot a specialist realm was given. */
export function realmPlace(id: number, geometry: WorldGeometry = WORLD_MAP): WorldPlace | null {
  const core = geometry.realms[id];
  if (core) return core;
  const slotId = geometry.slotRealms.find((s) => s.realm === id)?.slot;
  return geometry.slots.find((s) => s.id === slotId) ?? null;
}

/**
 * The "Your path" rows of one path, in path order. `hrefFor` picks where a
 * row links: the world map sends it to the level map, the dashboard to the
 * realm page (per-path PR 2). `current` marks the realm holding `map.next`.
 */
export function pathRealms(map: TrackMap, hrefFor: (slug: string) => string): PathRealm[] {
  const current = map.next?.realm ?? null;
  return map.realms.map((realm: RealmView): PathRealm => ({
    id: realm.id,
    name: realm.name,
    status: realm.status,
    cleared: realm.cleared,
    total: realm.chapters.length,
    href: hrefFor(realm.slug),
    current: realm.id === current,
    track: realm.track,
    soon: realmIsSoon(realm.chapters),
  }));
}

/**
 * `linkTrack` keeps `?track=` on the marker links only when the page got one
 * (like the realm pages), so a player's own map has clean URLs.
 */
export function worldView(
  map: TrackMap,
  geometry: WorldGeometry = WORLD_MAP,
  linkTrack?: Track,
): WorldView {
  const current = map.next?.realm ?? null;
  const realms = pathRealms(map, (slug) => mapHref(slug, linkTrack)).map((row): WorldRealm => ({
    ...row,
    place: realmPlace(row.id, geometry),
  }));

  // Neighbours in path order; a realm with no place is skipped, not a gap.
  const placed = realms.filter((r) => r.place);
  const trail = placed.slice(1).map((to, i): TrailSegment => ({
    from: placed[i].id,
    to: to.id,
    cleared: placed[i].status === 'cleared',
    a: placed[i].place!,
    b: to.place!,
  }));

  const onPath = new Set(map.realms.map((r) => r.id as number));
  const used = new Set(geometry.slotRealms.filter((s) => onPath.has(s.realm)).map((s) => s.slot));
  const fog = geometry.slots.filter((s) => !used.has(s.id));

  return { realms, trail, fog, current };
}

/**
 * Drawn map shapes (the cartography placeholder until the Higgsfield art,
 * PR 3): coasts, ripples and terrain. Pure and seeded, so a land has the
 * same shape on every request and every device.
 */

/** A small seeded random source (mulberry32): the same seed gives the same numbers. */
function seeded(seed: number): () => number {
  let a = seed >>> 0 || 1;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A seed for a shape: a realm id, or a landmark id (FNV-1a hash). */
export function shapeSeed(key: number | string): number {
  if (typeof key === 'number') return key + 1;
  let h = 2166136261;
  for (const c of key) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}

/**
 * An organic, pixel-stepped coastline inside a footprint. The footprint is
 * cut into rows of `coast.step` art px. Each row's ends follow a rounded
 * box (a superellipse, so the land is not a rectangle), plus a seeded random
 * walk per side (small wobbles), a bay on one side (rows cut deeper) and a
 * cape on the other (rows reaching the footprint edge). Every row
 * keeps the middle column, so neighbours always touch and the outline is
 * one simple polygon. It never leaves the footprint (the rectangle-footprint
 * amendment) and it is the same for the same seed. Returns the rows, top first.
 */
export function coastBands(
  place: WorldPlace,
  seed: number,
  coast: CoastShape = WORLD_MAP.coast,
): CoastBand[] {
  const { step, round, fill, wobble, bay, cape } = coast;
  const l = place.x - place.w / 2;
  const t = place.y - place.h / 2;
  const rows = Math.max(1, Math.floor(place.h / step));
  // Steps from the middle to the footprint's side; a row keeps ≥ 1 step each way.
  const half = Math.max(1, Math.floor(place.w / 2 / step));
  const next = seeded(seed);
  const pick = (n: number) => Math.floor(next() * n);

  // Wobble: a random walk of 0..wobble steps, one value per row.
  const walk = () => {
    let v = pick(2);
    return Array.from({ length: rows }, () => {
      const roll = next();
      v = Math.max(0, Math.min(wobble, v + (roll < 0.2 ? -1 : roll > 0.8 ? 1 : 0)));
      return v;
    });
  };
  // Bays and capes only in the middle rows, where the land is wide.
  const middle = Array.from({ length: rows }, (_, i) => i).filter(
    (i) => Math.abs(((i + 0.5) * step) / (place.h / 2) - 1) < 0.6,
  );
  // One bay on one side, one cape on the other (seeded), so the land keeps
  // its body: a bay and a cape on the same side read as noise.
  const sides = [walk(), walk()];
  if (middle.length >= 4) {
    const [bayside, capeside] = next() < 0.5 ? sides : [sides[1], sides[0]];
    const b = middle[pick(middle.length - 1)];
    for (const i of [b, b + 1]) if (middle.includes(i)) bayside[i] += bay.depth;
    const c = middle[pick(middle.length - cape.rows + 1)];
    for (let i = c; i < c + cape.rows; i++) capeside[i] = -Infinity;
  }

  return Array.from({ length: rows }, (_, i): CoastBand => {
    const top = t + i * step;
    // -1 at the top edge, 1 at the bottom edge (row middles).
    const v = Math.min(1, Math.abs(((i + 0.5) * step) / (place.h / 2) - 1));
    const width = Math.pow(1 - Math.pow(v, round), 1 / round);
    const base = half - Math.round(half * width * fill);
    const inset = (n: number) => Math.max(0, Math.min(half - 1, base + n)) * step;
    return {
      top,
      bottom: i === rows - 1 ? place.y + place.h / 2 : top + step,
      left: l + inset(sides[0][i]),
      right: place.x + place.w / 2 - inset(sides[1][i]),
    };
  });
}

/**
 * The outline of a stack of rows as polygon points, clockwise on screen:
 * down the right ends, back up the left ends. Repeated points and points in
 * the middle of a straight edge are dropped, so every corner is a real turn.
 */
export function bandOutline(bands: readonly CoastBand[]): [number, number][] {
  const raw: [number, number][] = [];
  for (const b of bands) raw.push([b.right, b.top], [b.right, b.bottom]);
  for (const b of [...bands].reverse()) raw.push([b.left, b.bottom], [b.left, b.top]);
  const unique = raw.filter((p, i) => {
    const q = raw[(i + raw.length - 1) % raw.length];
    return p[0] !== q[0] || p[1] !== q[1];
  });
  const m = unique.length;
  return unique.filter((p, i) => {
    const a = unique[(i + m - 1) % m];
    const c = unique[(i + 1) % m];
    return !((a[0] === p[0] && p[0] === c[0]) || (a[1] === p[1] && p[1] === c[1]));
  });
}

/** The coastline of coastBands as polygon points (clockwise on screen). */
export function coastline(place: WorldPlace, seed: number, coast: CoastShape = WORLD_MAP.coast) {
  return bandOutline(coastBands(place, seed, coast));
}

/**
 * Rows grown `d` art px in every direction (a square brush): the land plus
 * a d px ring of water. Every input row keeps the middle column, so each
 * grown row is still one stretch of land.
 */
export function growBands(bands: readonly CoastBand[], d: number): CoastBand[] {
  const cuts = [...new Set(bands.flatMap((b) => [b.top - d, b.bottom + d]))].sort((a, b) => a - b);
  const out: CoastBand[] = [];
  for (let i = 0; i < cuts.length - 1; i++) {
    const [top, bottom] = [cuts[i], cuts[i + 1]];
    const live = bands.filter((b) => b.top - d <= top && b.bottom + d >= bottom);
    if (live.length === 0) continue;
    const left = Math.min(...live.map((b) => b.left)) - d;
    const right = Math.max(...live.map((b) => b.right)) + d;
    const prev = out[out.length - 1];
    if (prev && prev.bottom === top && prev.left === left && prev.right === right)
      prev.bottom = bottom;
    else out.push({ top, bottom, left, right });
  }
  return out;
}

/**
 * A ripple line `d` art px out to sea around a land: the outline of its
 * coast rows grown by d. Follows every bay and cape, never crosses itself.
 */
export function rippleLine(
  place: WorldPlace,
  seed: number,
  d: number,
  coast: CoastShape = WORLD_MAP.coast,
): [number, number][] {
  return bandOutline(growBands(coastBands(place, seed, coast), d));
}

/** Free space (art px) between a glyph and the coast, and between two glyphs. */
const GLYPH_MARGIN = 4;

/** At most one glyph per this many square art px of footprint (a core land: 6 or more). */
const GLYPH_AREA = 3200;

/**
 * Terrain on one land: up to one glyph per GLYPH_AREA, cycling through
 * `kinds`, each placed whole inside the coast (with GLYPH_MARGIN) and outside
 * every `clear` box (pins, names, tags, the hero: worldKeepClear) of each
 * zoom it shows at. First pass: glyphs clear at every zoom. Second pass,
 * if the land has room for more: glyphs clear from zoom 1 only, marked
 * `fromZoom: 1` (hidden at ½, where a pin covers most of a small island).
 * Seeded, so a land shows the same terrain on every request and device. A
 * land with no free spot simply gets fewer glyphs.
 */
export function terrainGlyphs(
  place: WorldPlace,
  seed: number,
  kinds: readonly WorldGlyphKind[],
  clear: readonly WorldClearBox[],
  coast: CoastShape = WORLD_MAP.coast,
): WorldGlyph[] {
  if (kinds.length === 0) return [];
  const bands = coastBands(place, seed, coast);
  const top = bands[0].top;
  const bottom = bands[bands.length - 1].bottom;
  const max = Math.max(1, Math.floor((place.w * place.h) / GLYPH_AREA));
  const size = (kind: WorldGlyphKind) => {
    const rows = WORLD_GLYPHS[kind];
    return { w: rows[0].length * WORLD_GLYPH_PX, h: rows.length * WORLD_GLYPH_PX };
  };
  const onLand = (g: WorldRect) =>
    g.y >= top + GLYPH_MARGIN &&
    g.y + g.h <= bottom - GLYPH_MARGIN &&
    bands
      .filter((b) => b.bottom > g.y && b.top < g.y + g.h)
      .every((b) => g.x >= b.left + GLYPH_MARGIN && g.x + g.w <= b.right - GLYPH_MARGIN);
  const touches = (a: WorldRect, b: WorldRect, gap: number) =>
    a.x < b.x + b.w + gap &&
    b.x < a.x + a.w + gap &&
    a.y < b.y + b.h + gap &&
    b.y < a.y + a.h + gap;
  const fromOne = clear.filter((c) => c.zoom === null || c.zoom >= 1);

  // Candidate corners on the sprite-pixel grid, in a seeded order.
  const step = WORLD_GLYPH_PX;
  const spots: [number, number][] = [];
  for (let y = top; y < bottom; y += step)
    for (let x = place.x - place.w / 2; x < place.x + place.w / 2; x += step) spots.push([x, y]);
  const next = seeded(seed * 31 + 7);
  for (let i = spots.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [spots[i], spots[j]] = [spots[j], spots[i]];
  }

  const placed: WorldGlyph[] = [];
  for (const boxes of [clear, fromOne]) {
    for (const [x, y] of spots) {
      if (placed.length >= max) break;
      const kind = kinds[placed.length % kinds.length];
      const g: WorldGlyph = { kind, x, y, ...size(kind) };
      if (!onLand(g)) continue;
      if (boxes.some((c) => touches(g, c, 0))) continue;
      if (placed.some((p) => touches(g, p, GLYPH_MARGIN))) continue;
      if (clear.some((c) => touches(g, c, 0))) g.fromZoom = 1;
      placed.push(g);
    }
  }
  return placed;
}

/**
 * The fog around the edge of the world, as one rectangle per edge tile
 * (top-left corner, art px). Each tile is `min`–`max` deep in whole tiles,
 * seeded, so the inner edge is ragged. Corners overlap; the fog pattern is
 * in user space, so overlaps look the same.
 */
export function edgeFog(geometry: WorldGeometry = WORLD_MAP): WorldRect[] {
  const { width, height, tile } = geometry;
  const { min, max, seed } = geometry.edgeFog;
  const next = seeded(seed);
  const steps = Math.floor((max - min) / tile) + 1;
  const depth = () => min + Math.floor(next() * steps) * tile;
  const rects: WorldRect[] = [];
  for (let x = 0; x < width; x += tile) {
    const top = depth();
    const bottom = depth();
    rects.push({ x, y: 0, w: tile, h: top }, { x, y: height - bottom, w: tile, h: bottom });
  }
  for (let y = 0; y < height; y += tile) {
    const left = depth();
    const right = depth();
    rects.push({ x: 0, y, w: left, h: tile }, { x: width - right, y, w: right, h: tile });
  }
  return rects;
}
