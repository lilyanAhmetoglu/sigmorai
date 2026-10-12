import 'server-only';
import { auth } from '@clerk/nextjs/server';
import { and, eq, inArray, like } from 'drizzle-orm';
import { cache } from 'react';
import { db } from '@/db';
import { progress } from '@/db/schema';
import {
  BOSS_STEP,
  DEFAULT_TRACK,
  FRONTIER_AREA,
  MATH_AREA,
  REALMS,
  realmPageTrack,
  realmTracks,
} from '@/lib/constants';
import { mathExerciseIds, realmExerciseIds, trackExerciseIds } from '@/lib/content/ids';
import { outlineChapterCount } from '@/lib/content/curriculum';
import { hasContent, loadCase } from '@/lib/content/load';
import { applyCredit, creditorsForTrack, type Credit } from '@/lib/content/shared';
import { sharedGroups } from '@/lib/grading/credit';
import { trackOutline } from '@/lib/grading/outline';
import {
  buildTowerMap,
  buildTrackMap,
  clearedLevels,
  firstOpenStep,
  realmNeighbours,
  towerSummary,
} from '@/lib/grading/track-map';
import {
  RealmSlugSchema,
  TrackSchema,
  type ChapterGoal,
  type FloorState,
  type HudStats,
  type NextStep,
  type RealmView,
  type TowerSummary,
  type Track,
  type TrackMap,
} from '@/lib/types';
import { getHudState } from './hud';
import { isUnlockAll } from './unlock-all';

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

/**
 * An id's first segment that progress can be read by: a track, the tower, or
 * the Frontier. The Frontier is not a LiveArea: its folders are dated, so
 * lib/data/frontier.ts scans them itself.
 */
type ProgressArea = LiveArea | typeof FRONTIER_AREA;

/** Ids of this track (or the tower) that have a content file. Stubs (outline only) have none. */
async function scanLiveIds(area: LiveArea): Promise<Set<string>> {
  const ids =
    area === MATH_AREA ? mathExerciseIds() : trackExerciseIds(area, await trackOutline(area));
  const live = await Promise.all(ids.map((id) => hasContent(id)));
  return new Set(ids.filter((_, i) => live[i]));
}

/**
 * A content read, memoised. Content ships with the deploy, so production
 * reads each key once per server (a failed read is dropped, so it retries).
 * In dev, content files change while the server runs: once per request.
 */
function memoPerDeploy<K, V>(load: (key: K) => Promise<V>): (key: K) => Promise<V> {
  const memo = new Map<K, Promise<V>>();
  const perRequest = cache(load);
  return (key) => {
    if (process.env.NODE_ENV !== 'production') return perRequest(key);
    let value = memo.get(key);
    if (!value) {
      value = load(key);
      memo.set(key, value);
      value.catch(() => memo.delete(key));
    }
    return value;
  };
}

/** Shared with lib/data/math.ts. */
export const liveIds: (area: LiveArea) => Promise<Set<string>> = memoPerDeploy(scanLiveIds);

/**
 * Every exercise of this track (or the tower, or the Frontier) the user
 * cleared. The area is the id's first segment. Shared with lib/data/math.ts
 * and lib/data/frontier.ts.
 */
export async function clearedIds(userId: string, area: ProgressArea): Promise<Set<string>> {
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
  const [live, cleared, unlockAll] = await Promise.all([
    liveIds(MATH_AREA),
    userId ? clearedIds(userId, MATH_AREA) : Promise.resolve(new Set<string>()),
    userId ? isUnlockAll(userId) : Promise.resolve(false),
  ]);
  return buildTowerMap(live, cleared, { unlockAll });
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
  const [outline, live, credit, unlockAll] = await Promise.all([
    trackOutline(track),
    liveIds(track),
    userId ? trackClears(userId, track) : noClears(),
    userId ? isUnlockAll(userId) : Promise.resolve(false),
  ]);
  return buildTrackMap(track, outline, live, credit.cleared, credit.creditedFrom, REALMS, {
    unlockAll,
  });
});

/** `?track=` if valid, else the player's own track, else the beginner path. */
function pickTrack(param: unknown, viewer: Viewer): Track {
  const parsed = TrackSchema.safeParse(param);
  if (parsed.success) return parsed.data;
  return viewer.status === 'ready' ? viewer.stats.track : DEFAULT_TRACK;
}

/**
 * Progress is per track (the track is in every id), so any track shows the
 * player's own clears and credit. `resolve` turns the picked track into the
 * one to show (a specialist realm page: always its owner's).
 */
