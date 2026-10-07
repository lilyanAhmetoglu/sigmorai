import 'server-only';
import { auth } from '@clerk/nextjs/server';
import { and, eq, inArray, like } from 'drizzle-orm';
import { cache } from 'react';
import { db } from '@/db';
import { progress } from '@/db/schema';
import {
  DASHBOARD_REALM_LIMIT,
  DEFAULT_TRACK,
  type FRONTIER_AREA,
  MATH_AREA,
  REALMS,
  TRACKS,
} from '@/lib/constants';
import { mathExerciseIds, realmExerciseIds, trackExerciseIds } from '@/lib/content/ids';
import { hasContent, loadTrackOutline } from '@/lib/content/load';
import { applyCredit, creditorsForTrack, type Credit } from '@/lib/content/shared';
import { sharedGroups } from '@/lib/grading/credit';
import {
  activeRealms,
  buildTowerMap,
  buildTrackMap,
  clearedLevels,
  firstOpenStep,
  towerSummary,
} from '@/lib/grading/track-map';
import {
  RealmSlugSchema,
  TrackSchema,
  type FloorState,
  type HudStats,
  type NextStep,
  type RealmView,
  type TowerSummary,
  type Track,
  type TrackMap,
} from '@/lib/types';
import { getHudState } from './hud';

/**
 * Reads for the dashboard and the realm pages. Progress is scoped to Clerk's
 * auth() user only. Realm pages are public (curriculum spec): a visitor gets
 * the same map with no progress. Every state is computed here, on the server,
 * by the same lock rule the Server Actions run.
 */

/** Who is looking. A visitor (signed out or not onboarded) has no progress. */
export type Viewer =
  | { status: 'signed-out' }
  | { status: 'onboarding' }
  | { status: 'ready'; userId: string; stats: HudStats };

/** Shared with lib/data/math.ts: one viewer read per request. */
export const getViewer = cache(async (): Promise<Viewer> => {
  const hud = await getHudState();
  if (hud.status !== 'ready') return hud;
  // getHudState is cached per request; auth() gives the same session's id.
  const { userId } = await auth();
  return userId ? { status: 'ready', userId, stats: hud.stats } : { status: 'signed-out' };
});

/** What has its own set of live ids: a track, or the Math Tower. */
type LiveArea = Track | typeof MATH_AREA;

/** Ids of this track (or the tower) that have a content file. Stubs (outline only) have none. */
async function scanLiveIds(area: LiveArea): Promise<Set<string>> {
  const ids = area === MATH_AREA ? mathExerciseIds() : trackExerciseIds(area);
  const live = await Promise.all(ids.map((id) => hasContent(id)));
  return new Set(ids.filter((_, i) => live[i]));
}

/** Content ships with the deploy, so production scans each area once per server. */
const liveIdsMemo = new Map<LiveArea, Promise<Set<string>>>();
/** In dev, content files change while the server runs: scan once per request. */
const liveIdsPerRequest = cache(scanLiveIds);

/** Shared with lib/data/math.ts. */
export function liveIds(area: LiveArea): Promise<Set<string>> {
  if (process.env.NODE_ENV !== 'production') return liveIdsPerRequest(area);
  let ids = liveIdsMemo.get(area);
  if (!ids) {
    ids = scanLiveIds(area);
    liveIdsMemo.set(area, ids);
    ids.catch(() => liveIdsMemo.delete(area));
  }
  return ids;
}

/**
 * Every exercise of this track (or the tower, or the Frontier) the user
 * cleared. The area is the id's first segment. Shared with lib/data/math.ts
 * and lib/data/frontier.ts.
 */
export async function clearedIds(
  userId: string,
  area: LiveArea | typeof FRONTIER_AREA,
): Promise<Set<string>> {
  const rows = await db
    .select({ id: progress.exerciseId })
    .from(progress)
    .where(and(eq(progress.userId, userId), like(progress.exerciseId, `${area}/%`)));
  return new Set(rows.map((r) => r.id));
}

/**
 * The Math Tower's floor states for this user (null: a visitor, no progress).
 * Cached per request on the user id; shared by the dashboard (getDashboard)
 * and the /math page (lib/data/math.ts).
 */
export const getTowerFloors = cache(async (userId: string | null): Promise<FloorState[]> => {
  const [live, cleared] = await Promise.all([
    liveIds(MATH_AREA),
    userId ? clearedIds(userId, MATH_AREA) : Promise.resolve(new Set<string>()),
  ]);
  return buildTowerMap(live, cleared);
});

