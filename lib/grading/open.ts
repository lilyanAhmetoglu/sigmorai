import 'server-only';
import { and, eq, inArray } from 'drizzle-orm';
import type { Db, Tx } from '@/db';
import { progress } from '@/db/schema';
import {
  BOSS_NOT_OPEN_TEXT,
  CHAPTER_COUNT,
  floorNotOpenText,
  MATH_AREA,
  notOpenText,
  REALMS,
} from '@/lib/constants';
import { isRealmOpen } from '@/lib/content/curriculum';
import { buildExerciseId, parseExerciseId } from '@/lib/content/ids';
import { hasContent } from '@/lib/content/load';
import { applyCredit, withCreditors } from '@/lib/content/shared';
import type { ExerciseRef, QuestFailure, RealmId, Track } from '@/lib/types';
import { sharedGroups } from './credit';
import { questFailure as fail } from './failure';

/**
 * The open check (quest-actions spec → API contract). Run before any HP
 * change or XP write, on every action:
 *   parse the id → the content file exists → the realm's tier is open →
 *   chapter order (chapter N needs chapter N−1's case cleared; the boss
 *   needs all of them), counted inside the exercise's own track.
 * Inside an open chapter, the lesson, challenge and quick check are all open.
 * A chapter whose case is cleared, or credited by a shared chapter on another
 * track (shared-chapters spec), is always open: it can be replayed even when
 * the chapter before it is not done.
 *
 * Math Tower (amended 2026-10-06): no tier and no realm check. Floor 1 is
 * open; floor N needs floor N−1's quick check cleared (its lesson alone is
 * not enough). Frontier is not handled yet: INVALID_INPUT.
 */

export type OpenResult = { ok: true; ref: ExerciseRef } | QuestFailure;

const challengeId = (track: Track, realm: number, chapter: number) =>
  buildExerciseId({ area: 'chapter', track, realm, chapter, step: 'challenge' });

/** The exercise ids that must have a progress row before `ref` opens. Pure. */
export function requiredClears(ref: ExerciseRef): string[] {
  if (ref.area === MATH_AREA) {
    return ref.floor === 1
      ? []
      : [buildExerciseId({ area: MATH_AREA, floor: ref.floor - 1, step: 'quick-check' })];
  }
  if (ref.area === 'chapter') {
    return ref.chapter === 1 ? [] : [challengeId(ref.track, ref.realm, ref.chapter - 1)];
  }
  if (ref.area === 'boss') {
    return Array.from({ length: CHAPTER_COUNT }, (_, i) =>
      challengeId(ref.track, ref.realm, i + 1),
    );
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
 * The decision, given the ids this user has cleared (credit already added).
 * Pure: no IO.
 */
export function decideOpen(ref: ExerciseRef, cleared: ReadonlySet<string>): OpenResult {
  if (ref.area === MATH_AREA) {
    if (requiredClears(ref).some((id) => !cleared.has(id))) {
      return fail('NOT_OPEN', floorNotOpenText(ref.floor - 1));
    }
    return { ok: true, ref };
  }
  // The Frontier has no open rule yet (its list page comes later).
  if (ref.area !== 'chapter' && ref.area !== 'boss') return fail('INVALID_INPUT');
  if (!isRealmOpen(REALMS[ref.realm as RealmId].tier)) return fail('TIER_LOCKED');
  if (cleared.has(ownClear(ref))) return { ok: true, ref };
  if (requiredClears(ref).some((id) => !cleared.has(id))) {
    return fail(
      'NOT_OPEN',
      ref.area === 'boss' ? BOSS_NOT_OPEN_TEXT : notOpenText(ref.chapter - 1),
    );
  }
  return { ok: true, ref };
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
  if (!ref || !(await hasContent(exerciseId))) return fail('INVALID_INPUT');

  const groups = await sharedGroups();
  const lookup = withCreditors([...requiredClears(ref), ownClear(ref)], groups);
  const rows = await exec
    .select({ id: progress.exerciseId })
    .from(progress)
    .where(and(eq(progress.userId, userId), inArray(progress.exerciseId, lookup)));
  return decideOpen(ref, applyCredit(new Set(rows.map((r) => r.id)), groups).cleared);
}
