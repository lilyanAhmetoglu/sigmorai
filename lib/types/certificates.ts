import { z } from 'zod';
import { CERT_ACHIEVEMENT_SLUGS } from '@/lib/constants';
import type { RealmId } from './curriculum';
import type { Track } from './exercise';

/** One achievement a certificate can prove (CERT_ACHIEVEMENTS in lib/constants/certificates.ts). */
export type CertAchievement = {
  /** URL segment: `builder-r3`, `math-tower`. */
  slug: string;
  /** "Prompt Forest cleared". */
  title: string;
  /** The place alone, "Prompt Forest": the share image's title (one line at 60px). */
  name: string;
  /** "BUILDER PATH". */
  pathLabel: string;
  /** The Name field copied into LinkedIn. */
  linkedInName: string;
} & ({ kind: 'realm'; track: Track; realm: RealmId } | { kind: 'math'; floor: number });

/** An achievement slug from outside (the `/cert/[id]/[achievement]` param) → a known slug. */
export const AchievementSchema = z.enum(CERT_ACHIEVEMENT_SLUGS as [string, ...string[]]);
export type AchievementSlug = z.infer<typeof AchievementSchema>;

/** The certificate id from outside (`/cert/[id]/...`): users.public_id, a uuid. */
export const CertPublicIdSchema = z.uuid();

/**
 * Everything a public certificate page shows. Only these fields leave the
 * DB read: never the Clerk id, email, XP, level or streak (spec).
 */
export type CertificateView = {
  publicId: string;
  achievement: CertAchievement;
  /** The current hero name, labelled "Hero name". */
  heroName: string;
  /** The progress row's completed_at as a UTC day: `2026-10-07`. */
  earnedOn: string;
};

/** One earned certificate in the profile panel. */
export type EarnedCertificate = {
  achievement: CertAchievement;
  earnedOn: string;
  href: string;
};
