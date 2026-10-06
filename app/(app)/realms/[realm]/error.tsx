'use client';

import { RouteError } from '@/components/route-error';
import { REALMS_TEXT } from '@/lib/constants';

type Props = { error: Error & { digest?: string }; retry: () => void };

export default function RealmError({ error, retry }: Props) {
  return (
    <RouteError
      message={REALMS_TEXT.errorRealm}
      retryLabel={REALMS_TEXT.retry}
      retry={retry}
      digest={error.digest}
    />
  );
}
