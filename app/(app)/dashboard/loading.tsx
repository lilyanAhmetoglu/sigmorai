import { Panel } from '@/components/panel';
import { DASHBOARD_TEXT } from '@/lib/constants';

/** Panel-shaped placeholders in the dashboard layout, so nothing jumps. No spinner. */
export default function Loading() {
  return (
    <div aria-busy="true" className="max-w-app mx-auto flex w-full flex-wrap gap-6 px-4 py-6">
      <span role="status" className="sr-only">
        {DASHBOARD_TEXT.loading}
      </span>
      <div className="flex min-w-0 flex-[3_1_34rem] flex-col gap-6">
        <div className="bg-surface-2 h-10 w-2/3" />
        <Panel tone="sunken">
          <div className="h-28" />
        </Panel>
        <div className="card-grid">
          {[0, 1, 2].map((i) => (
            <Panel key={i} tone="sunken">
              <div className="h-40" />
            </Panel>
          ))}
        </div>
      </div>
      <div className="flex min-w-0 flex-[1_1_16rem] flex-col gap-4">
        <Panel tone="sunken">
          <div className="h-48" />
        </Panel>
        <Panel tone="sunken">
          <div className="h-32" />
        </Panel>
      </div>
    </div>
  );
}
