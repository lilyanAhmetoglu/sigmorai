import type { QuestErrorCode, QuestFailure, RunErrorBody } from '@/lib/types';

/** HTTP status per code on /api/run (quest-actions spec → API contract). */
const RUN_ERROR_STATUS: Record<QuestErrorCode, number> = {
  UNAUTHENTICATED: 401,
  NOT_ONBOARDED: 403,
  INVALID_INPUT: 400,
  TIER_LOCKED: 403,
  NOT_OPEN: 403,
  // Run never spends HP; listed so every code has a status.
  NO_HP: 403,
  CAP_REACHED: 429,
  RUN_IN_PROGRESS: 409,
  RUNNER_FAILED: 502,
};

/**
 * A refused /api/run as JSON: `{ error, code, resetsAt?, cap? }`. `status`
 * overrides the default (INVALID_INPUT is 400, 404 or 413).
 */
export function runErrorResponse(
  failure: Pick<QuestFailure, 'code' | 'message' | 'cap'>,
  status: number = RUN_ERROR_STATUS[failure.code],
): Response {
  const body: RunErrorBody = { error: failure.message, code: failure.code };
  if (failure.cap) {
    body.resetsAt = failure.cap.resetsAt;
    body.cap = failure.cap;
  }
  return Response.json(body, { status });
}
