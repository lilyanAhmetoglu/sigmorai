import type { RunResult, SandboxKind } from '@/lib/types';

/** `setup-failed`: the runner could not start (bad CODE_RUNNER / E2B_API_KEY). */
export type SandboxCallStatus = RunResult['status'] | 'setup-failed';

/**
 * The cost log: one line per sandbox call (quest-actions spec → AI and cost).
 * Never the code, the output or test names. Grep `[runner]` to count calls.
 */
export function logSandboxCall(call: {
  userId: string;
  exerciseId: string;
  kind: SandboxKind;
  status: SandboxCallStatus;
  ms: number;
}): void {
  const { userId, exerciseId, kind, status, ms } = call;
  console.info(
    `[runner] user=${userId} exercise=${exerciseId} kind=${kind} status=${status} ms=${Math.round(ms)}`,
  );
}
