import { HUD_TEXT } from '@/lib/constants';

/** HudBar loading state: static blocks the size of the real stats. */
export function HudSkeleton() {
  return (
    <div className="hud-bar" role="status" aria-busy="true">
      <span className="sr-only">{HUD_TEXT.loading}</span>
      <span className="hud-skeleton" data-part="xp" aria-hidden="true" />
      <span className="hud-skeleton" aria-hidden="true" />
    </div>
  );
}
