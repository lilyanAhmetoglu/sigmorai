import 'server-only';
import { auth } from '@clerk/nextjs/server';
import { and, eq, like } from 'drizzle-orm';
import { cache } from 'react';
import { db } from '@/db';
import { progress } from '@/db/schema';
import { DASHBOARD_REALM_LIMIT, DEFAULT_TRACK, REALMS, TRACKS } from '@/lib/constants';
import { realmExerciseIds, trackExerciseIds } from '@/lib/content/ids';
import { hasContent, loadTrackOutline } from '@/lib/content/load';
import { activeRealms, buildTrackMap, clearedLevels, firstOpenStep } from '@/lib/grading/track-map';
import {
  RealmSlugSchema,
  TrackSchema,
  type HudStats,
  type NextStep,
  type RealmView,
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
type Viewer =
  | { status: 'signed-out' }
  | { status: 'onboarding' }
  | { status: 'ready'; userId: string; stats: HudStats };

const getViewer = cache(async (): Promise<Viewer> => {
  const hud = await getHudState();
  if (hud.status !== 'ready') return hud;
  // getHudState is cached per request; auth() gives the same session's id.
  const { userId } = await auth();
  return userId ? { status: 'ready', userId, stats: hud.stats } : { status: 'signed-out' };
});

/** Ids of this track that have a content file. Stubs (outline only) have none. */
async function scanLiveIds(track: Track): Promise<Set<string>> {
  const ids = trackExerciseIds(track);
  const live = await Promise.all(ids.map((id) => hasContent(id)));
  return new Set(ids.filter((_, i) => live[i]));
}

/** Content ships with the deploy, so production scans each track once per server. */
const liveIdsMemo = new Map<Track, Promise<Set<string>>>();
/** In dev, content files change while the server runs: scan once per request. */
const liveIdsPerRequest = cache(scanLiveIds);

function liveIds(track: Track): Promise<Set<string>> {
  if (process.env.NODE_ENV !== 'production') return liveIdsPerRequest(track);
  let ids = liveIdsMemo.get(track);
  if (!ids) {
    ids = scanLiveIds(track);
    liveIdsMemo.set(track, ids);
    ids.catch(() => liveIdsMemo.delete(track));
  }
  return ids;
}

/** Every exercise of this track the user cleared. The track is the id's first segment. */
async function clearedIds(userId: string, track: Track): Promise<Set<string>> {
  const rows = await db
    .select({ id: progress.exerciseId })
    .from(progress)
    .where(and(eq(progress.userId, userId), like(progress.exerciseId, `${track}/%`)));
  return new Set(rows.map((r) => r.id));
}

const getTrackMap = cache(async (track: Track, userId: string | null): Promise<TrackMap> => {
  const [outline, live, cleared] = await Promise.all([
    loadTrackOutline(track),
    liveIds(track),
    userId ? clearedIds(userId, track) : Promise.resolve(new Set<string>()),
  ]);
  return buildTrackMap(track, outline, live, cleared);
});

/** `?track=` if valid, else the player's own track, else the beginner path. */
function pickTrack(param: unknown, viewer: Viewer): Track {
  const parsed = TrackSchema.safeParse(param);
  if (parsed.success) return parsed.data;
  return viewer.status === 'ready' ? viewer.stats.track : DEFAULT_TRACK;
}

/** Progress is per track (the track is in every id), so any track shows the player's own clears. */
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

/** The realm's name, description and whether any chapter on either track is live (else noindex). */
export async function getRealmMeta(slug: string) {
  const parsed = RealmSlugSchema.safeParse(slug);
  if (!parsed.success) return null;
  const realm = REALMS.find((r) => r.slug === parsed.data)!;
  const lists = await Promise.all(TRACKS.map((track) => liveIds(track)));
  const indexable = TRACKS.some((track, i) =>
    realmExerciseIds(track, realm.id).some((id) => lists[i].has(id)),
  );
  // Same text on both tracks' URL (the canonical has no ?track=): the beginner path's topic.
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
    };

/** The signed-in player's next step, stats and realms, on their own track. */
export async function getDashboard(): Promise<Dashboard> {
  const viewer = await getViewer();
  if (viewer.status !== 'ready') return viewer;
  const map = await getTrackMap(viewer.stats.track, viewer.userId);
  return {
    status: 'ready',
    stats: viewer.stats,
    map,
    active: activeRealms(map.realms, DASHBOARD_REALM_LIMIT),
    levelsCleared: clearedLevels(map.realms),
  };
}
