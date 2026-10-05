'use client';

import { Panel } from '@/components/panel';
import { PixelButton } from '@/components/pixel-button';

type Props = {
  /** Plain technical copy. NPCs never deliver system failures. */
  message: string;
  retryLabel: string;
  retry: () => void;
  digest?: string;
};

/** Body of a route's error.tsx: what failed, the error ref, and a retry. */
export function RouteError({ message, retryLabel, retry, digest }: Props) {
  return (
    <div className="max-w-reading mx-auto flex w-full flex-col gap-4 px-4 py-10">
      <Panel tone="sunken" role="alert" className="flex flex-col items-start gap-4">
        <p className="text-body leading-body m-0">{message}</p>
        {digest && <p className="font-code text-small text-text-3 m-0">Ref: {digest}</p>}
        <PixelButton variant="secondary" onClick={() => retry()}>
          {retryLabel}
        </PixelButton>
      </Panel>
    </div>
  );
}
