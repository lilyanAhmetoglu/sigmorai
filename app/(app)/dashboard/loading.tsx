import { Panel } from '@/components/panel';
import { coreRealms, DASHBOARD_TEXT } from '@/lib/constants';

/** Panel-shaped placeholders in the dashboard layout, so nothing jumps. No spinner. */
export default function Loading() {
  return (
    <div
      aria-busy="true"
      className="max-w-app mx-auto flex w-full flex-wrap items-start gap-6 px-4 py-6"
    >
      <span role="status" className="sr-only">
        {DASHBOARD_TEXT.loading}
      </span>
      <div className="flex min-w-0 flex-[3_1_34rem] flex-col gap-6">
        <div className="bg-surface-2 h-10 w-2/3" />
        <Panel tone="sunken">
          <div className="h-28" />
        </Panel>
        {/* "YOUR PATH": the section head, then one row per core realm (rows are 44px). */}
        <div className="bg-surface-2 h-11 w-1/2" />
        <div className="flex flex-col gap-2">
          {coreRealms().map((realm) => (
            <div key={realm.id} className="bg-surface-2 h-11" />
          ))}
        </div>
      </div>
      <div className="flex min-w-0 flex-[1_1_16rem] flex-col gap-4 pt-4">
        <Panel tone="sunken">
          <div className="h-48" />
        </Panel>
        {[0, 1, 2].map((i) => (
          <Panel key={i} tone="sunken">
            <div className="h-28" />
          </Panel>
        ))}
      </div>
    </div>
  );
}
