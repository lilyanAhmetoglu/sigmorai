import 'server-only';
import type { RunnerLanguage, RunnerTest } from '@/lib/types';

export type RunnableChallenge = { language: RunnerLanguage; tests: RunnerTest[] };

/**
 * The visible tests for a challenge, loaded on the server (never sent by the
 * client). Returns null when the challenge is unknown.
 *
 * TODO(SIG-17 → content wiring): lib/content (feat/content-loaders, PR #15)
 * is not merged yet. Until it is, every id is "not found", so /api/run
 * answers 404 and no sandbox is started. The wiring PR must:
 *   [ ] load challenge.json via lib/content and return `language` + `visibleTests` only
 *   [ ] (a) per-user daily run cap, stored in Postgres, checked before the runner
 *   [ ] (b) re-check the tier / open state: TIER_LOCKED → no runner call
 *   [ ] (c) apply the HP rule from the Run-vs-Submit spec (Run must not be a free Submit)
 *   [ ] (d) SIG-18: child-pass token in harness.py, so os._exit(0) can't pass a test
 * The graded Submit path (SIG-18 Server Action) adds `hiddenTests`; this
 * "Run" path stays visible-tests-only.
 */
export async function loadRunnableChallenge(exerciseId: string): Promise<RunnableChallenge | null> {
  void exerciseId;
  return null;
}
