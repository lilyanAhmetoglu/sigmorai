import 'server-only';
import { auth } from '@clerk/nextjs/server';
import { sql } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';
import { z } from 'zod';
import { db } from '@/db';
import { users, xpEvents } from '@/db/schema';
import { LEADERBOARD_CACHE_SECONDS, LEADERBOARD_SIZE, TRACKS } from '@/lib/constants';
import type {
  LeaderboardRange,
  LeaderboardView,
  LeaderboardViewer,
  RankedPlayer,
} from '@/lib/types';
import { numberInOrder, rangeCutoff, toLeaderboardRow } from '@/lib/xp/leaderboard';
import { getHudState } from './hud';

/*
 * The leaderboard (SIG-20). Tie order everywhere: xp desc, users.created_at
 * asc, users.id asc, so no two heroes share a rank.
 * - all time reads users.xp (the ledger cache, checked by `bun run db:check`)
 *   through users_leaderboard_idx (xp DESC NULLS LAST, created_at, id). The
 *   ORDER BY says NULLS LAST too, or Postgres can't use that index.
 * - week / month sum xp_events since a UTC-day cutoff computed in TS.
 * The top list is cached for 60 s per (range, cutoff). The viewer's own rank
 * is read fresh each request and never cached.
 * Raw SQL rows are parsed with Zod; nothing here returns the Clerk id to a page.
 */

const PlayerRowSchema = z.object({
  id: z.string(),
  rank: z.coerce.number().int().positive(),
  heroName: z.string(),
  track: z.enum(TRACKS),
  xp: z.coerce.number().int().nonnegative(),
  totalXp: z.coerce.number().int().nonnegative(),
});
const PlayerRowsSchema = z.array(PlayerRowSchema);

const parseRows = (rows: unknown): RankedPlayer[] => PlayerRowsSchema.parse(rows);

/** All time, top N. Only heroes with XP: a 0 XP hero has nothing to rank. */
async function readAllTimeTop(): Promise<RankedPlayer[]> {
  const rows = await db
    .select({
      id: users.id,
      heroName: users.heroName,
      track: users.track,
      xp: users.xp,
      totalXp: users.xp,
    })
    .from(users)
    .where(sql`${users.xp} > 0`)
    .orderBy(sql`${users.xp} desc nulls last`, sql`${users.createdAt} asc`, sql`${users.id} asc`)
    .limit(LEADERBOARD_SIZE);
  return parseRows(numberInOrder(rows));
}

/**
 * All time, one player's rank: 1 + heroes with more XP + heroes with the same
 * XP who joined earlier (or, same instant, have a smaller id). Both counts are
 * range scans on users_leaderboard_idx. No row or 0 XP → null.
 */
async function readAllTimeRank(userId: string): Promise<RankedPlayer | null> {
  const { rows } = await db.execute(sql`
    select
      u.id,
      u.hero_name as "heroName",
      u.track,
      u.xp,
      u.xp as "totalXp",
      (1
        + (select count(*) from ${users} o where o.xp > u.xp)
        + (select count(*) from ${users} o
             where o.xp = u.xp and (o.created_at, o.id) < (u.created_at, u.id))
      )::int as rank
    from ${users} u
    where u.id = ${userId} and u.xp > 0
  `);
  return parseRows(rows)[0] ?? null;
}

/**
 * Week / month, in one CTE: sum each hero's events since the cutoff, number
 * them in tie order, keep `rank <= limit or id = userId`. The cached top list
 * passes (LEADERBOARD_SIZE, null); the viewer's rank passes (0, their id).
 * A hero with no events in the window is not in the result.
 */
async function readWindow(cutoff: Date, limit: number, userId: string | null) {
  const { rows } = await db.execute(sql`
    with totals as (
      select e.user_id, sum(e.amount) as xp
      from ${xpEvents} e
      where e.created_at >= ${cutoff.toISOString()}::timestamptz
      group by e.user_id
    ),
    ranked as (
      select
        u.id,
        u.hero_name as "heroName",
        u.track,
        t.xp::int as xp,
        u.xp as "totalXp",
        row_number() over (order by t.xp desc, u.created_at asc, u.id asc)::int as rank
      from totals t
      join ${users} u on u.id = t.user_id
    )
    select * from ranked
    where rank <= ${limit} or id = ${userId}
    order by rank
  `);
  return parseRows(rows);
}

/**
 * The cached top list. unstable_cache, not 'use cache': this app has not
 * turned on cacheComponents (next.config.ts), and 'use cache' needs it.
 * The arguments are part of the cache key; the cutoff is a day-aligned ISO
 * string, so the key changes once a UTC day.
 */
const readTopCached = unstable_cache(
  async (range: LeaderboardRange, cutoffIso: string | null): Promise<RankedPlayer[]> =>
    cutoffIso === null ? readAllTimeTop() : readWindow(new Date(cutoffIso), LEADERBOARD_SIZE, null),
  ['leaderboard-top'],
  { revalidate: LEADERBOARD_CACHE_SECONDS },
);

/** The viewer's own rank in the range, fresh (not cached). null = no XP in it. */
async function readViewerRank(cutoff: Date | null, userId: string): Promise<RankedPlayer | null> {
  if (cutoff === null) return readAllTimeRank(userId);
  const [row] = await readWindow(cutoff, 0, userId);
  return row ?? null;
}

/**
 * The leaderboard page: the cached top list, with the viewer's row marked,
 * plus the viewer's own rank when they are below it. The viewer id comes from
 * Clerk's auth() only. Public: a signed-out visitor sees the top list.
 */
export async function getLeaderboard(range: LeaderboardRange): Promise<LeaderboardView> {
  const cutoff = rangeCutoff(range, new Date());
  const [{ userId }, hud, top] = await Promise.all([
    auth(),
    // Request-cached: the HUD in the layout reads the same row.
    getHudState(),
    readTopCached(range, cutoff?.toISOString() ?? null),
  ]);

  const viewerId = hud.status === 'ready' ? userId : null;
  const rows = top.map((player) => toLeaderboardRow(player, viewerId));

  let viewer: LeaderboardViewer;
  if (hud.status !== 'ready' || !viewerId) {
    viewer = { status: hud.status === 'onboarding' ? 'onboarding' : 'signed-out' };
  } else if (rows.some((row) => row.isViewer)) {
    viewer = { status: 'in-top' };
  } else {
    const mine = await readViewerRank(cutoff, viewerId);
    viewer = mine
      ? { status: 'ranked', row: toLeaderboardRow(mine, viewerId) }
      : { status: 'no-xp' };
  }

  return { range, rows, viewer };
}
