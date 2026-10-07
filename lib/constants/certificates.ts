/**
 * Certificates (SIG-47, docs/plans/certificates-design-plan.md). A
 * certificate is derived, not stored: it is a read over one progress row.
 * The achievement list is built from the realm and track data, so a new
 * open tier adds its certificates with no edit here. Exercise ids are built
 * in lib/grading/certificates.ts (buildExerciseId lives in lib/content).
 * Plain product voice: no lore on the certificate.
 */
import type { CertAchievement, RealmId, Track } from '@/lib/types';
import { OPEN_TIERS, REALMS, MATH_TOWER } from './curriculum';
import { MATH_FLOOR_COUNT, TRACKS } from './exercises';
import { SITE_NAME } from './site';
import { TRACK_TEXT } from './ui-copy';

/** The Math Tower achievement: floor 8's quick check proves floors 1–7 (open check). */
export const MATH_TOWER_ACHIEVEMENT = 'math-tower';

/** `BUILDER` → `Builder`: the track label inside a sentence. */
const trackWord = (track: Track) =>
  TRACK_TEXT[track].label.charAt(0) + TRACK_TEXT[track].label.slice(1).toLowerCase();

const openTier = (tier: string) => (OPEN_TIERS as readonly string[]).includes(tier);

/** `builder` + realm 3 → `builder-r3`. */
export const realmAchievementSlug = (track: Track, realm: RealmId) => `${track}-r${realm}`;

/**
 * Every achievement a player can earn today: each open-tier realm's boss on
 * each track, then the Math Tower. Locked tiers can't be earned, so they
 * have no certificate (their links 404).
 */
export const CERT_ACHIEVEMENTS: readonly CertAchievement[] = [
  ...TRACKS.flatMap((track) =>
    REALMS.filter((realm) => openTier(realm.tier)).map((realm): CertAchievement => ({
      slug: realmAchievementSlug(track, realm.id),
      kind: 'realm',
      track,
      realm: realm.id,
      title: `${realm.name} cleared`,
      name: realm.name,
      pathLabel: `${TRACK_TEXT[track].label} PATH`,
      linkedInName: `${realm.name} cleared (${trackWord(track)} path)`,
    })),
  ),
  {
    slug: MATH_TOWER_ACHIEVEMENT,
    kind: 'math',
    floor: MATH_FLOOR_COUNT,
    title: `${MATH_TOWER.name} complete`,
    name: MATH_TOWER.name,
    pathLabel: 'SIDE REALM · ALL PATHS',
    linkedInName: `${MATH_TOWER.name} complete`,
  },
];

/** Every achievement slug, for the Zod enum (lib/types/certificates.ts). */
export const CERT_ACHIEVEMENT_SLUGS = CERT_ACHIEVEMENTS.map((a) => a.slug);

/** Base path of every certificate page. */
export const CERT_BASE_HREF = '/cert';
/** One certificate: `/cert/<public_id>/<achievement>`. Never the Clerk id. */
export const certHref = (publicId: string, achievement: string) =>
  `${CERT_BASE_HREF}/${publicId}/${achievement}`;
/** The certificate's PNG download (certificate.png route: the share image's renderer, as a file). */
export const certImageHref = (publicId: string, achievement: string) =>
  `${certHref(publicId, achievement)}/certificate.png`;
/** File name of the PNG download. */
export const certImageFilename = (achievement: string) =>
  `${SITE_NAME.toLowerCase()}-${achievement}.png`;
/** The credential id shown on the page and copied to LinkedIn: unique per player + achievement. */
export const certificateId = (publicId: string, achievement: string) =>
  `${publicId}-${achievement}`;

/**
 * LinkedIn's static "Add license or certification" form. LinkedIn no longer
 * autofills custom links (help answer a528030), so the page lists the five
 * fields to copy by hand.
 */
export const LINKEDIN_ADD_CERT_URL =
  'https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME';

/** Words on the certificate page, the profile panel and the certificate image. */
export const CERT_TEXT = {
  eyebrow: 'CERTIFICATE',
  panel: 'CERTIFICATE',
  /** Labelled "Hero name": the current hero name, not frozen at the clear (spec). */
  heroLabel: 'Hero name',
  pathLabel: 'Path',
  earnedLabel: 'Earned',
  idLabel: 'Certificate id',
  /** What the certificate proves, in one plain line. */
  realmProof: 'Cleared every chapter case and the boss case of this realm.',
  mathProof: `Cleared all ${MATH_FLOOR_COUNT} floors of the ${MATH_TOWER.name}.`,
  issuer: SITE_NAME,
  download: 'Download PNG',
  print: 'To save a PDF, use your browser’s Print and choose “Save as PDF”.',
  /** Share text: plain voice, no hype. */
  share: (title: string) => `I earned the "${title}" certificate on ${SITE_NAME}.`,
  shareHeading: 'SHARE THIS CERTIFICATE',
  linkedInHeading: 'ADD TO LINKEDIN',
  linkedInIntro:
    'LinkedIn opens its "Add license or certification" form. Copy each field below into it.',
  linkedInButton: 'Add to profile',
  linkedInLabel: 'Add to profile on LinkedIn (opens in a new tab)',
  fields: {
    name: 'Name',
    issuer: 'Issuing organization',
    issueDate: 'Issue date',
    credentialId: 'Credential ID',
    credentialUrl: 'Credential URL',
  },
  copy: 'Copy',
  copyLabel: (field: string) => `Copy ${field}`,
  copied: (field: string) => `${field} copied`,
  copyFailed: "Couldn't copy. Select the text and copy it yourself.",
  /** Meta description of a certificate page. */
  description: (title: string, heroName: string) =>
    `${heroName} earned the "${title}" certificate on ${SITE_NAME}.`,
  /** Title when the certificate is missing (the page itself 404s). */
  missingTitle: `Certificate · ${SITE_NAME}`,
  /** Share image words (lib/og/certificate-image.tsx). */
  imageAwardedTo: 'AWARDED TO',
  imageEarned: (date: string) => `Earned ${date}`,
  imageId: (id: string) => `ID ${id}`,
  imageAlt: `A ${SITE_NAME} certificate: the hero name, the achievement, the path and the date it was earned.`,
  loading: 'Loading the certificate',
  error: "The certificate didn't load. Try again in a moment.",
  retry: 'Retry',
  /** Profile panel. */
  profilePanel: 'CERTIFICATES',
  profileIntro:
    'Each realm boss you clear and the full Math Tower give a certificate. Certificate pages are public: anyone with the link can see them.',
  profileEmpty: "Clear a realm's boss to earn one.",
  profileView: 'View certificate',
  profileViewLabel: (title: string) => `View certificate: ${title}`,
  profileLoading: 'Loading your certificates',
  profileError: "Your certificates didn't load. Try again in a moment.",
} as const;