async function mapFor(param: unknown, resolve: (picked: Track) => Track = (t) => t) {
  const viewer = await getViewer();
  const track = resolve(pickTrack(param, viewer));
  const map = await getTrackMap(track, viewer.status === 'ready' ? viewer.userId : null);
  const heroName = viewer.status === 'ready' ? viewer.stats.heroName : null;
  return { viewer: viewer.status, map, heroName };
}

export type RealmsPage = {
  viewer: Viewer['status'];
  map: TrackMap;
  /** The world map hero's sprite seed. Null for a visitor or a player still in onboarding. */
  heroName: string | null;
};

export const getRealmsPage = (trackParam: unknown): Promise<RealmsPage> => mapFor(trackParam);

export type RealmPage = {
  viewer: Viewer['status'];
  track: Track;
  realm: RealmView;
  /** The first open step inside this realm, for its Start / Continue button. */
  next: NextStep | null;
  /** The realms before and after it in the track's outline order (the map's prev / next). */
  prev: RealmView | null;
  after: RealmView | null;
};

/** A case's title (only the title: never its options or answers). */
const caseTitle = memoPerDeploy(async (id: string) => (await loadCase(id)).title);

/**
 * Each level-map card's one-line goal, in `realm.chapters` order
 * (clear-maps amendment), as facts: a chapter's case title, the boss's
 * outline task. The component words them. No new copy. Null when a
 * chapter's case has no file yet, or fails to load: the card still shows,
 * without a goal.
 */
export async function getChapterGoals(
  track: Track,
  realm: Pick<RealmView, 'id' | 'chapters'>,
): Promise<(ChapterGoal | null)[]> {
  const [outline, live] = await Promise.all([trackOutline(track), liveIds(track)]);
  const task = outline.realms.find((r) => r.id === realm.id)?.boss.task;
  return Promise.all(
    realm.chapters.map(async (chapter) => {
      if (chapter.chapter === null) return task ? { kind: 'boss' as const, text: task } : null;
      const kase = chapter.steps.find((s) => s.step === BOSS_STEP);
      if (!kase || !live.has(kase.exerciseId)) return null;
      try {
        return { kind: 'case' as const, text: await caseTitle(kase.exerciseId) };
      } catch {
        return null;
      }
    }),
  );
}

/**
 * null for an unknown slug, or a realm not in the shown track's outline
 * (the page 404s; never a crash). A specialist realm always shows its
 * owner's path: `?track=` is ignored there (path-curriculum spec).
 */
export async function getRealmPage(slug: string, trackParam: unknown): Promise<RealmPage | null> {
  const parsed = RealmSlugSchema.safeParse(slug);
  if (!parsed.success) return null;
  const row = REALMS.find((r) => r.slug === parsed.data);
  if (!row) return null;
  const { viewer, map } = await mapFor(trackParam, (picked) => realmPageTrack(row, picked));
  const realm = map.realms.find((r) => r.id === row.id);
  if (!realm) return null;
  return {
    viewer,
    track: map.track,
    realm,
    next: firstOpenStep([realm]),
    ...realmNeighbours(map.realms, realm.id),
  };
}

/**
 * The realm's name, description and whether any chapter is live on a track
 * that has it (else noindex). A specialist realm is checked on its owner
 * track only.
 */
export async function getRealmMeta(slug: string) {
  const parsed = RealmSlugSchema.safeParse(slug);
  if (!parsed.success) return null;
  const realm = REALMS.find((r) => r.slug === parsed.data);
  if (!realm) return null;
  const tracks = realmTracks(realm);
  const [lists, outlines] = await Promise.all([
    Promise.all(tracks.map((track) => liveIds(track))),
    Promise.all(tracks.map((track) => trackOutline(track))),
  ]);
  const indexable = tracks.some((track, i) =>
    realmExerciseIds(track, realm.id, outlineChapterCount(outlines[i], realm.id) ?? 0).some((id) =>
      lists[i].has(id),
    ),
  );
  // Same text on every track's URL (the canonical has no ?track=): the beginner
  // path's topic, or a specialist realm's own path's.
  const outline = outlines[tracks.indexOf(realmPageTrack(realm, DEFAULT_TRACK))];
  const topic = outline.realms.find((r) => r.id === realm.id)?.topic;
  return { name: realm.name, description: topic ?? realm.name, indexable };
}

export type Dashboard =
  | { status: 'signed-out' }
  | { status: 'onboarding' }
  | {
      status: 'ready';
      stats: HudStats;
      map: TrackMap;
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
    levelsCleared: clearedLevels(map.realms),
    tower: towerSummary(floors),
  };
}
