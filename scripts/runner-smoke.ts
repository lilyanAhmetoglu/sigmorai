// `bun run runner:smoke`: ONE real E2B run with a trivial passing challenge,
// to check the template, the harness and the API key end to end.
// It costs money (one sandbox for a few seconds) — run it by hand only, never in CI.
// Needs E2B_API_KEY in .env.local (Bun loads it). CODE_RUNNER=e2b is set by the script entry.
import { runCode } from '@/lib/runner';

if (process.env.CODE_RUNNER !== 'e2b') {
  console.error('Set CODE_RUNNER=e2b (use `bun run runner:smoke`).');
  process.exit(1);
}

const result = await runCode({
  language: 'python',
  code: 'def add(a, b):\n    print("hello from the sandbox")\n    return a + b\n',
  tests: [{ name: 'adds two numbers', code: 'assert add(1, 2) == 3' }],
});

console.log(JSON.stringify(result, null, 2));
const ok = result.status === 'completed' && result.tests.every((t) => t.passed);
console.log(ok ? 'SMOKE OK' : 'SMOKE FAILED');
process.exit(ok ? 0 : 1);
