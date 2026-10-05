import { QUEST_ERROR_TEXT } from '@/lib/constants';
import type { CapReached, QuestActionFailure, QuestErrorCode, QuestFailure } from '@/lib/types';

/** The one way to build a refused quest press. The message defaults to QUEST_ERROR_TEXT. */
export function questFailure(
  code: QuestErrorCode,
  message: string = QUEST_ERROR_TEXT[code],
  cap?: CapReached,
): QuestFailure {
  return cap ? { ok: false, code, message, cap } : { ok: false, code, message };
}

/** A refusal as a Server Action returns it: `{ ok: false, code, message, resetsAt? }`. */
export function toActionFailure({ code, message, cap }: QuestFailure): QuestActionFailure {
  return cap ? { ok: false, code, message, resetsAt: cap.resetsAt } : { ok: false, code, message };
}
