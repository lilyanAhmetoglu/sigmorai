import { Panel } from '@/components/panel';
import { MATH_FLOOR_COUNT, MATH_TEXT } from '@/lib/constants';

/** Hero and floor-card placeholders, so nothing jumps. No spinner. */
export default function Loading() {
  return (
    <div aria-busy="true" className="max-w-app mx-auto flex w-full flex-col gap-6 px-4 py-6">
      <span role="status" className="sr-only">
        {MATH_TEXT.loading}
      </span>
      <div className="bg-surface-2 h-11 w-32" />
      <div className="bg-surface-2 min-h-65" />
      <div className="card-grid">
        {Array.from({ length: MATH_FLOOR_COUNT }, (_, i) => (
          <Panel key={i} tone="sunken">
            <div className="h-40" />
          </Panel>
        ))}
      </div>
    </div>
  );
}
