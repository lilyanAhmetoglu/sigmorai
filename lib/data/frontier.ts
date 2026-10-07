import 'server-only';
import { cache } from 'react';
import { FRONTIER_AREA } from '@/lib/constants';
import { hasContent, listFrontierChapters } from '@/lib/content/load';
import { buildFrontierList, frontierSummary } from '@/lib/grading/track-map';
import type {
  FrontierChapter,
  FrontierChapterView,
  FrontierPage,
  FrontierSummary,
} from '@/lib/types';
import { clearedIds, getViewer } from './realms';

/**
 * The Frontier's reads (curriculum plan, amendment 2026-10-07 SIG-29). Public:
 * a visitor sees the chapters with no progress. Progress is scoped to
 * auth()'s user only (getViewer). Every chapter is open; states come from
 * buildFrontierList, the same open rule the Server Actions run. Frontier ids
 * have no track, so progress is shared across paths.
 */

type Scan = { chapters: FrontierChapter[]; live: Set<string> };

/** The chapters on disk, newest first, and which of their steps have a file. */
async function scanChapters(): Promise<Scan> {
  const chapters = await listFrontierChapters();
  // listFrontierChapters already read every lesson, so only the quick checks need a look.
  const quick = await Promise.all(chapters.map((c) => hasContent(c.quickCheckId)));
  const live = new Set(chapters.map((c) => c.lessonId));
  chapters.forEach((c, i) => {
    if (quick[i]) live.add(c.quickCheckId);
  });
  return { chapters, live };
}

/** Content ships with the deploy, so production scans once per server. */
let scanMemo: Promise<Scan> | null = null;
/** In dev, content files change while the server runs: scan once per request. */
const scanPerRequest = cache(scanChapters);

function frontierScan(): Promise<Scan> {
  if (process.env.NODE_ENV !== 'production') return scanPerRequest();
  if (!scanMemo) {
    scanMemo = scanChapters();
    scanMemo.catch(() => {
      scanMemo = null;
    });
  }
  return scanMemo;
}

/** Every Frontier chapter, newest first. Shared with the sitemap. */
export const getFrontierChapters = async (): Promise<FrontierChapter[]> =>
  (await frontierScan()).chapters;

/** Chapter states for this user (null: a visitor). Cached per request on the user id. */
const getFrontierList = cache(async (userId: string | null): Promise<FrontierChapterView[]> => {
  const [{ chapters, live }, cleared] = await Promise.all([
    frontierScan(),
    userId ? clearedIds(userId, FRONTIER_AREA) : Promise.resolve(new Set<string>()),
  ]);
  return buildFrontierList(chapters, live, cleared);
});

/** The /frontier page's read. */
export const getFrontierPage = cache(async (): Promise<FrontierPage> => {
  const viewer = await getViewer();
  const chapters = await getFrontierList(viewer.status === 'ready' ? viewer.userId : null);
  return { viewer: viewer.status, chapters };
});

/** The dashboard's FRONTIER panel, for the signed-in player (a visitor: no progress). */
export async function getFrontierSummary(): Promise<FrontierSummary> {
  const viewer = await getViewer();
  return frontierSummary(await getFrontierList(viewer.status === 'ready' ? viewer.userId : null));
}
