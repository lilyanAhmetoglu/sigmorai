import 'server-only';
import { parseExerciseId } from '@/lib/content/ids';
import { ContentError, loadChallenge } from '@/lib/content/load';
import type { Challenge, RunRequest } from '@/lib/types';

export type RunnableChallenge = Pick<RunRequest, 'language' | 'tests'>;

/**
 * What the Run button may execute: the challenge's language and its VISIBLE
 * tests only, loaded on the server (never sent by the client). Hidden tests
 * and the solution never leave lib/content here; the graded Submit action
 * uses loadGradedChallenge below. Returns null when there is no
 * challenge file (a stub chapter). A broken file throws: that is our bug.
 *
 * The runner PR's wiring checklist is closed by app/api/run/route.ts:
 * content via lib/content (here), the daily run cap and the one-at-a-time
 * lock (lib/grading/sandbox-gate.ts), the tier + order check
 * (lib/grading/open.ts), no HP on Run (Run is capped instead; HP is Submit
 * only), and the child-pass token (lib/runner/e2b/harness.ts).
 */
export async function loadRunnableChallenge(exerciseId: string): Promise<RunnableChallenge | null> {
  const challenge = await loadBuilderChallenge(exerciseId);
  return challenge && { language: challenge.language, tests: challenge.visibleTests };
}

/**
 * What the graded Submit action executes: visible + hidden tests. The split
 * is kept so lib/grading/challenge.ts can strip hidden-test detail. Server-only:
 * the result must never be passed to a client component.
 */
export type GradedChallenge = Pick<Challenge, 'language' | 'visibleTests' | 'hiddenTests'>;

export async function loadGradedChallenge(exerciseId: string): Promise<GradedChallenge | null> {
  const challenge = await loadBuilderChallenge(exerciseId);
  if (!challenge) return null;
  const { language, visibleTests, hiddenTests } = challenge;
  return { language, visibleTests, hiddenTests };
}

/** The full challenge.json of a builder challenge, or null (not builder, or no file). */
async function loadBuilderChallenge(exerciseId: string): Promise<Challenge | null> {
  // Only builder challenges have code. A strategist challenge is a case (case.json).
  const ref = parseExerciseId(exerciseId);
  const isBuilder = (ref?.area === 'chapter' || ref?.area === 'boss') && ref.track === 'builder';
  if (!isBuilder) return null;
  try {
    return await loadChallenge(exerciseId);
  } catch (error) {
    if (error instanceof ContentError && error.code === 'missing') return null;
    throw error;
  }
}
