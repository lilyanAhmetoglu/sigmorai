'use client';

import { RouteError } from '@/components/route-error';
import { FRONTIER_TEXT } from '@/lib/constants';

type Props = { error: Error & { digest?: string }; retry: () => void };

export default function FrontierError({ error, retry }: Props) {
  return (
    <RouteError
      message={FRONTIER_TEXT.error}
      retryLabel={FRONTIER_TEXT.retry}
      retry={retry}
      digest={error.digest}
    />
  );
}
