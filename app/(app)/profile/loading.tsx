import { Panel } from '@/components/panel';
import { PROFILE_TEXT } from '@/lib/constants';

/** Panel-shaped placeholders so the layout doesn't jump. No spinner. */
export default function Loading() {
  return (
    <div aria-busy="true" className="max-w-app mx-auto flex w-full flex-col gap-6 px-4 py-6">
      <span className="sr-only">{PROFILE_TEXT.loading}</span>
      <Panel tone="sunken">
        <div className="h-36" />
      </Panel>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,10rem),1fr))] gap-4">
        {[0, 1, 2].map((i) => (
          <Panel key={i} tone="sunken">
            <div className="h-16" />
          </Panel>
        ))}
      </div>
    </div>
  );
}
