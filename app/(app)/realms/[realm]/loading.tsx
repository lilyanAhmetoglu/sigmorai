import { Panel } from '@/components/panel';
import { CHAPTER_COUNT, REALMS_TEXT } from '@/lib/constants';

/** Header and chapter-row placeholders, so nothing jumps. No spinner. */
export default function Loading() {
  return (
    <div aria-busy="true" className="max-w-app mx-auto flex w-full flex-col gap-6 px-4 py-6">
      <span role="status" className="sr-only">
        {REALMS_TEXT.loadingRealm}
      </span>
      <div className="bg-surface-2 h-11 w-32" />
      <div className="bg-surface-2 h-10 w-2/3" />
      <div className="bg-surface-2 h-6 w-1/2" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: CHAPTER_COUNT + 1 }, (_, i) => (
          <Panel key={i} tone="sunken" padding="sm">
            <div className="h-8" />
          </Panel>
        ))}
      </div>
    </div>
  );
}
