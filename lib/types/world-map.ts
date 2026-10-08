import type { WORLD_GLYPHS, WORLD_MAP, ZOOM_STEPS } from '@/lib/constants';
import type { Track } from './exercise';
import type { RealmStatus } from './realms';
import type { Accent } from './ui';

/** A rectangle in world art px, centred on its anchor (x, y). */
export type WorldPlace = { x: number; y: number; w: number; h: number };

/** A box terrain keeps out of (worldKeepClear), for one zoom step or (null) every zoom. */
export type WorldClearBox = WorldRect & { zoom: ZoomStep | null };

/** A sea slot kept for a specialist realm (r9+). Fogged until a realm on the shown path uses it. */
export type WorldSlot = WorldPlace & { id: string };

/** One specialist realm standing on one slot. */
export type WorldSlotRealm = { slot: string; realm: number };

/** A shared side realm on every path (Math Tower, the Frontier): a plain link, no state. */
export type WorldLandmark = WorldPlace & {
  id: string;
  name: string;
  href: string;
  accent: Accent;
  /** `end`: the label ends at the land's right edge (a landmark near the east edge). */
  align?: 'end';
};

/** A rectangle by its top-left corner (art px), e.g. one tile of edge fog. */
export type WorldRect = { x: number; y: number; w: number; h: number };

export type WorldGeometry = typeof WORLD_MAP;

/** How a drawn coast is shaped (WORLD_MAP.coast; coastBands reads it). */
export type CoastShape = (typeof WORLD_MAP)['coast'];

/** One row of a drawn land (art px): its top and bottom, and where the land starts and ends. */
export type CoastBand = { top: number; bottom: number; left: number; right: number };

/** A terrain sprite name (WORLD_GLYPHS). */
export type WorldGlyphKind = keyof typeof WORLD_GLYPHS;

/**
 * One terrain sprite placed on a land: its top-left corner and size in art
 * px. `fromZoom: 1` when it only keeps clear of pins and words from zoom 1
 * (at ½ the pin covers most of a small island); world-map.css hides it at ½.
 */
export type WorldGlyph = WorldRect & { kind: WorldGlyphKind; fromZoom?: 1 };

export type ZoomStep = (typeof ZOOM_STEPS)[number];

/** Which side of the current pin the hero stands on (heroSide picks it per place). */
export type HeroSide = 'left' | 'right' | 'above' | 'below';

/**
 * One realm of a path, as a row of the "Your path" list. The world map and
 * the dashboard (per-path PR 2) both draw this list.
 */
export type PathRealm = {
  /** The realm number (global across paths). */
  id: number;
  name: string;
  status: RealmStatus;
  /** Chapters and boss cleared, out of `total`. */
  cleared: number;
  total: number;
  href: string;
  /** The realm holding the player's next step. */
  current: boolean;
  /** The owner: null = a core realm; a track = a specialist realm (r9+), badged "<PATH> ONLY". */
  track: Track | null;
  /** No chapter or boss has a content file yet: the marker says SOON (clear-maps amendment). */
  soon: boolean;
};

/** A realm on the world map: its list row plus where it stands. */
export type WorldRealm = PathRealm & {
  /** Null when the geometry has no place for it (it stays in the list). */
  place: WorldPlace | null;
};

/** The trail between two neighbours in path order. Solid once `from` is cleared. */
export type TrailSegment = {
  from: number;
  to: number;
  cleared: boolean;
  a: WorldPlace;
  b: WorldPlace;
};

export type WorldView = {
  realms: WorldRealm[];
  trail: TrailSegment[];
  /** Slots with no realm on this path: drawn as fog, no label, no link. */
  fog: WorldSlot[];
  /** The realm holding the next step, or null (nothing open: no hero, no tag). */
  current: number | null;
};
