'use client';

import { RouteError } from '@/components/route-error';
import { CERT_TEXT } from '@/lib/constants';

type Props = { error: Error & { digest?: string }; retry: () => void };

export default function CertError({ error, retry }: Props) {
  return (
    <RouteError
      message={CERT_TEXT.error}
      retryLabel={CERT_TEXT.retry}
      retry={retry}
      digest={error.digest}
    />
  );
}
