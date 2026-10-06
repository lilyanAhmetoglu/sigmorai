import { LevelMapSkeleton } from '@/components/map/level-map';
import { MAP_TEXT } from '@/lib/constants';

/** Header and map-strip placeholders, so nothing jumps. No spinner. */
export default function Loading() {
  return (
    <div aria-busy="true" className="max-w-app mx-auto flex w-full flex-col gap-6 px-4 py-6">
      <span role="status" className="sr-only">
        {MAP_TEXT.loading}
      </span>
      <div className="flex flex-col gap-2">
        <div className="bg-surface-2 h-4 w-40" />
        <div className="bg-surface-2 h-10 w-2/3" />
        <div className="bg-surface-2 h-6 w-1/2" />
      </div>
      {/* Track switch + Start / Continue row */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="bg-surface-2 h-11 w-60" />
        <div className="bg-surface-2 h-11 w-28" />
      </div>
      <LevelMapSkeleton />
    </div>
  );
}
