import 'server-only';
import { and, eq, inArray } from 'drizzle-orm';
import type { Db, Tx } from '@/db';
import { progress } from '@/db/schema';
import { BOSS_NOT_OPEN_TEXT, CHAPTER_COUNT, notOpenText, REALMS } from '@/lib/constants';
import { isRealmOpen } from '@/lib/content/curriculum';
import { buildExerciseId, parseExerciseId } from '@/lib/content/ids';
import { hasContent } from '@/lib/content/load';
import type { ExerciseRef, QuestFailure, RealmId, Track } from '@/lib/types';
import { questFailure as fail } from './failure';

/**
 * The open check (quest-actions spec → API contract). Run before any HP
 * change or XP write, on every action:
 *   parse the id → the content file exists → the realm's tier is open →
 *   chapter order (chapter N needs chapter N−1's case cleared; the boss
 *   needs all of them), counted inside the exercise's own track.
 * Inside an open chapter, the lesson, challenge and quick check are all open.
 */

export type OpenResult = { ok: true; ref: ExerciseRef } | QuestFailure;

const challengeId = (track: Track, realm: number, chapter: number) =>
  buildExerciseId({ area: 'chapter', track, realm, chapter, step: 'challenge' });

/** The challenge ids that must have a progress row before `ref` opens. Pure. */
export function requiredClears(ref: ExerciseRef): string[] {
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

/** The decision, given the ids this user has cleared. Pure: no IO. */
export function decideOpen(ref: ExerciseRef, cleared: ReadonlySet<string>): OpenResult {
  // Math Tower and Frontier join the open check in step 6.
  if (ref.area !== 'chapter' && ref.area !== 'boss') return fail('INVALID_INPUT');
  if (!isRealmOpen(REALMS[ref.realm as RealmId].tier)) return fail('TIER_LOCKED');
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

  const required = requiredClears(ref);
  const rows = required.length
    ? await exec
        .select({ id: progress.exerciseId })
        .from(progress)
        .where(and(eq(progress.userId, userId), inArray(progress.exerciseId, required)))
    : [];
  return decideOpen(ref, new Set(rows.map((r) => r.id)));
}
