import 'server-only';
import { RUNNER_KINDS } from '@/lib/constants';
import type { CodeRunner, RunnerKind } from '@/lib/types';
import { createE2bRunner } from './e2b/runner';
import { fakeRunner } from './fake';

/** Reads CODE_RUNNER, E2B_API_KEY and VERCEL_ENV. */
type RunnerEnv = Record<string, string | undefined>;

/**
 * Picks the runner from CODE_RUNNER. Unset → `fake`, except on Vercel
 * production, where it is `e2b`. The fake runner is refused in production,
 * so a missing env var can't silently pass every challenge.
 */
export function resolveRunnerKind(env: RunnerEnv): RunnerKind {
  const isProduction = env.VERCEL_ENV === 'production';
  const raw = env.CODE_RUNNER?.trim() || (isProduction ? 'e2b' : 'fake');
  const kind = RUNNER_KINDS.find((k) => k === raw);
  if (!kind) throw new Error(`CODE_RUNNER must be one of ${RUNNER_KINDS.join(', ')}`);
  if (kind === 'fake' && isProduction)
    throw new Error('The fake runner is not allowed in production');
  return kind;
}

/** Builds the runner for this environment. Throws on a bad config (fail closed). */
export function createRunner(env: RunnerEnv = process.env): CodeRunner {
  if (resolveRunnerKind(env) === 'fake') return fakeRunner;
  const apiKey = env.E2B_API_KEY?.trim();
  if (!apiKey) throw new Error('E2B_API_KEY is required when CODE_RUNNER=e2b');
  return createE2bRunner(apiKey);
}
