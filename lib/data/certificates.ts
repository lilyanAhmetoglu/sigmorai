import 'server-only';
import { auth } from '@clerk/nextjs/server';
import { and, eq, inArray } from 'drizzle-orm';
import { cache } from 'react';
import { db } from '@/db';
import { progress, users } from '@/db/schema';
import { certHref } from '@/lib/constants';
import {
  earnedAchievements,
  ELIGIBLE_EXERCISE_IDS,
  parseCertificateRequest,
  utcDayString,
} from '@/lib/grading/certificates';
import type { CertificateView, EarnedCertificate } from '@/lib/types';

/**
 * One public certificate: `/cert/<public_id>/<achievement>`. Public, no
 * session. The id and slug are checked before the DB is touched, and the
 * read selects only the hero name and the clear date (never the Clerk id,
 * email, XP, level or streak). A bad id, an unknown hero and a realm not
 * cleared all return null, so the page gives the same 404 for each and a
 * link can't be used to probe who exists. Not cached across requests: a
 * deleted account must 404 at once. Cached per request (React cache), so the
 * layout, metadata and page share one read.
 */
export const getCertificate = cache(
  async (id: string, achievementSlug: string): Promise<CertificateView | null> => {
    const req = parseCertificateRequest(id, achievementSlug);
    if (!req) return null;

    const [row] = await db
      .select({ heroName: users.heroName, completedAt: progress.completedAt })
      .from(users)
      .innerJoin(
        progress,
        and(eq(progress.userId, users.id), eq(progress.exerciseId, req.exerciseId)),
      )
      .where(eq(users.publicId, req.publicId))
      .limit(1);
    if (!row) return null;

    return {
      publicId: req.publicId,
      achievement: req.achievement,
      heroName: row.heroName,
      earnedOn: utcDayString(row.completedAt),
    };
  },
);

/**
 * The signed-in player's earned certificates, for the profile panel. Pass
 * only the id from auth(). One query: the player's public id (the link needs
 * it; this and the cert route are the only reads of it besides the export)
 * plus their progress rows over the eligible exercise ids. No users row → [].
 */
export async function getMyAchievements(userId: string): Promise<EarnedCertificate[]> {
  const rows = await db
    .select({
      publicId: users.publicId,
      exerciseId: progress.exerciseId,
      completedAt: progress.completedAt,
    })
    .from(users)
    .leftJoin(
      progress,
      and(eq(progress.userId, users.id), inArray(progress.exerciseId, [...ELIGIBLE_EXERCISE_IDS])),
    )
    .where(eq(users.id, userId));
  if (rows.length === 0) return [];

  const { publicId } = rows[0];
  const cleared = new Map<string, Date>();
  for (const row of rows) {
    if (row.exerciseId && row.completedAt) cleared.set(row.exerciseId, row.completedAt);
  }
  return earnedAchievements(cleared, (a) => certHref(publicId, a.slug));
}

/** The signed-in player's certificates (auth()'s user only). Signed out → []. */
export async function getOwnCertificates(): Promise<EarnedCertificate[]> {
  const { userId } = await auth();
  return userId ? getMyAchievements(userId) : [];
}
