import 'server-only';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { cache } from 'react';
import { db } from '@/db';
import { users } from '@/db/schema';
import type { HudState } from '@/lib/types';
import { levelProgress } from '@/lib/xp/level';
import { isActiveToday, shownStreak } from '@/lib/xp/streak';

/**
 * HUD values for the signed-in player. Scoped to Clerk's auth() user id only,
 * never an id from the request. No users row = not onboarded yet. Cached per
 * request, so a page and the HUD can both call it for one query.
 * The streak is the shown one (lib/xp/streak.ts): 0 once a UTC day is missed,
 * even before the next pass rewrites the stored value.
 */
export const getHudState = cache(async (): Promise<HudState> => {
  const { userId } = await auth();
  if (!userId) return { status: 'signed-out' };

  const [row] = await db
    .select({
      heroName: users.heroName,
      track: users.track,
      xp: users.xp,
      streak: users.streak,
      lastActiveAt: users.lastActiveAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!row) return { status: 'onboarding' };

  const { lastActiveAt, ...stats } = row;
  const now = new Date();
  return {
    status: 'ready',
    stats: {
      ...stats,
      ...levelProgress(stats.xp),
      streak: shownStreak(stats.streak, lastActiveAt, now),
      activeToday: isActiveToday(lastActiveAt, now),
    },
  };
});
