import { WorldMapBodySkeleton } from '@/components/map/world-map';

/** Header, map box and path-list placeholders at their final size, so nothing jumps. No spinner. */
export default function Loading() {
  return (
    <div aria-busy="true" className="max-w-app mx-auto flex w-full flex-col gap-6 px-4 py-6">
      <div className="flex flex-col gap-2">
        <div className="bg-surface-2 h-4 w-40" />
        <div className="bg-surface-2 h-10 w-2/3" />
        <div className="bg-surface-2 h-6 w-1/2" />
      </div>
      <WorldMapBodySkeleton />
    </div>
  );
}
