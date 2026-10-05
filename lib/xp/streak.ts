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

/** Days since the last pass (UTC days). Clock skew (a future date) counts as today. */
const daysSince = (lastActiveAt: Date, now: Date): number =>
  Math.max(utcDayNumber(now) - utcDayNumber(lastActiveAt), 0);

/**
 * The streak the UI shows. The stored users.streak only moves on a pass, so
 * after a missed day it is stale until the next pass. Read time fixes that:
 *   - last pass today or yesterday (UTC) → the stored value
 *   - older, or never → 0 (shown as 0; never a "you lost it" line, DESIGN.md)
 */
export function shownStreak(stored: number, lastActiveAt: Date | null, now: Date): number {
  if (!lastActiveAt) return 0;
  return daysSince(lastActiveAt, now) <= 1 ? stored : 0;
}

/** True when the player passed a step this UTC day. */
export function isActiveToday(lastActiveAt: Date | null, now: Date): boolean {
  return lastActiveAt !== null && daysSince(lastActiveAt, now) === 0;
}
