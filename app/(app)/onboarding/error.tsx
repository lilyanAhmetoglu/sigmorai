'use client';

import { RouteError } from '@/components/route-error';
import { ONBOARDING_TEXT } from '@/lib/constants';

type Props = { error: Error & { digest?: string }; retry: () => void };

export default function OnboardingError({ error, retry }: Props) {
  return (
    <RouteError
      message={ONBOARDING_TEXT.loadError}
      retryLabel={ONBOARDING_TEXT.retry}
      retry={retry}
      digest={error.digest}
    />
  );
}
