import { afterAll, describe, expect, test } from 'bun:test';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  RUN_COMMAND_TIMEOUT_MS,
  RUN_HARNESS_BUDGET_S,
  RUN_SANDBOX_TTL_MS,
  RUN_STALE_MS,
  RUN_TEST_MEMORY_BYTES,
  RUN_TEST_TIMEOUT_S,
  RUN_TIMEOUT_MS,
} from '@/lib/constants';
import { harnessFiles, RUN_DIR } from './harness';
import { parseHarnessStdout } from './parse';

// In production the harness only runs inside E2B. Most tests here check the
// time-budget chain and the generated source. The child-pass token tests run
// the real harness with a local python3 on FIXED test fixtures (never on user
// input), and are skipped when python3 is missing.

describe('time budgets nest', () => {
  test('test limit ≤ harness budget < command limit < run limit < sandbox TTL', () => {
    expect(RUN_TEST_TIMEOUT_S).toBeLessThanOrEqual(RUN_HARNESS_BUDGET_S);
    expect(RUN_HARNESS_BUDGET_S * 1_000).toBeLessThan(RUN_COMMAND_TIMEOUT_MS);
    expect(RUN_COMMAND_TIMEOUT_MS).toBeLessThan(RUN_TIMEOUT_MS);
    expect(RUN_TIMEOUT_MS).toBeLessThan(RUN_SANDBOX_TTL_MS);
  });
  test('a lock goes stale only after the /api/run function can no longer be alive', () => {
    // `export const maxDuration = 30` in app/api/run/route.ts (seconds). It must be a
    // literal there, so it is repeated here; change both together.
    const ROUTE_MAX_DURATION_MS = 30 * 1_000;
    expect(RUN_STALE_MS).toBeGreaterThan(ROUTE_MAX_DURATION_MS);
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

describe.skipIf(!Bun.which('python3'))('child-pass token (runs the harness with python3)', () => {
  const dirs: string[] = [];
  afterAll(() => dirs.forEach((dir) => rmSync(dir, { recursive: true, force: true })));

  const TESTS = [
    { name: 'adds', code: 'assert add(1, 2) == 3' },
    { name: 'adds negatives', code: 'assert add(-1, -2) == -3' },
  ];

  function runHarness(code: string) {
    const dir = mkdtempSync(path.join(tmpdir(), 'sigmorai-harness-'));
    dirs.push(dir);
    const nonce = '@@test-nonce@@';
    for (const file of harnessFiles({ code, tests: TESTS, nonce }, dir)) {
      writeFileSync(file.path, file.data);
    }
    const proc = Bun.spawnSync(['python3', path.join(dir, 'harness.py')], { cwd: dir });
    const names = TESTS.map((t) => t.name);
    const result = parseHarnessStdout(proc.stdout.toString(), nonce, names);
    if (!result) throw new Error(`harness output unreadable: ${proc.stderr.toString()}`);
    return result;
  }

  test('a correct solution passes, and the token never reaches the output', () => {
    const result = runHarness('def add(a, b):\n    print("hi")\n    return a + b\n');
    expect(result.tests.every((t) => t.passed)).toBe(true);
    expect(result.output).toBe('hi\nhi\n');
  });

  test('os._exit(0) fails every test', () => {
    const result = runHarness('import os\nos._exit(0)\n');
    expect(result.tests).toHaveLength(TESTS.length);
    for (const t of result.tests) {
      expect(t).toEqual({ name: t.name, passed: false, detail: 'Exited before the test finished' });
    }
  });

  test('os._exit(0) after printing still fails', () => {
    const result = runHarness('import os, sys\nprint("ok")\nsys.stdout.flush()\nos._exit(0)\n');
    expect(result.tests.some((t) => t.passed)).toBe(false);
  });

  test('a patched sys.exit cannot turn a failed assert into a pass', () => {
    const code = 'import sys\nsys.exit = lambda *a: None\ndef add(a, b):\n    return 0\n';
    expect(runHarness(code).tests.some((t) => t.passed)).toBe(false);
  });

  test('a wrong answer fails with the assertion', () => {
    const result = runHarness('def add(a, b):\n    return a - b\n');
    expect(result.tests[0]).toMatchObject({ passed: false, detail: 'AssertionError' });
  });
});
