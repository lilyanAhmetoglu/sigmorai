import { Panel } from '@/components/panel';
import { ONBOARDING_TEXT } from '@/lib/constants';

/** Panel-shaped placeholder so the layout doesn't jump. No spinner. */
export default function Loading() {
  return (
    <div aria-busy="true" className="max-w-reading mx-auto flex w-full flex-col gap-6 px-4 py-8">
      <span className="sr-only">{ONBOARDING_TEXT.loading}</span>
      <div className="bg-surface-1 h-10 w-64 max-w-full" />
      <Panel tone="sunken">
        <div className="h-96" />
      </Panel>
    </div>
  );
}
