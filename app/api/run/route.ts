import { auth } from '@clerk/nextjs/server';
import { runCode } from '@/lib/runner';
import { loadRunnableChallenge } from '@/lib/runner/load-tests';
import { ERROR_MESSAGE } from '@/lib/runner/timeout';
import { checkRunBody, readCappedText } from '@/lib/runner/validate';

/**
 * Seconds. Must be a literal (read at build time). Covers RUN_TIMEOUT_MS (15s)
 * plus sandbox start and network slack.
 */
export const maxDuration = 30;

/**
 * POST /api/run: the "Run" button. Runs the learner's code against the
 * challenge's VISIBLE tests and returns per-test pass/fail + trimmed output.
 * It never grades, never writes xp_events and never touches HP: that is the
 * Submit Server Action (SIG-18). Tests come from the server, not the body.
 */
export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: 'Sign in to run code' }, { status: 401 });

  const check = checkRunBody(await readCappedText(request));
  if (!check.ok) return Response.json({ error: check.error }, { status: check.status });

  // TODO(SIG-18): rate-limit per user and re-check the tier/open state here
  // (curriculum spec: TIER_LOCKED → no runner call).
  const challenge = await loadRunnableChallenge(check.body.exerciseId);
  if (!challenge) return Response.json({ error: 'Challenge not found' }, { status: 404 });

  try {
    const result = await runCode({
      language: challenge.language,
      code: check.body.code,
      tests: challenge.tests,
    });
    return Response.json(result);
  } catch (error) {
    // Bad CODE_RUNNER / E2B_API_KEY config: answer JSON, not an HTML 500.
    console.error('[api/run] runner setup failed', error);
    return Response.json({ error: ERROR_MESSAGE }, { status: 500 });
  }
}
