import { z } from 'zod';
import { RUN_CODE_MAX_CHARS, RUNNER_KINDS } from '@/lib/constants';
import type { ChallengeLanguage, ChallengeTest } from './content';
import { ExerciseIdSchema } from './exercise';

export type RunnerKind = (typeof RUNNER_KINDS)[number];

/** What a runner gets. Built on the server from challenge.json, never from a client body. */
export type RunRequest = {
  language: ChallengeLanguage;
  code: string;
  tests: ChallengeTest[];
};

/** One test outcome. Maps onto the TestResult component (name / status / detail). */
export const RunTestResultSchema = z.object({
  name: z.string(),
  passed: z.boolean(),
  /** Assertion or error message, trimmed. */
  detail: z.string().optional(),
});
export type RunTestResult = z.infer<typeof RunTestResultSchema>;

/**
 * `completed`: the tests ran (each one passed or failed).
 * `timeout`: the wall-clock limit hit; no test results.
 * `error`: the sandbox or harness failed; not the learner's fault.
 */
export const RunResultSchema = z.object({
  status: z.enum(['completed', 'timeout', 'error']),
  tests: z.array(RunTestResultSchema),
  /** Learner-visible console output, capped. */
  output: z.string(),
  truncated: z.boolean(),
});
export type RunResult = z.infer<typeof RunResultSchema>;

/** POST /api/run body. Tests are never sent by the client; the server loads them. */
export const RunBodySchema = z
  .object({
    exerciseId: ExerciseIdSchema.refine((id) => id.endsWith('/challenge'), {
      message: 'Only challenges can be run',
    }),
    code: z.string().max(RUN_CODE_MAX_CHARS),
  })
  .strict();
export type RunBody = z.infer<typeof RunBodySchema>;

/**
 * A pluggable code runner (lib/runner). `run` must stop work when `signal`
 * aborts; lib/runner/timeout.ts aborts it at RUN_TIMEOUT_MS.
 */
export interface CodeRunner {
  readonly kind: RunnerKind;
  run(request: RunRequest, signal: AbortSignal): Promise<RunResult>;
}
