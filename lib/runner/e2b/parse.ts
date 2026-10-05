import { z } from 'zod';
import { type RunResult, RunTestResultSchema } from '@/lib/types';
import { capText } from '../output';

/** The one JSON line harness.py prints after its nonce. */
const HarnessOutputSchema = z.object({
  tests: z.array(RunTestResultSchema),
  output: z.string(),
});

/**
 * Finds the nonce-prefixed line in the sandbox stdout and Zod-parses it.
 * Returns null when it is missing or malformed (the caller reports `error`).
 * Test names come back from the sandbox, so they must match what we sent.
 */
export function parseHarnessStdout(
  stdout: string,
  nonce: string,
  expectedNames: string[],
): RunResult | null {
  const line = stdout.split('\n').find((l) => l.startsWith(nonce));
  if (!line) return null;

  let json: unknown;
  try {
    json = JSON.parse(line.slice(nonce.length));
  } catch {
    return null;
  }
  const parsed = HarnessOutputSchema.safeParse(json);
  if (!parsed.success) return null;

  const names = parsed.data.tests.map((t) => t.name);
  if (names.length !== expectedNames.length || names.some((n, i) => n !== expectedNames[i])) {
    return null;
  }

  const tests = parsed.data.tests.map((t) =>
    t.detail === undefined ? t : { ...t, detail: capText(t.detail).text },
  );
  const { text, truncated } = capText(parsed.data.output);
  return { status: 'completed', tests, output: text, truncated };
}
