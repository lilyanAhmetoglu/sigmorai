/**
 * The UTC day: the one boundary for HP refill and the streak
 * (grading rule: "UTC day boundary, decided once in lib/xp/").
 */

const DAY_MS = 24 * 60 * 60 * 1000;

/** Whole UTC days since 1970-01-01: `2026-10-05T23:59Z` → one less than `2026-10-06T00:00Z`. */
export const utcDayNumber = (at: Date): number => Math.floor(at.getTime() / DAY_MS);

/** 00:00 UTC of the day `at` is in. */
export const utcDayStart = (at: Date): Date => new Date(utcDayNumber(at) * DAY_MS);

/** 00:00 UTC of the next day: when HP refills. */
export const nextUtcDayStart = (at: Date): Date => new Date((utcDayNumber(at) + 1) * DAY_MS);
