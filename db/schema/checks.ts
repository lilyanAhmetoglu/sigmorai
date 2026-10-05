import { sql, type SQL } from 'drizzle-orm';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';

/**
 * `column in ('a', 'b')` for a CHECK constraint, built from a lib/constants
 * list. CHECK bodies can't take bind params, so the values are inlined; they
 * are compile-time constants, and the guard keeps them that way.
 */
export function oneOf(column: AnyPgColumn, values: readonly string[]): SQL {
  for (const v of values) {
    if (!/^[a-z0-9-]+$/.test(v)) throw new Error(`oneOf: unsafe CHECK value "${v}"`);
  }
  return sql`${column} in (${sql.raw(values.map((v) => `'${v}'`).join(', '))})`;
}
