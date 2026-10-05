import { HP_PER_CHALLENGE } from '@/lib/constants';
import type { SubmissionStatus } from '@/lib/types';
import { utcDayStart } from './day';

/**
 * HP is computed, never stored (db/CLAUDE.md invariant 5). It is per case
 * and per UTC day: HP_PER_CHALLENGE minus today's spent attempts.
 *
 * Spent = `failed`. `passed` costs nothing.
 */
const SPENT: readonly SubmissionStatus[] = ['failed'];

export const isHpSpent = (status: SubmissionStatus): boolean => SPENT.includes(status);

/** One submissions row, as far as HP cares. */
export type HpAttempt = { status: SubmissionStatus; createdAt: Date };

/** Attempts on this case that cost HP since 00:00 UTC today. */
export function hpSpentToday(attempts: readonly HpAttempt[], now: Date): number {
  const dayStart = utcDayStart(now).getTime();
  return attempts.filter((a) => a.createdAt.getTime() >= dayStart && isHpSpent(a.status)).length;
}

/** HP left, floored at 0. */
export const hpLeft = (spent: number): number => Math.max(0, HP_PER_CHALLENGE - spent);
