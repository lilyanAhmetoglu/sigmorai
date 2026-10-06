import 'server-only';
import { cache } from 'react';
import { MATH_AREA } from '@/lib/constants';
import { loadMathOutline } from '@/lib/content/load';
import { buildTowerMap } from '@/lib/grading/track-map';
import type { ChapterView, MathOutline } from '@/lib/types';
import { clearedIds, getViewer, liveIds, type Viewer } from './realms';

/**
 * The Math Tower page's read. Public: a visitor sees the floors with no
 * progress. Progress is scoped to auth()'s user only (getViewer). States come
 * from buildTowerMap, the same lock rule the Server Actions run.
 */

/** One floor card: its state and steps, plus what it covers (content/math/outline.json). */
export type FloorView = ChapterView & Pick<MathOutline['floors'][number], 'covers' | 'formulas'>;

export type MathPage = { viewer: Viewer['status']; floors: FloorView[] };

export const getMathPage = cache(async (): Promise<MathPage> => {
  const viewer = await getViewer();
  const [outline, live, cleared] = await Promise.all([
    loadMathOutline(),
    liveIds(MATH_AREA),
    viewer.status === 'ready' ? clearedIds(viewer.userId, MATH_AREA) : new Set<string>(),
  ]);
  const floors = buildTowerMap(live, cleared).map((view, i): FloorView => {
    const { covers, formulas } = outline.floors[i];
    return { ...view, covers, formulas };
  });
  return { viewer: viewer.status, floors };
});
