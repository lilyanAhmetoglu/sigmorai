import { mapHref, WORLD_GLYPH_PX, WORLD_GLYPHS, WORLD_MAP } from '@/lib/constants';
import type {
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
  WorldRect,
  WorldView,
} from '@/lib/types';

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

/** One 16px row of a land: its top and bottom, and where the land starts and ends. */
type Band = { top: number; bottom: number; left: number; right: number };

/**
 * An uneven coastline inside a footprint, on whole tiles: the footprint cut
 * into 16px rows, each row's left and right ends moved in by 0 or 1 tile
 * (seeded), the top and bottom rows by one more tile, so corners round off.
 * Every row keeps at least one tile and shares its middle tiles with its
 * neighbours, so the outline is one simple polygon. It never leaves the
 * footprint (the rectangle-footprint amendment). Returns the rows, top first.
 */
export function coastBands(place: WorldPlace, seed: number, tile: number = WORLD_MAP.tile): Band[] {
  const l = place.x - place.w / 2;
  const r = place.x + place.w / 2;
  const t = place.y - place.h / 2;
  const b = place.y + place.h / 2;
  const rows = Math.max(1, Math.floor(place.h / tile));
  const cols = Math.floor(place.w / tile);
  // Each side moves in at most this many tiles, so a row keeps ≥ 1 tile.
  const maxIn = Math.max(0, Math.floor((cols - 1) / 2));
  const next = seeded(seed);
  const inset = (end: boolean) => Math.min(maxIn, (end ? 1 : 0) + (next() < 0.5 ? 0 : 1)) * tile;
  return Array.from({ length: rows }, (_, i) => {
    const end = rows > 2 && (i === 0 || i === rows - 1);
    const top = t + i * tile;
    return {
      top,
      bottom: i === rows - 1 ? b : top + tile,
      left: l + inset(end),
      right: r - inset(end),
    };
  });
}

/** The coastline of coastBands as polygon points (clockwise on screen). */
export function coastline(place: WorldPlace, seed: number, tile: number = WORLD_MAP.tile) {
  const bands = coastBands(place, seed, tile);
  const points: [number, number][] = [];
  for (const band of bands) points.push([band.right, band.top], [band.right, band.bottom]);
  for (const band of [...bands].reverse())
    points.push([band.left, band.bottom], [band.left, band.top]);
  return points;
}

/**
 * A coastline pushed `d` art px out to sea (the ripple lines around a land).
 * The coast only has straight and right-angle turns, so each corner moves by
 * d along both of its edges' outward normals. Repeated and in-line points
 * are dropped first. Expects the clockwise points of `coastline`.
 */
export function offsetCoast(points: readonly [number, number][], d: number): [number, number][] {
  const n = points.length;
  const unique = points.filter((p, i) => {
    const q = points[(i + n - 1) % n];
    return p[0] !== q[0] || p[1] !== q[1];
  });
  const m = unique.length;
  const corners = unique.filter((p, i) => {
    const a = unique[(i + m - 1) % m];
    const c = unique[(i + 1) % m];
    // In line: a, p and c share x or share y.
    return !((a[0] === p[0] && p[0] === c[0]) || (a[1] === p[1] && p[1] === c[1]));
  });
  const k = corners.length;
  // Outward normal of a clockwise (screen) edge from a to b: (dy, -dx), unit length.
  const normal = (a: [number, number], b: [number, number]): [number, number] => [
    Math.sign(b[1] - a[1]),
    -Math.sign(b[0] - a[0]),
  ];
  return corners.map((p, i) => {
    const before = normal(corners[(i + k - 1) % k], p);
    const after = normal(p, corners[(i + 1) % k]);
    return [p[0] + d * (before[0] + after[0]), p[1] + d * (before[1] + after[1])];
  });
}

/** Free space (art px) between a glyph and the coast, and between two glyphs. */
const GLYPH_MARGIN = 4;

/** At most one glyph per this many square art px of footprint (a core land: 6). */
const GLYPH_AREA = 3200;

/**
 * Terrain on one land: up to one glyph per GLYPH_AREA, cycling through
 * `kinds`, each placed whole inside the coast (with GLYPH_MARGIN) and outside
 * every `clear` box (pins, names, tags, the hero: worldKeepClear). Seeded,
 * so a land shows the same terrain on every request and device. A land with
 * no free spot simply gets fewer glyphs.
 */
export function terrainGlyphs(
  place: WorldPlace,
  seed: number,
  kinds: readonly WorldGlyphKind[],
  clear: readonly WorldRect[],
  tile: number = WORLD_MAP.tile,
): WorldGlyph[] {
  if (kinds.length === 0) return [];
  const bands = coastBands(place, seed, tile);
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

  // Candidate corners on a 4 art px grid, in a seeded order.
  const step = 2 * WORLD_GLYPH_PX;
  const spots: [number, number][] = [];
  for (let y = top; y < bottom; y += step)
    for (let x = place.x - place.w / 2; x < place.x + place.w / 2; x += step) spots.push([x, y]);
  const next = seeded(seed * 31 + 7);
  for (let i = spots.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [spots[i], spots[j]] = [spots[j], spots[i]];
  }

  const placed: WorldGlyph[] = [];
  for (const [x, y] of spots) {
    if (placed.length >= max) break;
    const kind = kinds[placed.length % kinds.length];
    const g = { kind, x, y, ...size(kind) };
    if (!onLand(g)) continue;
    if (clear.some((c) => touches(g, c, 0))) continue;
    if (placed.some((p) => touches(g, p, GLYPH_MARGIN))) continue;
    placed.push(g);
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
