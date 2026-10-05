import { describe, expect, test } from 'bun:test';
import {
  RUN_COMMAND_TIMEOUT_MS,
  RUN_HARNESS_BUDGET_S,
  RUN_SANDBOX_TTL_MS,
  RUN_TEST_MEMORY_BYTES,
  RUN_TEST_TIMEOUT_S,
  RUN_TIMEOUT_MS,
} from '@/lib/constants';
import { harnessFiles, RUN_DIR } from './harness';

// The harness itself is Python and only runs inside E2B, so these tests check
// the time-budget chain and the generated source, without a sandbox.

describe('time budgets nest', () => {
  test('test limit ≤ harness budget < command limit < run limit < sandbox TTL', () => {
    expect(RUN_TEST_TIMEOUT_S).toBeLessThanOrEqual(RUN_HARNESS_BUDGET_S);
    expect(RUN_HARNESS_BUDGET_S * 1_000).toBeLessThan(RUN_COMMAND_TIMEOUT_MS);
    expect(RUN_COMMAND_TIMEOUT_MS).toBeLessThan(RUN_TIMEOUT_MS);
    expect(RUN_TIMEOUT_MS).toBeLessThan(RUN_SANDBOX_TTL_MS);
  });
  test('leaves at least 2s of the run for sandbox start', () => {
    expect(RUN_TIMEOUT_MS - RUN_COMMAND_TIMEOUT_MS).toBeGreaterThanOrEqual(2_000);
  });
});

describe('harness source', () => {
  const files = harnessFiles({ code: 'x = 1', tests: [], nonce: 'n' });
  const harness = files.find((f) => f.path === `${RUN_DIR}/harness.py`)?.data ?? '';

  test('bakes in the budget, per-test limit and memory cap', () => {
    expect(harness).toContain(`BUDGET_S = ${RUN_HARNESS_BUDGET_S}`);
    expect(harness).toContain(`TEST_TIMEOUT_S = ${RUN_TEST_TIMEOUT_S}`);
    expect(harness).toContain(`MEMORY_BYTES = ${RUN_TEST_MEMORY_BYTES}`);
  });
  test('caps each test by the time left, and skips tests once it is spent', () => {
    expect(harness).toContain('timeout = min(TEST_TIMEOUT_S, deadline - time.monotonic())');
    expect(harness).toContain("'detail': 'Not run: time limit'");
    expect(harness).toContain('preexec_fn=limit_memory');
  });
  test('learner code and tests are uploaded as data, not spliced into the harness', () => {
    const marker = 'LEARNER_CODE_MARKER';
    const withMarker = harnessFiles({ code: marker, tests: [{ name: marker }], nonce: 'n' });
    for (const file of withMarker) {
      if (file.path.endsWith('harness.py') || file.path.endsWith('child.py')) {
        expect(file.data).not.toContain(marker);
      }
    }
  });
});
