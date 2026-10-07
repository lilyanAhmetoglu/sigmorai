'use client';

import { useEffect, useId, useState, useSyncExternalStore } from 'react';
import { useCanCopy } from '@/components/use-can-copy';
import { PixelButton } from '@/components/pixel-button';
import {
  SHARE_COPIED_MS,
  SHARE_NETWORKS,
  SHARE_COPY_SOURCE,
  SHARE_NATIVE_SOURCE,
  SHARE_TEXT,
  SITE_URL,
} from '@/lib/constants';
import type { ShareNetwork, ShareTarget } from '@/lib/types';
import { cn, shareLinks, withUtm } from '@/lib/utils';

type Props = {
  /** What to share: a site path or an absolute URL, and the prefilled text. */
  target: ShareTarget;
  /** Which network links to show, in order. Defaults to all (SHARE_NETWORKS). */
  networks?: readonly ShareNetwork[];
  /** The small label over the buttons. Defaults to SHARE. */
  heading?: string;
  /** The heading level, to fit the page outline. Defaults to h2. */
  as?: 'h2' | 'h3';
  className?: string;
};

type Status = 'idle' | 'copied' | 'copy-failed';

const noSubscribe = () => () => {};
const canNativeShare = () =>
  typeof navigator !== 'undefined' && typeof navigator.share === 'function';

/**
 * Share this page: LinkedIn, X and Facebook as plain links to each network's
 * own share page (no network script, no pixel), plus Copy link and the
 * phone's own share sheet (navigator.share) once the browser says it has
 * them. The links work without JavaScript; the two buttons only render after
 * hydration. Generic: any page (a realm, a post, a certificate) passes a
 * URL and text. Each link carries utm_source=<network>&utm_medium=social&
 * utm_campaign=share. Styles: share-buttons.css.
 */
export function ShareButtons({
  target,
  networks = SHARE_NETWORKS,
  heading = SHARE_TEXT.heading,
  as: Heading = 'h2',
  className,
}: Props) {
  const headingId = useId();
  const copyOk = useCanCopy();
  const nativeOk = useSyncExternalStore(noSubscribe, canNativeShare, () => false);
  const [status, setStatus] = useState<Status>('idle');

  // The "Link copied" status line clears after a moment.
  useEffect(() => {
    if (status !== 'copied') return;
    const timer = setTimeout(() => setStatus('idle'), SHARE_COPIED_MS);
    return () => clearTimeout(timer);
  }, [status]);

  const links = shareLinks(SITE_URL, target.url, target.text, networks);

  async function copy() {
    try {
      await navigator.clipboard.writeText(withUtm(SITE_URL, target.url, SHARE_COPY_SOURCE));
      setStatus('copied');
    } catch {
      setStatus('copy-failed');
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({
        text: target.text,
        url: withUtm(SITE_URL, target.url, SHARE_NATIVE_SOURCE),
      });
    } catch {
      // The person closed the share sheet (AbortError) or the browser refused: nothing to say.
    }
  }

  return (
    <section className={cn('share-buttons', className)} aria-labelledby={headingId}>
      <Heading id={headingId} className="page-eyebrow">
        {heading}
      </Heading>
      <ul className="share-buttons-list" aria-label={SHARE_TEXT.groupLabel}>
        {nativeOk && (
          <li>
            <PixelButton variant="secondary" size="sm" onClick={nativeShare}>
              {SHARE_TEXT.native}
            </PixelButton>
          </li>
        )}
        {links.map(({ network, href }) => (
          <li key={network}>
            <PixelButton
              href={href}
              variant="secondary"
              size="sm"
              target="_blank"
              rel="noopener noreferrer"
              prefetch={false}
              aria-label={SHARE_TEXT.networkLabel(SHARE_TEXT.networks[network])}
            >
              {SHARE_TEXT.networks[network]}
            </PixelButton>
          </li>
        ))}
        {copyOk && (
          <li>
            <PixelButton variant="secondary" size="sm" onClick={copy}>
              {SHARE_TEXT.copy}
            </PixelButton>
          </li>
        )}
      </ul>
      {/* Always rendered: a live region must exist before its text changes. */}
      <p role="status" className="share-buttons-status">
        {status === 'copied' && SHARE_TEXT.copied}
        {status === 'copy-failed' && SHARE_TEXT.copyFailed}
      </p>
    </section>
  );
}
