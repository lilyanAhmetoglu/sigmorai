import { Panel } from '@/components/panel';
import { PixelButton } from '@/components/pixel-button';
import { REALMS_HREF, REALMS_TEXT } from '@/lib/constants';

/** A bad realm slug: say so plainly and link back to the catalog. */
export default function RealmNotFound() {
  return (
    <div className="max-w-reading mx-auto flex w-full flex-col gap-4 px-4 py-10">
      <h1 className="sr-only">{REALMS_TEXT.notFound}</h1>
      <Panel tone="sunken" className="flex flex-col items-start gap-3">
        <p className="text-body leading-body m-0">{REALMS_TEXT.notFound}</p>
        <PixelButton
          href={REALMS_HREF}
          variant="secondary"
          icon={<span aria-hidden="true">{REALMS_TEXT.backIcon}</span>}
        >
          {REALMS_TEXT.back}
        </PixelButton>
      </Panel>
    </div>
  );
}
