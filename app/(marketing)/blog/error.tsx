'use client';

import { MarketingHeader } from '@/components/hud/marketing-header';
import { RouteError } from '@/components/route-error';
import { BLOG_TEXT, MAIN_CONTENT_ID } from '@/lib/constants';

type Props = { error: Error & { digest?: string }; retry: () => void };

/** The blog's error screen: same header and <main> as the pages, so the skip link still works. */
export default function BlogError({ error, retry }: Props) {
  return (
    <>
      <MarketingHeader />
      <main id={MAIN_CONTENT_ID} tabIndex={-1} className="flex w-full min-w-0 flex-1 flex-col">
        <h1 className="sr-only">{BLOG_TEXT.loadError}</h1>
        <RouteError
          message={BLOG_TEXT.loadError}
          retryLabel={BLOG_TEXT.retry}
          retry={retry}
          digest={error.digest}
        />
      </main>
    </>
  );
}
