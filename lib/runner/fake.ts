import { FAKE_RUNNER_MARKERS } from '@/lib/constants';
import type { CodeRunner, RunRequest, RunResult } from '@/lib/types';
import { emptyResult } from './output';

/**
 * Dev/E2E runner. It NEVER executes the code: it only searches the text for a
 * marker comment, so every outcome is deterministic and free.
 *
 *   # sigmorai:fake-fail     → every test fails
 *   # sigmorai:fake-timeout  → never answers; the real timeout path fires
 *   # sigmorai:fake-error    → runner error
 *   (no marker)              → every test passes
 *
 * E2E: run the app with CODE_RUNNER=fake (the default outside Vercel
 * production) and put a marker in the editor to script the result.
 */
export const fakeRunner: CodeRunner = {
  kind: 'fake',
  run(request: RunRequest, signal: AbortSignal): Promise<RunResult> {
    const { code, tests } = request;

    if (code.includes(FAKE_RUNNER_MARKERS.timeout)) {
      // Resolves only when runWithTimeout aborts, like a stuck sandbox.
      return new Promise((resolve) => {
        signal.addEventListener('abort', () => resolve(emptyResult('timeout', '')), {
          once: true,
        });
      });
    }
    if (code.includes(FAKE_RUNNER_MARKERS.error)) {
      return Promise.resolve(emptyResult('error', 'fake runner: scripted error'));
    }

    const passed = !code.includes(FAKE_RUNNER_MARKERS.fail);
    return Promise.resolve({
      status: 'completed',
      tests: tests.map(({ name }) =>
        passed ? { name, passed } : { name, passed, detail: 'AssertionError (fake runner)' },
      ),
      output: `fake runner: ${tests.length} test(s), code not executed\n`,
      truncated: false,
    });
  },
};
