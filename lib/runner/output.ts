import { RUN_OUTPUT_MAX_CHARS } from '@/lib/constants';
import type { RunResult } from '@/lib/types';

/** Keeps the first `max` characters. `truncated` says whether any were cut. */
export function capText(text: string, max: number = RUN_OUTPUT_MAX_CHARS) {
  if (text.length <= max) return { text, truncated: false };
  return { text: text.slice(0, max), truncated: true };
}

/** A run with no test results: the sandbox timed out or broke. */
export function emptyResult(status: 'timeout' | 'error', output: string): RunResult {
  return { status, tests: [], output, truncated: false };
}
