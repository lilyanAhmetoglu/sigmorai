'use client';

import Link from 'next/link';
import { useState, useSyncExternalStore } from 'react';
import { PixelButton } from '@/components/pixel-button';
import { COOKIE_NOTICE_STORAGE_KEY, COOKIE_NOTICE_TEXT, PRIVACY_HREF } from '@/lib/constants';
import { readStorageFlag, writeStorageFlag } from '@/lib/utils';

const noSubscribe = () => () => {};
const getStorage = () => window.localStorage;
const seenInBrowser = () => readStorageFlag(getStorage, COOKIE_NOTICE_STORAGE_KEY);
/** The server can't see localStorage: it renders nothing, so a returning player sees no flash. */
const seenOnServer = () => true;

/**
 * Cookie notice on every route (root layout) until the visitor presses OK.
 * Information only, not a consent gate: the site sets only Clerk's sign-in
 * cookies (lib/constants/legal-copy.ts). Sticky at the end of <body>, so it
 * never hides the page end: scrolled to the bottom, the footer sits above it.
 * Not a dialog: no focus trap, focus order stays the page's. Styles: cookie-notice.css.
 */
export function CookieNotice() {
  const seen = useSyncExternalStore(noSubscribe, seenInBrowser, seenOnServer);
  // Closes for this page view even when storage is blocked and the write fails.
  const [dismissed, setDismissed] = useState(false);

  if (seen || dismissed) return null;

  const dismiss = () => {
    writeStorageFlag(getStorage, COOKIE_NOTICE_STORAGE_KEY);
    setDismissed(true);
  };

  return (
    <section aria-label={COOKIE_NOTICE_TEXT.label} className="cookie-notice">
      <div className="cookie-notice-bar">
        <p className="cookie-notice-text">{COOKIE_NOTICE_TEXT.body}</p>
        <div className="cookie-notice-actions">
          <Link href={PRIVACY_HREF} className="cookie-notice-link">
            {COOKIE_NOTICE_TEXT.privacy}
          </Link>
          <PixelButton size="sm" onClick={dismiss}>
            {COOKIE_NOTICE_TEXT.ok}
          </PixelButton>
        </div>
      </div>
    </section>
  );
}
