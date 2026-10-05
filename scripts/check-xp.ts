// `bun run db:check`: users.xp is a cache of sum(xp_events.amount).
// Exits 1 and lists every user where the two disagree.
import { eq, sql } from 'drizzle-orm';
import { db } from '@/db';
import { users, xpEvents } from '@/db/schema';

try {
  const rows = await db
    .select({
      id: users.id,
      cached: users.xp,
      ledger: sql`coalesce(sum(${xpEvents.amount}), 0)`.mapWith(Number),
    })
    .from(users)
    .leftJoin(xpEvents, eq(xpEvents.userId, users.id))
    .groupBy(users.id);

  const drift = rows.filter((r) => r.cached !== r.ledger);
  for (const r of drift) {
    console.error(`xp drift: ${r.id} users.xp=${r.cached} sum(xp_events)=${r.ledger}`);
  }
  console.log(`check-xp: ${rows.length} users, ${drift.length} mismatched`);
  process.exitCode = drift.length > 0 ? 1 : 0;
} finally {
  await db.$client.end();
}
