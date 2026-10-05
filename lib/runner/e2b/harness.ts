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
 *   Any exception (AssertionError, SyntaxError, SystemExit…) → fail.
 * Child-pass token: the parent writes a fresh random token to the child's
 * stdin; the child reads it and closes stdin BEFORE learner code runs, and
 * prints it as the last stdout line only AFTER the test code finished.
 * Pass = exit 0 AND that last line is the token. So `os._exit(0)` in learner
 * code fails ("Exited before the test finished"). The parent strips the line
 * before the output reaches the learner. Honest limit: learner code shares
 * the child process, so frame or gc introspection could still find the token.
 * Each child gets min(RUN_TEST_TIMEOUT_S, time left in RUN_HARNESS_BUDGET_S)
 * and an RLIMIT_AS memory cap. Tests after the budget is spent are marked
 * "Not run: time limit" without starting, so slow learner code always gets
 * per-test results, never the outer "runner failed" error.
 * The parent prints ONE result line, prefixed with a per-run nonce that it
 * reads from a file and deletes before any learner code starts. The child's
 * stdout goes to a pipe, so learner code cannot print a fake result line.
 */

export const RUN_DIR = '/home/user/sigmorai-run';

const CHILD_PY = `import json, os, sys

def main():
    token = sys.stdin.readline().strip()
    sys.stdin.close()
    write = os.write  # saved before learner code can patch os
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
        return  # sys.exit may be patched by learner code: still no token
    sys.stdout.flush()
    write(1, ('\\n' + token + '\\n').encode())

main()
`;

const HARNESS_PY = `import json, os, resource, secrets, subprocess, sys, time

# The folder this file was uploaded to (RUN_DIR in E2B).
RUN_DIR = os.path.dirname(os.path.abspath(__file__))
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
        token = secrets.token_hex(16)
        suffix = '\\n' + token + '\\n'
        try:
            proc = subprocess.run(
                [sys.executable, '-I', os.path.join(RUN_DIR, 'child.py'), str(index)],
                cwd=RUN_DIR, input=token + '\\n', capture_output=True, text=True,
                timeout=timeout, preexec_fn=limit_memory,
            )
            stdout = text(proc.stdout)
            finished = stdout.endswith(suffix)
            if finished:
                stdout = stdout[:-len(suffix)]
            passed = proc.returncode == 0 and finished
            if passed:
                detail = None
            elif proc.returncode == 0:
                detail = 'Exited before the test finished'
            else:
                detail = last_line(proc.stderr) or 'Exited with code %d' % proc.returncode
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
export function harnessFiles(
  input: { code: string; tests: unknown; nonce: string },
  dir: string = RUN_DIR,
) {
  return [
    { path: `${dir}/harness.py`, data: HARNESS_PY },
    { path: `${dir}/child.py`, data: CHILD_PY },
    { path: `${dir}/solution.py`, data: input.code },
    { path: `${dir}/tests.json`, data: JSON.stringify(input.tests) },
    { path: `${dir}/nonce`, data: input.nonce },
  ];
}

export const HARNESS_COMMAND = `python3 ${RUN_DIR}/harness.py`;
