'use client';

import { RouteError } from '@/components/route-error';
import { BLOG_TEXT } from '@/lib/constants';

type Props = { error: Error & { digest?: string }; retry: () => void };

export default function BlogError({ error, retry }: Props) {
  return (
    <RouteError
      message={BLOG_TEXT.loadError}
      retryLabel={BLOG_TEXT.retry}
      retry={retry}
      digest={error.digest}
    />
  );
}
