/**
 * The curriculum map (docs/plans/curriculum-design-plan.md). Names, NPCs and
 * tiers come from design/ui_kits/webapp/Sigmorai App.dc.html (REALMS, LV);
 * Math floors use the spec's reordered list (Statistics added, cosine in floor 1).
 * Per-track text (topic, lore, chapter titles) lives in content/<track>/outline.json.
 * Counts and track names are in ./exercises.ts.
 */
import type { Accent, RealmRow, RealmTable, Track } from '@/lib/types';
import { FRONTIER_AREA, MATH_AREA, TRACKS } from './exercises';

/** Track chip colour, from the design's TR table (builder = ember, strategist = spark;
 * creator = info until the design pass adds its own token). */
export const TRACK_ACCENTS: Record<Track, Accent> = {
  builder: 'accent',
  strategist: 'xp',
  creator: 'info',
};

/** UI labels are the upper-case form (BEGINNER / INTERMEDIATE / ADVANCED). */
export const TIERS = ['beginner', 'intermediate', 'advanced'] as const;
/** Tiers a learner can enter today. Advanced is visible but locked. */
export const OPEN_TIERS = [
  'beginner',
  'intermediate',
] as const satisfies readonly (typeof TIERS)[number][];

/** The track a visitor with no hero sees: the beginner path starts on strategist (spec → Beginner path). */
export const DEFAULT_TRACK = 'strategist' as const satisfies Track;

/**
 * State of one step (lesson, case, quick check) or chapter, computed on the
 * server (lib/grading/track-map.ts). `locked` = clear the chapter before it;
 * `tier-locked` = advanced realm, comes later; `soon` = no content file yet.
 */
export const STEP_STATUSES = ['done', 'open', 'locked', 'tier-locked', 'soon'] as const;
/** State of a whole realm. Open-tier realms are open from day one (spec → devil pass). */
export const REALM_STATUSES = ['cleared', 'in-progress', 'open', 'tier-locked'] as const;

/**
 * Every realm, sorted by id with no gap (so `REALMS[id]` is realm `id`).
 * `id` is the realm number, global across paths; helpers derive folder, art
 * and accent from it. `track` is the owner: `null` = a core realm, on every
 * path; a track = a specialist realm, on that path only. `scene` = the realm
 * has level art (false → flat `neutral` scene, site-default share image).
 * A new realm is a new row, never an edit (path-curriculum spec, 2026-10-07).
 */
export const REALMS = [
  {
    id: 0,
    slug: 'bootstrap-village',
    name: 'Bootstrap Village',
    npc: 'Elder Maren',
    tier: 'beginner',
    track: null,
    scene: true,
  },
  {
    id: 1,
    slug: 'prompt-forest',
    name: 'Prompt Forest',
    npc: 'Ranger Iso',
    tier: 'beginner',
    track: null,
    scene: true,
  },
  {
    id: 2,
    slug: 'tool-forge',
    name: 'Tool Forge',
    npc: 'Smith Korren',
    tier: 'beginner',
    track: null,
    scene: true,
  },
  {
    id: 3,
    slug: 'context-library',
    name: 'Context Library',
    npc: 'Archivist Vela',
    tier: 'intermediate',
    track: null,
    scene: true,
  },
  {
    id: 4,
    slug: 'agent-citadel',
    name: 'Agent Citadel',
    npc: 'Warden Tess',
    tier: 'intermediate',
    track: null,
    scene: true,
  },
  {
    id: 5,
    slug: 'mcp-bridgelands',
    name: 'MCP Bridgelands',
    npc: 'Bridgekeeper Nal',
    tier: 'intermediate',
    track: null,
    scene: true,
  },
  {
    id: 6,
    slug: 'eval-arena',
    name: 'Eval Arena',
    npc: 'Judge Arra',
    tier: 'advanced',
    track: null,
    scene: true,
  },
  {
    id: 7,
    slug: 'swarm-spire',
    name: 'Swarm Spire',
    npc: 'The Conductor',
    tier: 'advanced',
    track: null,
    scene: true,
  },
  {
    id: 8,
    slug: 'production-peaks',
    name: 'Production Peaks',
    npc: 'Summit Guide Pell',
    tier: 'advanced',
    track: null,
    scene: true,
  },
  {
    id: 9,
    slug: 'canvas-workshop',
    name: 'Canvas Workshop',
    npc: 'Guildmaster Ines',
    tier: 'intermediate',
    track: 'creator',
    scene: false,
  },
  {
    id: 10,
    slug: 'reel-hollow',
    name: 'Reel Hollow',
    npc: 'Lanternist Oto',
    tier: 'intermediate',
    track: 'creator',
    scene: false,
  },
  {
    id: 11,
    slug: 'pigment-bazaar',
    name: 'Pigment Bazaar',
    npc: 'Dyer Sabe',
    tier: 'beginner',
    track: 'creator',
    scene: false,
  },
  {
    id: 12,
    slug: 'echo-caverns',
    name: 'Echo Caverns',
    npc: 'Bard Lio',
    tier: 'beginner',
    track: 'creator',
    scene: false,
  },
  {
    id: 13,
    slug: 'pattern-atelier',
    name: 'Pattern Atelier',
    npc: 'Weaver Hale',
    tier: 'intermediate',
    track: 'creator',
    scene: false,
  },
] as const satisfies readonly RealmRow[];

