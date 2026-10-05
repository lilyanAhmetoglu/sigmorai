import 'server-only';
import type { RunRequest, RunResult } from '@/lib/types';
import { createRunner } from './create';
import { runWithTimeout } from './timeout';

/**
 * The only way to run learner code. Picks the runner from env, enforces the
 * hard timeout, and returns a Zod-checked result. Never grades and never
 * writes XP: grading is lib/grading (SIG-18).
 */
export function runCode(request: RunRequest): Promise<RunResult> {
  return runWithTimeout(createRunner(), request);
}

export { createRunner } from './create';
