import { utcDayNumber } from './day';

/**
 * The streak after a pass (any pass, replays included; quest-actions spec).
 * Days are UTC days, compared with users.last_active_at:
 *   - never active → 1
 *   - same day → no change (at least 1: this pass counts)
 *   - the day after → +1
 *   - later → back to 1
 * The caller then sets last_active_at = now.
 */
export function nextStreak(current: number, lastActiveAt: Date | null, now: Date): number {
  if (!lastActiveAt) return 1;
  const gap = utcDayNumber(now) - utcDayNumber(lastActiveAt);
  // gap < 0 only with clock skew between servers: treat it as the same day.
  if (gap <= 0) return Math.max(current, 1);
  if (gap === 1) return current + 1;
  return 1;
}
