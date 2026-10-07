import { mapHref, WORLD_MAP } from '@/lib/constants';
import type {
  RealmView,
  TrackMap,
  TrailSegment,
  Track,
  WorldGeometry,
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
 * `linkTrack` keeps `?track=` on the marker links only when the page got one
 * (like the realm pages), so a player's own map has clean URLs.
 */
export function worldView(
  map: TrackMap,
  geometry: WorldGeometry = WORLD_MAP,
  linkTrack?: Track,
): WorldView {
  const current = map.next?.realm ?? null;
  const realms = map.realms.map((realm: RealmView): WorldRealm => ({
    id: realm.id,
    name: realm.name,
    status: realm.status,
    cleared: realm.cleared,
    total: realm.chapters.length,
    href: mapHref(realm.slug, linkTrack),
    current: realm.id === current,
    place: realmPlace(realm.id, geometry),
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
 * Placeholder art shapes (until the Higgsfield art, PR 3). Pure and seeded,
 * so a land has the same shape on every request and every device.
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
 * An uneven coastline inside a footprint, on whole tiles: the footprint cut
 * into 16px rows, each row's left and right ends moved in by 0 or 1 tile
 * (seeded), the top and bottom rows by one more tile, so corners round off.
 * Every row keeps at least one tile and shares its middle tiles with its
 * neighbours, so the outline is one simple polygon. It never leaves the
 * footprint (the rectangle-footprint amendment). Returns polygon points.
 */
export function coastline(place: WorldPlace, seed: number, tile: number = WORLD_MAP.tile) {
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
  const bands = Array.from({ length: rows }, (_, i) => {
    const end = rows > 2 && (i === 0 || i === rows - 1);
    const top = t + i * tile;
    return {
      top,
      bottom: i === rows - 1 ? b : top + tile,
      left: l + inset(end),
      right: r - inset(end),
    };
  });
  const points: [number, number][] = [];
  for (const band of bands) points.push([band.right, band.top], [band.right, band.bottom]);
  for (const band of [...bands].reverse())
    points.push([band.left, band.bottom], [band.left, band.top]);
  return points;
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