/** Whether a realm is on this track: a core realm, or a specialist realm the track owns. */
export const isRealmOnTrack = (realm: Pick<RealmRow, 'track'>, track: Track): boolean =>
  realm.track === null || realm.track === track;

/** The core realms (`track: null`): on every path, in id order. */
export function coreRealms(): (typeof REALMS)[number][];
export function coreRealms<R extends RealmRow>(realms: readonly R[]): R[];
export function coreRealms(realms: RealmTable = REALMS): RealmRow[] {
  return realms.filter((realm) => realm.track === null);
}

/**
 * A track's realms: the core realms plus the specialist realms it owns, in
 * id order. The map order is the track's outline, not this.
 */
export function trackRealms(track: Track): (typeof REALMS)[number][];
export function trackRealms<R extends RealmRow>(track: Track, realms: readonly R[]): R[];
export function trackRealms(track: Track, realms: RealmTable = REALMS): RealmRow[] {
  return realms.filter((realm) => isRealmOnTrack(realm, track));
}

/** The tracks a realm is on: every track for a core realm, its owner for a specialist realm. */
export const realmTracks = (realm: Pick<RealmRow, 'track'>): Track[] =>
  TRACKS.filter((track) => isRealmOnTrack(realm, track));

/**
 * The track a realm page shows: a specialist realm always shows its owner's
 * path (`?track=` is ignored, no 404); a core realm shows `wanted` (the
 * `?track=` param, else the player's own track, else the beginner path).
 */
export const realmPageTrack = (realm: Pick<RealmRow, 'track'>, wanted: Track): Track =>
  realm.track ?? wanted;

/** The REALMS row with this id, or undefined. */
export function realmRow(id: number): (typeof REALMS)[number] | undefined;
export function realmRow<R extends RealmRow>(id: number, realms: readonly R[]): R | undefined;
export function realmRow(id: number, realms: RealmTable = REALMS): RealmRow | undefined {
  return realms.find((realm) => realm.id === id);
}

/** Math Tower floors, opened in order. No tier: all free. */
export const MATH_FLOORS = [
  { n: 1, slug: 'vectors', name: 'Vectors & similarity' },
  { n: 2, slug: 'probability', name: 'Probability' },
  { n: 3, slug: 'statistics', name: 'Statistics' },
  { n: 4, slug: 'matrices', name: 'Matrices' },
  { n: 5, slug: 'softmax', name: 'Softmax & temperature' },
  { n: 6, slug: 'gradients', name: 'Gradients' },
  { n: 7, slug: 'cross-entropy', name: 'Cross-entropy' },
  { n: 8, slug: 'attention', name: 'Attention' },
] as const;

/** Side realm of free math floors. Floors are in MATH_FLOORS. */
export const MATH_TOWER = { slug: MATH_AREA, name: 'Math Tower', npc: 'Numerist Oru' } as const;

/** Side realm filled by the sync job. No tier (all open), no NPC, no outline. */
export const FRONTIER = { slug: FRONTIER_AREA, name: 'The Frontier' } as const;

/** Where lessons live, and the per-area outline file inside it. */
export const CONTENT_DIR = 'content';
export const OUTLINE_FILE = 'outline.json';
/** Realm chapters on two tracks that credit each other (docs/plans/shared-chapters-design-plan.md). At the content root. */
export const SHARED_CHAPTERS_FILE = 'shared-chapters.json';
/** Public URL base of the level art (public/levels/realm-0N, public/levels/math). */
export const LEVEL_ART_BASE = '/levels';
/** The parallax layers of every scene, back to front: `<base>/<layer>.png` (and /public/art/hero-<layer>.png). */
export const LEVEL_ART_LAYERS = ['sky', 'far', 'mid', 'near'] as const;
