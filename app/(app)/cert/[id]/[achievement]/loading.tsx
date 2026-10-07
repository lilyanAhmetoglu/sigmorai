import { Panel } from '@/components/panel';
import { CERT_TEXT } from '@/lib/constants';

/** Certificate-shaped placeholders, so nothing jumps. No spinner. */
export default function Loading() {
  return (
    <div aria-busy="true" className="max-w-reading mx-auto flex w-full flex-col gap-6 px-4 py-6">
      <span role="status" className="sr-only">
        {CERT_TEXT.loading}
      </span>
      <Panel tone="sunken">
        <div className="h-64" />
      </Panel>
      <Panel tone="sunken">
        <div className="h-24" />
      </Panel>
    </div>
  );
}
