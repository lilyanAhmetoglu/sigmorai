import 'server-only';
import { parseExerciseId } from '@/lib/content/ids';
import { ContentError, loadChallenge } from '@/lib/content/load';
import type { RunRequest } from '@/lib/types';

export type RunnableChallenge = Pick<RunRequest, 'language' | 'tests'>;

/**
 * What the Run button may execute: the challenge's language and its VISIBLE
 * tests only, loaded on the server (never sent by the client). Hidden tests
 * and the solution never leave lib/content here; the graded Submit action
 * (SIG-18 Phase B) adds hiddenTests itself. Returns null when there is no
 * challenge file (a stub chapter). A broken file throws: that is our bug.
 *
 * The runner PR's wiring checklist is closed by app/api/run/route.ts:
 * content via lib/content (here), the daily run cap and the one-at-a-time
 * lock (lib/grading/sandbox-gate.ts), the tier + order check
 * (lib/grading/open.ts), no HP on Run (Run is capped instead; HP is Submit
 * only), and the child-pass token (lib/runner/e2b/harness.ts).
 */
export async function loadRunnableChallenge(exerciseId: string): Promise<RunnableChallenge | null> {
  // Only builder challenges have code. A strategist challenge is a case (case.json).
  const ref = parseExerciseId(exerciseId);
  const isBuilder = (ref?.area === 'chapter' || ref?.area === 'boss') && ref.track === 'builder';
  if (!isBuilder) return null;
  try {
    const { language, visibleTests } = await loadChallenge(exerciseId);
    return { language, tests: visibleTests };
  } catch (error) {
    if (error instanceof ContentError && error.code === 'missing') return null;
    throw error;
  }
}