/**
 * This track's clears plus the credit from shared chapters on other tracks
 * (shared-chapters spec): it reads only the other tracks' cases that can
 * credit one here, then adds the credit in memory.
 */
async function trackClears(userId: string, track: Track): Promise<Credit> {
  const groups = await sharedGroups();
  const others = creditorsForTrack(track, groups);
  const [own, rows] = await Promise.all([
    clearedIds(userId, track),
    others.length
      ? db
          .select({ id: progress.exerciseId })
          .from(progress)
          .where(and(eq(progress.userId, userId), inArray(progress.exerciseId, others)))
      : Promise.resolve([]),
  ]);
  for (const r of rows) own.add(r.id);
  return applyCredit(own, groups);
}

const noClears = (): Promise<Credit> =>
  Promise.resolve({ cleared: new Set<string>(), creditedFrom: new Map() });

const getTrackMap = cache(async (track: Track, userId: string | null): Promise<TrackMap> => {
  const [outline, live, credit] = await Promise.all([
    loadTrackOutline(track),
    liveIds(track),
    userId ? trackClears(userId, track) : noClears(),
  ]);
  return buildTrackMap(track, outline, live, credit.cleared, credit.creditedFrom);
});

/** `?track=` if valid, else the player's own track, else the beginner path. */
function pickTrack(param: unknown, viewer: Viewer): Track {
  const parsed = TrackSchema.safeParse(param);
  if (parsed.success) return parsed.data;
  return viewer.status === 'ready' ? viewer.stats.track : DEFAULT_TRACK;
}

/** Progress is per track (the track is in every id), so any track shows the player's own clears and credit. */
async function mapFor(param: unknown) {
  const viewer = await getViewer();
  const track = pickTrack(param, viewer);
  const map = await getTrackMap(track, viewer.status === 'ready' ? viewer.userId : null);
  return { viewer: viewer.status, map };
}

export type RealmsPage = { viewer: Viewer['status']; map: TrackMap };

export const getRealmsPage = (trackParam: unknown): Promise<RealmsPage> => mapFor(trackParam);

export type RealmPage = {
  viewer: Viewer['status'];
  track: Track;
  realm: RealmView;
  /** The first open step inside this realm, for its Start / Continue button. */
  next: NextStep | null;
};

/** null for an unknown slug (the page 404s). */
export async function getRealmPage(slug: string, trackParam: unknown): Promise<RealmPage | null> {
  const parsed = RealmSlugSchema.safeParse(slug);
  if (!parsed.success) return null;
  const { viewer, map } = await mapFor(trackParam);
  const realm = map.realms.find((r) => r.slug === parsed.data)!;
  return { viewer, track: map.track, realm, next: firstOpenStep([realm]) };
}

/** The realm's name, description and whether any chapter on any track is live (else noindex). */
export async function getRealmMeta(slug: string) {
  const parsed = RealmSlugSchema.safeParse(slug);
  if (!parsed.success) return null;
  const realm = REALMS.find((r) => r.slug === parsed.data)!;
  const lists = await Promise.all(TRACKS.map((track) => liveIds(track)));
  const indexable = TRACKS.some((track, i) =>
    realmExerciseIds(track, realm.id).some((id) => lists[i].has(id)),
  );
  // Same text on every track' URL (the canonical has no ?track=): the beginner path's topic.
  const outline = await loadTrackOutline(DEFAULT_TRACK);
  return { name: realm.name, description: outline.realms[realm.id].topic, indexable };
}

export type Dashboard =
  | { status: 'signed-out' }
  | { status: 'onboarding' }
  | {
      status: 'ready';
      stats: HudStats;
      map: TrackMap;
      /** In-progress then open realms, capped for the "Your realms" row. */
      active: RealmView[];
      /** Chapters and bosses cleared on the player's track. */
      levelsCleared: number;
      /** The Math Tower panel and MATH FLOORS stat. */
      tower: TowerSummary;
    };

/** The signed-in player's next step, stats and realms, on their own track. */
export async function getDashboard(): Promise<Dashboard> {
  const viewer = await getViewer();
  if (viewer.status !== 'ready') return viewer;
  const [map, floors] = await Promise.all([
    getTrackMap(viewer.stats.track, viewer.userId),
    getTowerFloors(viewer.userId),
  ]);
  return {
    status: 'ready',
    stats: viewer.stats,
    map,
    active: activeRealms(map.realms, DASHBOARD_REALM_LIMIT),
    levelsCleared: clearedLevels(map.realms),
    tower: towerSummary(floors),
  };
}
