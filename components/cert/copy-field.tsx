'use client';

import { useEffect, useState } from 'react';
import { PixelButton } from '@/components/pixel-button';
import { TextField } from '@/components/text-field';
import { useCanCopy } from '@/components/use-can-copy';
import { CERT_TEXT, SHARE_COPIED_MS } from '@/lib/constants';

type Props = { label: string; value: string };

type Status = 'idle' | 'copied' | 'copy-failed';

/**
 * One LinkedIn field: a read-only text box (select and copy by hand works
 * without JavaScript) and a Copy button that renders only after hydration,
 * when the browser has a clipboard. The status line is a live region.
 */
export function CopyField({ label, value }: Props) {
  const copyOk = useCanCopy();
  const [status, setStatus] = useState<Status>('idle');

  useEffect(() => {
    if (status !== 'copied') return;
    const timer = setTimeout(() => setStatus('idle'), SHARE_COPIED_MS);
    return () => clearTimeout(timer);
  }, [status]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setStatus('copied');
    } catch {
      setStatus('copy-failed');
    }
  }

  return (
    <div className="cert-copy-field">
      <TextField
        label={label}
        value={value}
        readOnly
        onFocus={(e) => e.currentTarget.select()}
        className="min-w-0 flex-1"
      />
      {copyOk && (
        <PixelButton
          variant="secondary"
          size="sm"
          onClick={copy}
          aria-label={CERT_TEXT.copyLabel(label)}
        >
          {CERT_TEXT.copy}
        </PixelButton>
      )}
      <p role="status" className="cert-copy-status">
        {status === 'copied' && CERT_TEXT.copied(label)}
        {status === 'copy-failed' && CERT_TEXT.copyFailed}
      </p>
    </div>
  );
}
