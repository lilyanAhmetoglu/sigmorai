/**
 * The safe part of a database error, for a log line (SIG-27). A Drizzle
 * query error's message holds the SQL and its params (user ids, hero names),
 * so it is never logged. Only the Postgres error code (e.g. "23505") and the
 * constraint name are kept, read from the error or its `cause`.
 */
export type DbErrorSummary = { code: string | null; constraint: string | null };

function field(value: unknown, key: 'code' | 'constraint'): string | null {
  if (typeof value !== 'object' || value === null || !(key in value)) return null;
  const found = (value as Record<string, unknown>)[key];
  return typeof found === 'string' ? found : null;
}

export function dbErrorSummary(error: unknown): DbErrorSummary {
  const cause = typeof error === 'object' && error !== null ? (error as Error).cause : undefined;
  return {
    code: field(error, 'code') ?? field(cause, 'code'),
    constraint: field(error, 'constraint') ?? field(cause, 'constraint'),
  };
}
