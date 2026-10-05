import { TestResult } from '@/components/test-result';
import type { QuestTestRow, TestStatus } from '@/lib/types';

type Props = {
  /** Graded rows, or the visible test names before any run. */
  tests: readonly (QuestTestRow | { name: string })[];
  running: boolean;
};

const statusOf = (test: QuestTestRow | { name: string }, running: boolean): TestStatus => {
  if (running) return 'running';
  if (!('passed' in test)) return 'pending';
  return test.passed ? 'pass' : 'fail';
};

/** The test rows: PASS / FAIL word tags, never colour only. Hidden tests carry no detail. */
export function TestList({ tests, running }: Props) {
  return (
    <ul className="quest-test-list">
      {tests.map((test, i) => (
        <li key={`${i}-${test.name}`}>
          <TestResult
            name={test.name}
            status={statusOf(test, running)}
            detail={'detail' in test ? test.detail : undefined}
          />
        </li>
      ))}
    </ul>
  );
}
