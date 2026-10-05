import { Panel } from '@/components/panel';
import { QUEST_TEXT } from '@/lib/constants';

/** Panel-shaped placeholders in the quest layout, so nothing jumps. No spinner. */
export default function Loading() {
  return (
    <div aria-busy="true" className="flex w-full flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <span role="status" className="sr-only">
        {QUEST_TEXT.loading}
      </span>
      <div className="bg-surface-2 h-4 w-48" />
      <div className="quest-layout">
        <div className="flex flex-col gap-5">
          <div className="bg-surface-2 h-10 w-3/4" />
          <div className="bg-surface-2 h-24" />
        </div>
        <Panel tone="sunken">
          <div className="h-80" />
        </Panel>
      </div>
    </div>
  );
}
