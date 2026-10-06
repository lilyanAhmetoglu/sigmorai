'use client';

import { RouteError } from '@/components/route-error';
import { MAP_TEXT } from '@/lib/constants';

type Props = { error: Error & { digest?: string }; retry: () => void };

export default function MapError({ error, retry }: Props) {
  return (
    <RouteError
      message={MAP_TEXT.error}
      retryLabel={MAP_TEXT.retry}
      retry={retry}
      digest={error.digest}
    />
  );
}
