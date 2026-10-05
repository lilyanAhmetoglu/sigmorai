import { QUEST_ERROR_TEXT } from '@/lib/constants';
import type { QuestActionFailure, QuestErrorCode, QuestFailure } from '@/lib/types';

/** The one way to build a refused quest press. The message defaults to QUEST_ERROR_TEXT. */
export function questFailure(
  code: QuestErrorCode,
  message: string = QUEST_ERROR_TEXT[code],
): QuestFailure {
  return { ok: false, code, message };
}

/** A refusal as a Server Action returns it: `{ ok: false, code, message }`. */
export function toActionFailure({ code, message }: QuestFailure): QuestActionFailure {
  return { ok: false, code, message };
}
