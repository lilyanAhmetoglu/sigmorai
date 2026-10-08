'use client';

import { RouteError } from '@/components/route-error';
import { WORLD_MAP_TEXT } from '@/lib/constants';

type Props = { error: Error & { digest?: string }; retry: () => void };

export default function WorldMapError({ error, retry }: Props) {
  return (
    <RouteError
      message={WORLD_MAP_TEXT.error}
      retryLabel={WORLD_MAP_TEXT.retry}
      retry={retry}
      digest={error.digest}
    />
  );
}
