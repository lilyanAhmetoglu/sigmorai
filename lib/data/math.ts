import 'server-only';
import { cache } from 'react';
import { MATH_AREA } from '@/lib/constants';
import { loadMathOutline } from '@/lib/content/load';
import { buildTowerMap, towerSummary } from '@/lib/grading/track-map';
import type { FloorState, FloorView, MathPage, TowerSummary } from '@/lib/types';
import { clearedIds, getViewer, liveIds, type Viewer } from './realms';

/**
 * The Math Tower reads: the /math page and the dashboard's tower panel.
 * Public: a visitor sees the floors with no progress. Progress is scoped to
 * auth()'s user only (getViewer). States come from buildTowerMap, the same
 * lock rule the Server Actions run.
 */

/** This viewer's floor states. One read per request, shared by both pages' reads. */
const getTowerFloors = cache(async (viewer: Viewer): Promise<FloorState[]> => {
  const [live, cleared] = await Promise.all([
    liveIds(MATH_AREA),
    viewer.status === 'ready' ? clearedIds(viewer.userId, MATH_AREA) : new Set<string>(),
  ]);
  return buildTowerMap(live, cleared);
});

export const getMathPage = cache(async (): Promise<MathPage> => {
  const viewer = await getViewer();
  const [outline, states] = await Promise.all([loadMathOutline(), getTowerFloors(viewer)]);
  const floors = states.map((view, i): FloorView => {
    const { covers, formulas } = outline.floors[i];
    return { ...view, covers, formulas };
  });
  return { viewer: viewer.status, floors };
});

/** The dashboard's Math Tower panel and MATH FLOORS stat. null for a visitor (no progress). */
export const getTowerSummary = cache(async (): Promise<TowerSummary | null> => {
  const viewer = await getViewer();
  if (viewer.status !== 'ready') return null;
  return towerSummary(await getTowerFloors(viewer));
});
