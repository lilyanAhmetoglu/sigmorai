import { Panel } from '@/components/panel';
import { REALMS_TEXT } from '@/lib/constants';

/** Card-shaped placeholders in the catalog grid, so nothing jumps. No spinner. */
export default function Loading() {
  return (
    <div aria-busy="true" className="max-w-app mx-auto flex w-full flex-col gap-6 px-4 py-6">
      <span role="status" className="sr-only">
        {REALMS_TEXT.loading}
      </span>
      <div className="bg-surface-2 h-10 w-2/3" />
      <div className="bg-surface-2 h-11 w-60" />
      <div className="card-grid">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Panel key={i} tone="sunken">
            <div className="h-48" />
          </Panel>
        ))}
      </div>
    </div>
  );
}
