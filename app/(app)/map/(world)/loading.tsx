import { WorldMapSkeleton } from '@/components/map/world-map';
import { WORLD_MAP_TEXT } from '@/lib/constants';

/** Header, map box and path-list placeholders at their final size, so nothing jumps. No spinner. */
export default function Loading() {
  return (
    <div aria-busy="true" className="max-w-app mx-auto flex w-full flex-col gap-6 px-4 py-6">
      <span role="status" className="sr-only">
        {WORLD_MAP_TEXT.loading}
      </span>
      <div className="flex flex-col gap-2">
        <div className="bg-surface-2 h-4 w-40" />
        <div className="bg-surface-2 h-10 w-2/3" />
        <div className="bg-surface-2 h-6 w-1/2" />
      </div>
      <div className="bg-surface-2 h-11 w-60" />
      <WorldMapSkeleton />
      {/* Hint + zoom row */}
      <div className="bg-surface-2 h-11" />
      <div className="flex flex-col gap-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-surface-2 h-11" />
        ))}
      </div>
    </div>
  );
}
