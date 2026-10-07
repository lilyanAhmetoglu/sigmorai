import { Panel } from '@/components/panel';
import { FRONTIER_TEXT } from '@/lib/constants';

/** How many chapter-card placeholders to show while the list loads. */
const PLACEHOLDER_CARDS = 3;

/** Header and chapter-card placeholders, so nothing jumps. No spinner. */
export default function Loading() {
  return (
    <div aria-busy="true" className="max-w-app mx-auto flex w-full flex-col gap-6 px-4 py-6">
      <span role="status" className="sr-only">
        {FRONTIER_TEXT.loading}
      </span>
      <div className="bg-surface-2 h-11 w-32" />
      <div className="bg-surface-2 h-4 w-40" />
      <div className="bg-surface-2 h-11 w-60" />
      <div className="card-grid">
        {Array.from({ length: PLACEHOLDER_CARDS }, (_, i) => (
          <Panel key={i} tone="sunken">
            <div className="h-28" />
          </Panel>
        ))}
      </div>
    </div>
  );
}
