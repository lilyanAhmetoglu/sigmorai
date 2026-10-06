const LABEL = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

/** `2026-10-06` → that day at 00:00 UTC. One parser for every `YYYY-MM-DD` in the app. */
export const utcMidnight = (date: string) => new Date(`${date}T00:00:00Z`);

/** `2026-10-06` → `6 October 2026` (the privacy page's style). UTC, so it never shifts a day. */
export const dateLabel = (date: string) => LABEL.format(utcMidnight(date));
