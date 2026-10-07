/**
 * Shared chapters (docs/plans/shared-chapters-design-plan.md): realm chapters
 * on two tracks that credit each other. Credit is for the case only and is
 * computed on read, never stored: a progress row keeps its own track id.
 *
 *   same   → a clear of any member's case credits every other member's case.
 *   covers → a clear of the deep member's case credits the light one, never back.
 *
 * Pure: no IO. The groups come from content/shared-chapters.json (loadSharedChapters).
 */
import { BOSS_STEP } from '@/lib/constants';
import type { SharedChapterGroup, Track } from '@/lib/types';
import { parseExerciseId } from './ids';

/** `builder/r1/c5` → `builder/r1/c5/challenge`. */
const caseId = (member: string) => `${member}/${BOSS_STEP}`;

/** The case ids whose clear credits `id`. Empty for any id that is not a shared case. */
export function creditorsOf(id: string, groups: readonly SharedChapterGroup[]): string[] {
  for (const group of groups) {
    const cases = group.members.map(caseId);
    if (!cases.includes(id)) continue;
    if (group.kind === 'same') return cases.filter((c) => c !== id);
    const deep = caseId(group.deep);
    return id === deep ? [] : [deep];
  }
  return [];
}

/** `ids` plus every case id that can credit one of them, no repeats: what a credit check reads. */
export function withCreditors(
  ids: readonly string[],
  groups: readonly SharedChapterGroup[],
): string[] {
  return [...new Set([...ids, ...ids.flatMap((id) => creditorsOf(id, groups))])];
}

/** Every case id on another track that can credit a case on `track`: what the track map reads. */
export function creditorsForTrack(track: Track, groups: readonly SharedChapterGroup[]): string[] {
  const own = groups.flatMap((g) => g.members.filter((m) => m.startsWith(`${track}/`)));
  return withCreditors(own.map(caseId), groups).filter((id) => !id.startsWith(`${track}/`));
}

export type Credit = {
  /** The real clears plus every credited case id. */
  cleared: Set<string>;
  /** Credited case id → the track whose clear credited it (for "Cleared on the … path"). */
  creditedFrom: Map<string, Track>;
};

/** Adds the credited cases to a set of real clears. A real clear is never marked as credited. */
export function applyCredit(
  cleared: ReadonlySet<string>,
  groups: readonly SharedChapterGroup[],
): Credit {
  const result: Credit = { cleared: new Set(cleared), creditedFrom: new Map() };
  for (const id of groups.flatMap((g) => g.members.map(caseId))) {
    if (cleared.has(id)) continue;
    const from = creditorsOf(id, groups).find((c) => cleared.has(c));
    const ref = from ? parseExerciseId(from) : null;
    if (ref?.area !== 'chapter') continue;
    result.cleared.add(id);
    result.creditedFrom.set(id, ref.track);
  }
  return result;
}
