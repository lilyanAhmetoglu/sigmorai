import { describe, expect, test } from 'bun:test';
import { FAKE_RUNNER_MARKERS, RUN_OUTPUT_MAX_CHARS } from '@/lib/constants';
import type { CodeRunner, RunRequest, RunResult } from '@/lib/types';
import { createRunner, resolveRunnerKind } from './create';
import { parseHarnessStdout } from './e2b/parse';
import { fakeRunner } from './fake';
import { capText } from './output';
import { ERROR_MESSAGE, runWithTimeout, TIMEOUT_MESSAGE } from './timeout';

const request = (code: string): RunRequest => ({
  language: 'python',
  code,
  tests: [
    { name: 'adds two numbers', code: 'assert add(1, 2) == 3' },
    { name: 'adds negatives', code: 'assert add(-1, -2) == -3' },
  ],
});

describe('runner selection', () => {
  test('defaults to fake outside production', () => {
    expect(resolveRunnerKind({})).toBe('fake');
    expect(resolveRunnerKind({ VERCEL_ENV: 'preview' })).toBe('fake');
  });
  test('defaults to e2b on Vercel production', () => {
    expect(resolveRunnerKind({ VERCEL_ENV: 'production' })).toBe('e2b');
  });
  test('honours CODE_RUNNER', () => {
    expect(resolveRunnerKind({ CODE_RUNNER: 'e2b' })).toBe('e2b');
    expect(resolveRunnerKind({ CODE_RUNNER: ' fake ' })).toBe('fake');
  });
  test('refuses an unknown runner', () => {
    expect(() => resolveRunnerKind({ CODE_RUNNER: 'judge0' })).toThrow();
  });
  test('refuses the fake runner in production', () => {
    expect(() => resolveRunnerKind({ CODE_RUNNER: 'fake', VERCEL_ENV: 'production' })).toThrow();
  });
  test('e2b needs an API key, and builds without a network call', () => {
    expect(() => createRunner({ CODE_RUNNER: 'e2b' })).toThrow('E2B_API_KEY');
    expect(createRunner({ CODE_RUNNER: 'e2b', E2B_API_KEY: 'e2b_test' }).kind).toBe('e2b');
    expect(createRunner({}).kind).toBe('fake');
  });
});

describe('fake runner', () => {
  const signal = new AbortController().signal;

  test('passes every test without a marker, and never runs the code', async () => {
    // This code would throw if executed; the fake runner only reads the text.
    const result = await fakeRunner.run(request('raise SystemExit(1)'), signal);
    expect(result.status).toBe('completed');
    expect(result.tests.map((t) => t.passed)).toEqual([true, true]);
    expect(result.output).toContain('code not executed');
  });
  test('fails every test with the fail marker', async () => {
    const result = await fakeRunner.run(request(`# ${FAKE_RUNNER_MARKERS.fail}`), signal);
    expect(result.tests.every((t) => !t.passed && t.detail)).toBe(true);
  });
  test('returns an error with the error marker', async () => {
    const result = await fakeRunner.run(request(`# ${FAKE_RUNNER_MARKERS.error}`), signal);
    expect(result).toMatchObject({ status: 'error', tests: [] });
  });
  test('the timeout marker hits the real timeout path', async () => {
    const code = `# ${FAKE_RUNNER_MARKERS.timeout}`;
    const result = await runWithTimeout(fakeRunner, request(code), 20);
    expect(result).toEqual({
      status: 'timeout',
      tests: [],
      output: TIMEOUT_MESSAGE,
      truncated: false,
    });
  });
});

describe('runWithTimeout', () => {
  test('returns timeout and aborts a slow runner', async () => {
    let aborted = false;
    const slow: CodeRunner = {
      kind: 'fake',
      run: (_req, signal) =>
        new Promise<RunResult>((_resolve, reject) => {
          signal.addEventListener('abort', () => {
            aborted = true;
            reject(new Error('aborted'));
          });
        }),
    };
    const started = Date.now();
    const result = await runWithTimeout(slow, request(''), 30);
    expect(result.status).toBe('timeout');
    expect(Date.now() - started).toBeLessThan(1_000);
    expect(aborted).toBe(true);
  });
  test('a thrown runner error becomes a generic error result', async () => {
    const broken: CodeRunner = {
      kind: 'e2b',
      run: () => Promise.reject(new Error('secret detail')),
    };
    const result = await runWithTimeout(broken, request(''), 1_000);
    expect(result).toEqual({ status: 'error', tests: [], output: ERROR_MESSAGE, truncated: false });
  });
  test('a malformed runner result is rejected by Zod', async () => {
    const liar = {
      kind: 'fake',
      run: () => Promise.resolve({ status: 'passed', xp: 150 }),
    } as unknown as CodeRunner;
    const result = await runWithTimeout(liar, request(''), 1_000);
    expect(result.status).toBe('error');
  });
});

describe('output cap', () => {
  test('keeps short text, cuts long text', () => {
    expect(capText('hi')).toEqual({ text: 'hi', truncated: false });
    const long = capText('x'.repeat(RUN_OUTPUT_MAX_CHARS + 10));
    expect(long.text.length).toBe(RUN_OUTPUT_MAX_CHARS);
    expect(long.truncated).toBe(true);
  });
});

describe('harness output parsing', () => {
  const nonce = '@@sigmorai-test@@';
  const names = ['adds two numbers', 'adds negatives'];
  const line = (body: unknown) => `${nonce}${JSON.stringify(body)}`;
  const good = {
    tests: [
      { name: 'adds two numbers', passed: true },
      { name: 'adds negatives', passed: false, detail: 'AssertionError' },
    ],
    output: 'hello\n',
  };

  test('parses the nonce line', () => {
    const result = parseHarnessStdout(`noise\n${line(good)}\n`, nonce, names);
    expect(result).toEqual({ status: 'completed', ...good, truncated: false });
  });
  test('ignores a forged line without the nonce', () => {
    expect(
      parseHarnessStdout(`@@sigmorai-guess@@${JSON.stringify(good)}`, nonce, names),
    ).toBeNull();
  });
  test('rejects bad JSON, a bad shape, or test names we did not send', () => {
    expect(parseHarnessStdout(`${nonce}{oops`, nonce, names)).toBeNull();
    expect(parseHarnessStdout(line({ tests: 'all passed' }), nonce, names)).toBeNull();
    expect(
      parseHarnessStdout(line({ ...good, tests: good.tests.slice(0, 1) }), nonce, names),
    ).toBeNull();
  });
  test('caps long output', () => {
    const big = { ...good, output: 'y'.repeat(RUN_OUTPUT_MAX_CHARS + 1) };
    const result = parseHarnessStdout(line(big), nonce, names);
    expect(result?.truncated).toBe(true);
    expect(result?.output.length).toBe(RUN_OUTPUT_MAX_CHARS);
  });
});
