'use client';

import { catchError, type ErrorInfo } from 'next/error';
import { Panel } from '@/components/panel';
import { PixelButton } from '@/components/pixel-button';
import { CERT_TEXT } from '@/lib/constants';

/** Error state of the profile's Certificates panel: the rest of the profile still works. */
function CertificatesErrorView(_props: object, { retry }: ErrorInfo) {
  return (
    <Panel
      title={CERT_TEXT.profilePanel}
      titleAs="h2"
      accent="danger"
      className="flex flex-col items-start gap-4 pt-8"
    >
      <p role="alert" className="text-body leading-body text-text-2 m-0">
        {CERT_TEXT.profileError}
      </p>
      <PixelButton variant="secondary" size="sm" onClick={() => retry()}>
        {CERT_TEXT.retry}
      </PixelButton>
    </Panel>
  );
}

/** Wrap the Certificates panel: a failed read shows its own error, not a broken profile. */
export const CertificatesErrorBoundary = catchError(CertificatesErrorView);
