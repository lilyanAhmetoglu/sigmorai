import 'server-only';
import { QUEST_ERROR_TEXT, REALMS } from '@/lib/constants';
import { isRealmOpen } from '@/lib/content/curriculum';
import { parseExerciseId } from '@/lib/content/ids';
import { hasContent } from '@/lib/content/load';
import type { RealmId } from '@/lib/types';

/**
 * What the quest page renders. No step is playable yet: the case form and
 * quick checks come in Phase C (quest-actions spec, amended 2026-10-05), the
 * lesson page in SIG-11.
 */
export type QuestPage =
  | { kind: 'not-found' }
  /** A real step this page can't show yet. */
  | { kind: 'unavailable' }
  | { kind: 'locked'; message: string };

/**
 * The quest page's read: a valid id with a content file, then the tier lock.
 * Signed-in reads must call checkOpen before loading the case (actions re-check).
 */
export async function getQuestPage(exerciseId: string): Promise<QuestPage> {
  const ref = parseExerciseId(exerciseId);
  if (!ref || !(await hasContent(exerciseId))) return { kind: 'not-found' };
  if (
    (ref.area === 'chapter' || ref.area === 'boss') &&
    !isRealmOpen(REALMS[ref.realm as RealmId].tier)
  ) {
    return { kind: 'locked', message: QUEST_ERROR_TEXT.TIER_LOCKED };
  }
  return { kind: 'unavailable' };
}
