'use client';

import { RouteError } from '@/components/route-error';
import { MATH_TEXT } from '@/lib/constants';

type Props = { error: Error & { digest?: string }; retry: () => void };

export default function MathError({ error, retry }: Props) {
  return (
    <RouteError
      message={MATH_TEXT.error}
      retryLabel={MATH_TEXT.retry}
      retry={retry}
      digest={error.digest}
    />
  );
}
