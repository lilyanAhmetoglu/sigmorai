'use client';

import { RouteError } from '@/components/route-error';
import { PROFILE_TEXT } from '@/lib/constants';

type Props = { error: Error & { digest?: string }; retry: () => void };

export default function ProfileError({ error, retry }: Props) {
  return (
    <RouteError
      message={PROFILE_TEXT.error}
      retryLabel={PROFILE_TEXT.retry}
      retry={retry}
      digest={error.digest}
    />
  );
}
