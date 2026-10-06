import 'server-only';
import { cache } from 'react';
import { loadMathOutline } from '@/lib/content/load';
import type { FloorView, MathPage } from '@/lib/types';
import { getTowerFloors, getViewer } from './realms';

/**
 * The Math Tower page's read. Public: a visitor sees the floors with no
 * progress. Progress is scoped to auth()'s user only (getViewer). Floor
 * states come from getTowerFloors (lib/data/realms.ts, also used by the
 * dashboard), built by buildTowerMap, the same lock rule the Server Actions run.
 */

export const getMathPage = cache(async (): Promise<MathPage> => {
  const viewer = await getViewer();
  const [outline, states] = await Promise.all([
    loadMathOutline(),
    getTowerFloors(viewer.status === 'ready' ? viewer.userId : null),
  ]);
  const floors = states.map((view, i): FloorView => {
    const { covers, formulas } = outline.floors[i];
    return { ...view, covers, formulas };
  });
  return { viewer: viewer.status, floors };
});
