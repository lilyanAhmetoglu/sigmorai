import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { isOnboarded } from '@/lib/data/user';
import { questFailure } from '@/lib/grading/failure';
import { checkOpen } from '@/lib/grading/open';
import type { QuestFailure } from '@/lib/types';
import { openSandbox, releaseSandbox, type SandboxClaim } from '@/lib/grading/sandbox-gate';
import { runCode } from '@/lib/runner';
import { loadRunnableChallenge, type RunnableChallenge } from '@/lib/runner/load-tests';
import { logSandboxCall, type SandboxCallStatus } from '@/lib/runner/log';
import { runErrorResponse } from '@/lib/runner/respond';
import { checkRunBody, readCappedText } from '@/lib/runner/validate';

/**
 * Seconds. Must be a literal (read at build time). Covers RUN_TIMEOUT_MS (15s)
 * plus sandbox start and network slack. RUN_STALE_MS must stay above it
 * (lib/runner/e2b/harness.test.ts).
 */
export const maxDuration = 30;

/** The checks before the runner: DB reads, the content file, the gate. */
type Prepared =
  | { ok: true; challenge: RunnableChallenge; claim: Extract<SandboxClaim, { ok: true }> }
  | { ok: false; response: Response };

async function prepare(userId: string, exerciseId: string): Promise<Prepared> {
  const refuse = (failure: QuestFailure, status?: number) => ({
    ok: false as const,
    response: runErrorResponse(failure, status),
  });

  const open = await checkOpen(db, userId, exerciseId);
  if (!open.ok) return refuse(open, open.code === 'INVALID_INPUT' ? 404 : undefined);

  // Loaded before the gate, so a missing or broken file never uses up a run.
  const challenge = await loadRunnableChallenge(exerciseId);
  if (!challenge) return refuse(questFailure('INVALID_INPUT'), 404);

  const claim = await openSandbox(userId, 'run');
  if (!claim.ok) return refuse(claim);
  return { ok: true, challenge, claim };
}

/**
 * POST /api/run: the "Run" button. Runs the learner's code against the
 * challenge's VISIBLE tests and returns per-test pass/fail + trimmed output.
 * It never grades, never writes xp_events, submissions or HP: that is the
 * Submit Server Action. Tests come from the server, not the body.
 *
 * auth → onboarded → body → open check → sandbox gate (cap + lock) →
 * runner → release the lock → one [runner] log line.
 * A DB or content error before the runner answers JSON RUNNER_FAILED (502).
 */
export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return runErrorResponse(questFailure('UNAUTHENTICATED'));

  try {
    if (!(await isOnboarded(userId))) return runErrorResponse(questFailure('NOT_ONBOARDED'));

    const check = checkRunBody(await readCappedText(request));
    if (!check.ok) {
      return runErrorResponse(questFailure('INVALID_INPUT', check.error), check.status);
    }
    const prepared = await prepare(userId, check.body.exerciseId);
    if (!prepared.ok) return prepared.response;

    const { challenge, claim } = prepared;
    const { exerciseId, code } = check.body;
    const started = performance.now();
    let status: SandboxCallStatus = 'setup-failed';
    try {
      const result = await runCode({ ...challenge, code });
      status = result.status;
      return Response.json(result);
    } finally {
      await releaseSandbox(userId, claim.lockedAt);
      logSandboxCall({ userId, exerciseId, kind: 'run', status, ms: performance.now() - started });
    }
  } catch (error) {
    // DB down, a broken content file, or a bad CODE_RUNNER / E2B_API_KEY
    // config: answer JSON, not an HTML 500.
    console.error('[api/run] failed before a result', error);
    return runErrorResponse(questFailure('RUNNER_FAILED'));
  }
}
