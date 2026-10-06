import { MarketingHeader } from '@/components/hud/marketing-header';
import { Panel } from '@/components/panel';
import { PixelButton } from '@/components/pixel-button';
import { BLOG_HREF, BLOG_TEXT, MAIN_CONTENT_ID } from '@/lib/constants';

/** An unknown post slug: say so plainly and link back to the list. */
export default function BlogNotFound() {
  return (
    <>
      <MarketingHeader />
      <main
        id={MAIN_CONTENT_ID}
        tabIndex={-1}
        className="max-w-reading mx-auto flex w-full min-w-0 flex-1 flex-col gap-4 px-4 py-10"
      >
        <h1 className="sr-only">{BLOG_TEXT.notFound}</h1>
        <Panel tone="sunken" className="flex flex-col items-start gap-3">
          <p className="text-body leading-body m-0">{BLOG_TEXT.notFound}</p>
          <PixelButton
            href={BLOG_HREF}
            variant="secondary"
            icon={<span aria-hidden="true">{BLOG_TEXT.backIcon}</span>}
          >
            {BLOG_TEXT.back}
          </PixelButton>
        </Panel>
      </main>
    </>
  );
}
