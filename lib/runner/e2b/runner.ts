import 'server-only';
import { randomUUID } from 'node:crypto';
import { Sandbox } from 'e2b';
import { E2B_TEMPLATE, RUN_COMMAND_TIMEOUT_MS, RUN_SANDBOX_TTL_MS } from '@/lib/constants';
import type { CodeRunner, RunRequest, RunResult } from '@/lib/types';
import { emptyResult } from '../output';
import { ERROR_MESSAGE } from '../timeout';
import { HARNESS_COMMAND, harnessFiles, RUN_DIR } from './harness';
import { parseHarnessStdout } from './parse';

/**
 * Runs learner code in a fresh E2B sandbox (SDK `e2b` v2: Sandbox.create,
 * files.write, commands.run, kill). One sandbox per run, no internet, always
 * killed in `finally`; RUN_SANDBOX_TTL_MS makes E2B kill it even if we can't.
 * Cost: billed per second of sandbox life (see the SIG-17 notes).
 */
export function createE2bRunner(apiKey: string): CodeRunner {
  return {
    kind: 'e2b',
    async run(request: RunRequest, signal: AbortSignal): Promise<RunResult> {
      const sandbox = await Sandbox.create(E2B_TEMPLATE, {
        apiKey,
        timeoutMs: RUN_SANDBOX_TTL_MS,
        allowInternetAccess: false,
        signal,
      });
      try {
        const nonce = `@@sigmorai-${randomUUID()}@@`;
        await sandbox.files.write(
          harnessFiles({ code: request.code, tests: request.tests, nonce }),
          { signal },
        );
        // A non-zero exit throws CommandExitError: the harness itself broke.
        // RUN_COMMAND_TIMEOUT_MS < RUN_TIMEOUT_MS, so the outer timer stays a safety net.
        const result = await sandbox.commands.run(HARNESS_COMMAND, {
          cwd: RUN_DIR,
          timeoutMs: RUN_COMMAND_TIMEOUT_MS,
          signal,
        });
        const names = request.tests.map((t) => t.name);
        const parsed = parseHarnessStdout(result.stdout, nonce, names);
        if (parsed) return parsed;
        console.error('[runner:e2b] harness output missing or malformed');
        return emptyResult('error', ERROR_MESSAGE);
      } finally {
        await sandbox.kill().catch((error: unknown) => {
          console.error('[runner:e2b] kill failed; TTL will reap it', error);
        });
      }
    },
  };
}
