import { QUEST_ERROR_TEXT, RUN_TIMEOUT_MS } from '@/lib/constants';
import { type CodeRunner, type RunRequest, type RunResult, RunResultSchema } from '@/lib/types';
import { emptyResult } from './output';

export const TIMEOUT_MESSAGE = `Stopped: the run took longer than ${RUN_TIMEOUT_MS / 1000} seconds.`;
/** One string for one event: the runner broke (also the RUNNER_FAILED quest error). */
export const ERROR_MESSAGE = QUEST_ERROR_TEXT.RUNNER_FAILED;

/**
 * Runs `request` with a hard wall-clock limit. On timeout it aborts the
 * runner's signal (the runner kills its sandbox) and returns `timeout` at once.
 * Whatever a runner returns is Zod-parsed; a bad shape becomes `error`.
 */
export async function runWithTimeout(
  runner: CodeRunner,
  request: RunRequest,
  timeoutMs: number = RUN_TIMEOUT_MS,
): Promise<RunResult> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;

  const timedOut = new Promise<RunResult>((resolve) => {
    timer = setTimeout(() => {
      // Resolve first, so the race picks `timeout` over whatever abort triggers.
      resolve(emptyResult('timeout', TIMEOUT_MESSAGE));
      controller.abort();
    }, timeoutMs);
  });

  const run = runner.run(request, controller.signal);
  // After a timeout nobody awaits `run`; keep its late rejection from going unhandled.
  run.catch(() => {});

  try {
    const raw = await Promise.race([run, timedOut]);
    const parsed = RunResultSchema.safeParse(raw);
    if (parsed.success) return parsed.data;
    console.error('[runner] bad result shape', runner.kind, parsed.error.issues);
    return emptyResult('error', ERROR_MESSAGE);
  } catch (error) {
    console.error('[runner] run failed', runner.kind, error);
    return emptyResult('error', ERROR_MESSAGE);
  } finally {
    clearTimeout(timer);
  }
}
