import {
  RUN_HARNESS_BUDGET_S,
  RUN_OUTPUT_MAX_CHARS,
  RUN_TEST_MEMORY_BYTES,
  RUN_TEST_TIMEOUT_S,
} from '@/lib/constants';

/**
 * Python files written INTO the E2B sandbox. Nothing here runs on our server:
 * these are strings we upload, and `python3` runs them inside the sandbox.
 *
 * harness.py (parent) runs each test in a fresh child process:
 *   child.py <i> = the learner's solution.py, then test i, in one namespace.
 *   exit 0 → pass; any exception (AssertionError, SyntaxError, SystemExit…) → fail.
 * Each child gets min(RUN_TEST_TIMEOUT_S, time left in RUN_HARNESS_BUDGET_S)
 * and an RLIMIT_AS memory cap. Tests after the budget is spent are marked
 * "Not run: time limit" without starting, so slow learner code always gets
 * per-test results, never the outer "runner failed" error.
 * The parent prints ONE result line, prefixed with a per-run nonce that it
 * reads from a file and deletes before any learner code starts. The child's
 * stdout goes to a pipe, so learner code cannot print a fake result line.
 */

export const RUN_DIR = '/home/user/sigmorai-run';

const CHILD_PY = `import json, sys

def main():
    index = int(sys.argv[1])
    with open('tests.json') as f:
        test = json.load(f)[index]
    with open('solution.py') as f:
        source = f.read()
    namespace = {'__name__': 'solution'}
    try:
        exec(compile(source, 'solution.py', 'exec'), namespace)
        exec(compile(test['code'], 'test: ' + test['name'], 'exec'), namespace)
    except BaseException as error:
        message = str(error)
        print(type(error).__name__ + (': ' + message if message else ''), file=sys.stderr)
        sys.exit(1)

main()
`;

const HARNESS_PY = `import json, os, resource, subprocess, sys, time

RUN_DIR = ${JSON.stringify(RUN_DIR)}
TEST_TIMEOUT_S = ${RUN_TEST_TIMEOUT_S}
BUDGET_S = ${RUN_HARNESS_BUDGET_S}
MEMORY_BYTES = ${RUN_TEST_MEMORY_BYTES}
MAX_CHARS = ${RUN_OUTPUT_MAX_CHARS}

def limit_memory():
    # Linux (E2B) applies it. If an OS refuses (macOS does), run without it
    # rather than fail every test; the sandbox's own RAM is the backstop.
    try:
        resource.setrlimit(resource.RLIMIT_AS, (MEMORY_BYTES, MEMORY_BYTES))
    except (ValueError, OSError):
        pass

def text(value):
    if value is None:
        return ''
    if isinstance(value, bytes):
        return value.decode('utf-8', 'replace')
    return value

def last_line(value):
    lines = [line for line in text(value).strip().splitlines() if line.strip()]
    return lines[-1][:MAX_CHARS] if lines else ''

def main():
    deadline = time.monotonic() + BUDGET_S
    nonce_path = os.path.join(RUN_DIR, 'nonce')
    with open(nonce_path) as f:
        nonce = f.read().strip()
    os.remove(nonce_path)
    with open(os.path.join(RUN_DIR, 'tests.json')) as f:
        tests = json.load(f)

    results, output = [], ''
    for index, test in enumerate(tests):
        timeout = min(TEST_TIMEOUT_S, deadline - time.monotonic())
        if timeout <= 0:
            results.append({'name': test['name'], 'passed': False, 'detail': 'Not run: time limit'})
            continue
        try:
            proc = subprocess.run(
                [sys.executable, '-I', os.path.join(RUN_DIR, 'child.py'), str(index)],
                cwd=RUN_DIR, capture_output=True, text=True, timeout=timeout,
                preexec_fn=limit_memory,
            )
            passed = proc.returncode == 0
            detail = None if passed else (last_line(proc.stderr) or 'Exited with code %d' % proc.returncode)
            stdout = proc.stdout
        except subprocess.TimeoutExpired as error:
            passed, detail, stdout = False, 'Timed out after %.1fs' % timeout, error.stdout
        result = {'name': test['name'], 'passed': passed}
        if detail:
            result['detail'] = detail
        results.append(result)
        if len(output) < MAX_CHARS:
            output += text(stdout)[:MAX_CHARS]

    print(nonce + json.dumps({'tests': results, 'output': output[:MAX_CHARS + 1]}))

main()
`;

/** Files to upload for one run. `solution` and test code go in as data, never as harness source. */
export function harnessFiles(input: { code: string; tests: unknown; nonce: string }) {
  return [
    { path: `${RUN_DIR}/harness.py`, data: HARNESS_PY },
    { path: `${RUN_DIR}/child.py`, data: CHILD_PY },
    { path: `${RUN_DIR}/solution.py`, data: input.code },
    { path: `${RUN_DIR}/tests.json`, data: JSON.stringify(input.tests) },
    { path: `${RUN_DIR}/nonce`, data: input.nonce },
  ];
}

export const HARNESS_COMMAND = `python3 ${RUN_DIR}/harness.py`;
