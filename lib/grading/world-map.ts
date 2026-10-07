import { mapHref, WORLD_MAP } from '@/lib/constants';
import type {
  RealmView,
  TrackMap,
  TrailSegment,
  Track,
  WorldGeometry,
  WorldPlace,
  WorldRealm,
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
