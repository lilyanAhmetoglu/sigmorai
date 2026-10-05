'use client';

import { RouteError } from '@/components/route-error';
import { DASHBOARD_TEXT } from '@/lib/constants';

type Props = { error: Error & { digest?: string }; retry: () => void };

export default function DashboardError({ error, retry }: Props) {
  return (
    <RouteError
      message={DASHBOARD_TEXT.error}
      retryLabel={DASHBOARD_TEXT.retry}
      retry={retry}
      digest={error.digest}
    />
  );
}
