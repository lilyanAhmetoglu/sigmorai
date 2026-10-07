import 'server-only';
import { and, eq, inArray } from 'drizzle-orm';
import type { Db, Tx } from '@/db';
import { progress } from '@/db/schema';
import {
  bossNotOpenText,
  floorNotOpenText,
  FRONTIER_AREA,
  MATH_AREA,
  notOpenText,
  REALMS,
} from '@/lib/constants';
import { isRealmOpen, outlineChapterCount } from '@/lib/content/curriculum';
import { buildExerciseId, parseExerciseId } from '@/lib/content/ids';
import { hasContent } from '@/lib/content/load';
import { applyCredit, withCreditors } from '@/lib/content/shared';
import type { ExerciseRef, QuestFailure, RealmId, Track } from '@/lib/types';
import { sharedGroups } from './credit';
import { questFailure as fail } from './failure';
import { trackOutline } from './outline';

/**
 * The open check (quest-actions spec → API contract). Run before any HP
 * change or XP write, on every action:
 *   parse the id → the chapter is in the track's outline → the content file
 *   exists → the realm's tier is open → chapter order (chapter N needs
 *   chapter N−1's case cleared; the boss needs every chapter of the realm in
 *   that track's outline), counted inside the exercise's own track.
 * A chapter past the outline's count (c9 of a 6-chapter realm) is
 * INVALID_INPUT, never NOT_OPEN (path-curriculum spec, amendments 2026-10-07).
 * Inside an open chapter, the lesson, challenge and quick check are all open.
 * A chapter whose case is cleared, or credited by a shared chapter on another
 * track (shared-chapters spec), is always open: it can be replayed even when
 * the chapter before it is not done.
 *
 * Math Tower (amended 2026-10-06): no tier and no realm check. Floor 1 is
 * open; floor N needs floor N−1's quick check cleared (its lesson alone is
 * not enough).
 *
 * The Frontier (amended 2026-10-07, SIG-29): every chapter is open. No order,
 * no tier; only the content file must exist.
 */

export type OpenResult = { ok: true; ref: ExerciseRef } | QuestFailure;

const challengeId = (track: Track, realm: number, chapter: number) =>
  buildExerciseId({ area: 'chapter', track, realm, chapter, step: 'challenge' });

/**
 * The exercise ids that must have a progress row before `ref` opens. Pure.
 * `chapterCount` is the realm's chapter count in its track's outline (the
 * boss needs every one); the Math Tower and the Frontier ignore it.
 */
export function requiredClears(ref: ExerciseRef, chapterCount: number): string[] {
  if (ref.area === MATH_AREA) {
    return ref.floor === 1
      ? []
      : [buildExerciseId({ area: MATH_AREA, floor: ref.floor - 1, step: 'quick-check' })];
  }
  if (ref.area === 'chapter') {
    return ref.chapter === 1 ? [] : [challengeId(ref.track, ref.realm, ref.chapter - 1)];
  }
  if (ref.area === 'boss') {
    return Array.from({ length: chapterCount }, (_, i) => challengeId(ref.track, ref.realm, i + 1));
  }
  return [];
}

/** The id whose clear keeps `ref` open: a chapter step's case, else the id itself. Pure. */
export function ownClear(ref: ExerciseRef): string {
  return ref.area === 'chapter'
    ? challengeId(ref.track, ref.realm, ref.chapter)
    : buildExerciseId(ref);
}

/**
 * The decision, given the ids this user has cleared (credit already added)
 * and the realm's chapter count from its track's outline. Pure: no IO.
 */
export function decideOpen(
  ref: ExerciseRef,
  cleared: ReadonlySet<string>,
  chapterCount: number,
): OpenResult {
  if (ref.area === MATH_AREA) {
    if (requiredClears(ref, chapterCount).some((id) => !cleared.has(id))) {
      return fail('NOT_OPEN', floorNotOpenText(ref.floor - 1));
    }
    return { ok: true, ref };
  }
  // Every Frontier chapter is open: no order, no tier (checkOpen already proved the file exists).
  if (ref.area === FRONTIER_AREA) return { ok: true, ref };
  // The grammar allows c1–c12; this realm's outline may have fewer.
  if (ref.area === 'chapter' && ref.chapter > chapterCount) return fail('INVALID_INPUT');
  if (!isRealmOpen(REALMS[ref.realm as RealmId].tier)) return fail('TIER_LOCKED');
  if (cleared.has(ownClear(ref))) return { ok: true, ref };
  if (requiredClears(ref, chapterCount).some((id) => !cleared.has(id))) {
    return fail(
      'NOT_OPEN',
      ref.area === 'boss' ? bossNotOpenText(chapterCount) : notOpenText(ref.chapter - 1),
    );
  }
  return { ok: true, ref };
}

/**
 * The realm's chapter count in its track's outline (memoised). 0 for the Math
 * Tower and the Frontier (no realm chapters). Null when the realm is not in
 * the outline.
 */
async function chapterCountFor(ref: ExerciseRef): Promise<number | null> {
  if (ref.area !== 'chapter' && ref.area !== 'boss') return 0;
  return outlineChapterCount(await trackOutline(ref.track), ref.realm);
}

/**
 * The full check for the session user. `exec` is the db or the caller's
 * transaction (a graded action runs it inside its user-row lock).
 */
export async function checkOpen(
  exec: Db | Tx,
  userId: string,
  exerciseId: string,
): Promise<OpenResult> {
  const ref = parseExerciseId(exerciseId);
  if (!ref) return fail('INVALID_INPUT');
  const chapterCount = await chapterCountFor(ref);
  if (chapterCount === null || !(await hasContent(exerciseId))) return fail('INVALID_INPUT');

  const groups = await sharedGroups();
  const lookup = withCreditors([...requiredClears(ref, chapterCount), ownClear(ref)], groups);
  const rows = await exec
    .select({ id: progress.exerciseId })
    .from(progress)
    .where(and(eq(progress.userId, userId), inArray(progress.exerciseId, lookup)));
  return decideOpen(ref, applyCredit(new Set(rows.map((r) => r.id)), groups).cleared, chapterCount);
}
