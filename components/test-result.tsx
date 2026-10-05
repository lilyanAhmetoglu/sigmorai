import type { ComponentProps } from 'react';
import { TEST_STATUS_TEXT } from '@/lib/constants';
import type { TestStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

type Props = ComponentProps<'div'> & {
  /** Test name, e.g. "returns tool_use block". */
  name: string;
  status?: TestStatus;
  /** Expected-vs-got line, shown under the name. */
  detail?: string;
};

/**
 * One test case row in the challenge runner. Status is a word tag (PASS/FAIL),
 * never colour alone; screen readers hear the full word. Styles: test-result.css.
 */
export function TestResult({ name, status = 'pending', detail, className, ...rest }: Props) {
  const { tag, label } = TEST_STATUS_TEXT[status];

  return (
    <div className={cn('test-result', className)} data-status={status} {...rest}>
      <span className="test-result-tag" aria-hidden="true">
        {tag}
      </span>
      <span className="test-result-name">
        <span className="sr-only">{label}: </span>
        {name}
        {detail && <span className="test-result-detail">{detail}</span>}
      </span>
    </div>
  );
}
