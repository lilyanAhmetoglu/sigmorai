import type { Accent } from '@/lib/types';
import { cn } from '@/lib/utils';
import { filledSegments } from '@/lib/xp/segments';

type Props = {
  value?: number;
  max?: number;
  /** Colour of the lit cells and the value text. */
  accent?: Accent;
  /** Visible label and the progressbar's accessible name. */
  label: string;
  segments?: number;
  className?: string;
};

/** Segmented pixel progress bar for XP, HP and realm completion. Never a smooth fill. Styles: xp-bar.css. */
export function XPBar({
  value = 0,
  max = 100,
  accent = 'xp',
  label,
  segments = 20,
  className,
}: Props) {
  const lit = filledSegments(value, max, segments);

  return (
    <div className={cn('xp-bar', className)} data-accent={accent}>
      <div className="xp-bar-head">
        <span>{label}</span>
        <span className="xp-bar-value">
          {value}/{max}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={Math.min(Math.max(value, 0), max)}
        aria-valuetext={`${value} of ${max}`}
        className="xp-bar-track"
      >
        {Array.from({ length: segments }, (_, i) => (
          <div key={i} className="xp-bar-cell" data-lit={i < lit || undefined} />
        ))}
      </div>
    </div>
  );
}
