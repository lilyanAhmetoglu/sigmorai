/**
 * Certificate rules, pure (no IO). A certificate is derived from one
 * progress row: a realm's boss challenge (the boss open check already
 * proved the six chapter cases) or the Math Tower's floor 8 quick check
 * (it proved floors 1–7). Exercise ids come from buildExerciseId, so an id
 * read from a URL is never pasted into a query.
 */
import { CERT_ACHIEVEMENTS, MATH_AREA } from '@/lib/constants';
import { buildExerciseId } from '@/lib/content/ids';
import {
  AchievementSchema,
  CertPublicIdSchema,
  type CertAchievement,
  type EarnedCertificate,
} from '@/lib/types';
import { utcDayStart } from '@/lib/xp/day';

const BY_SLUG = new Map(CERT_ACHIEVEMENTS.map((a) => [a.slug, a]));

/** A slug from outside → its achievement. Unknown, locked-tier or not a string → null. */
export function parseAchievement(value: unknown): CertAchievement | null {
  const parsed = AchievementSchema.safeParse(value);
  return parsed.success ? (BY_SLUG.get(parsed.data) ?? null) : null;
}

/** The one progress row that proves this achievement. */
export function achievementToExerciseId(achievement: CertAchievement): string {
  return achievement.kind === 'realm'
    ? buildExerciseId({ area: 'boss', track: achievement.track, realm: achievement.realm })
    : buildExerciseId({ area: MATH_AREA, floor: achievement.floor, step: 'quick-check' });
}

/** The exercise id of every achievement, for one `in (...)` read. */
export const ELIGIBLE_EXERCISE_IDS: readonly string[] =
  CERT_ACHIEVEMENTS.map(achievementToExerciseId);

/**
 * A certificate request from the URL, checked before any DB read: the id must
 * be a uuid and the achievement a known, earnable slug. Null = 404.
 */
export function parseCertificateRequest(
  id: unknown,
  achievement: unknown,
): { publicId: string; achievement: CertAchievement; exerciseId: string } | null {
  const publicId = CertPublicIdSchema.safeParse(id);
  const found = parseAchievement(achievement);
  if (!publicId.success || !found) return null;
  // Postgres prints uuids in lower case; match that so one certificate has one URL.
  return {
    publicId: publicId.data.toLowerCase(),
    achievement: found,
    exerciseId: achievementToExerciseId(found),
  };
}

/** A timestamp → its UTC day, `2026-10-07`. The certificate's earned date. */
export const utcDayString = (at: Date): string => utcDayStart(at).toISOString().slice(0, 10);

/**
 * The achievements a set of cleared progress rows earns, in CERT_ACHIEVEMENTS
 * order (track by track, realm by realm, then the tower). `cleared` maps an
 * exercise id to its completed_at.
 */
export function earnedAchievements(
  cleared: ReadonlyMap<string, Date>,
  hrefFor: (achievement: CertAchievement) => string,
): EarnedCertificate[] {
  return CERT_ACHIEVEMENTS.flatMap((achievement) => {
    const at = cleared.get(achievementToExerciseId(achievement));
    return at ? [{ achievement, earnedOn: utcDayString(at), href: hrefFor(achievement) }] : [];
  });
}
