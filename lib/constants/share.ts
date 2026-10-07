/**
 * Share kit (SIG-48): the share buttons (components/share-buttons.tsx), their
 * prefilled text and the per-page share images. Plain product voice: no hype,
 * no lore. The buttons are plain links to each network's own share page; no
 * network script or pixel loads on our pages.
 */
import type { LeaderboardRange } from '@/lib/types';
import { MATH_TOWER } from './curriculum';
import { LEADERBOARD_TEXT } from './leaderboard';
import { SITE_NAME } from './site';

/**
 * The Math Tower's one line, in the share text and on its share image. Same
 * opening as MATH_TEXT.description / intro (realms-copy.ts): keep them in step.
 */
const MATH_LINE = 'The math behind AI systems, one floor at a time.';

/** The networks with a share link, in button order. */
export const SHARE_NETWORKS = ['linkedin', 'x', 'facebook'] as const;

/** utm_source for the two buttons that are not a network link. */
export const SHARE_COPY_SOURCE = 'copy';
export const SHARE_NATIVE_SOURCE = 'native';

/** The UTM tags on every shared link: utm_source is the network (or copy / native). */
export const SHARE_UTM = { medium: 'social', campaign: 'share' } as const;

/**
 * Each network's own share page. LinkedIn and Facebook read the title and
 * image from the page's Open Graph tags, so they take the URL only; X also
 * takes the prefilled text.
 */
export const SHARE_ENDPOINTS = {
  linkedin: 'https://www.linkedin.com/sharing/share-offsite/',
  x: 'https://x.com/intent/post',
  facebook: 'https://www.facebook.com/sharer/sharer.php',
} as const;

/** How long the "Link copied" status line stays (ms). */
export const SHARE_COPIED_MS = 2500;

/** Share-button words and the prefilled share text per page. */
export const SHARE_TEXT = {
  heading: 'SHARE',
  /** Accessible name of the button row. */
  groupLabel: 'Share this page',
  networks: { linkedin: 'LinkedIn', x: 'X', facebook: 'Facebook' },
  /** Screen-reader name of a network link: it opens the network's page in a new tab. */
  networkLabel: (network: string) => `Share on ${network} (opens in a new tab)`,
  copy: 'Copy link',
  copied: 'Link copied',
  copyFailed: "Couldn't copy. Copy the address from your browser instead.",
  native: 'Share…',
  /** A realm page: "Prompt Forest on Sigmorai: how to write prompts that work". */
  realm: (name: string, topic: string) => `${name} on ${SITE_NAME}: ${topic}`,
  post: (title: string) => `${title} (${SITE_NAME} blog)`,
  math: `The ${MATH_TOWER.name} on ${SITE_NAME}. ${MATH_LINE}`,
  leaderboard: `The ${SITE_NAME} leaderboard: the top heroes by XP.`,
  /** The signed-in viewer's own rank: "I'm #4 on the Sigmorai leaderboard (this week)." */
  rank: (rank: number, rangeLabel: string) =>
    `I'm #${rank} on the ${SITE_NAME} leaderboard (${rangeLabel}).`,
  /** The level-clear moment: "I cleared "Pick a model" on Sigmorai." */
  cleared: (title: string) => `I cleared "${title}" on ${SITE_NAME}.`,
  clearedHeading: 'SHARE THIS CLEAR',
} as const;

/** The range as it reads inside a sentence ("this week"). */
export const SHARE_RANGE_TEXT = {
  week: 'this week',
  month: 'this month',
  all: 'all time',
} as const satisfies Record<LeaderboardRange, string>;

/** The per-page share images (opengraph-image.tsx files). Alts repeat the words drawn. */
export const OG_TEXT = {
  /** Realm card eyebrow: "REALM 01 · BEGINNER · STRATEGIST PATH". */
  realmEyebrow: (tag: string, trackLabel: string) => `${tag} · ${trackLabel} PATH`,
  realmCardAlt: `A ${SITE_NAME} realm card: the realm's name, path and what it teaches, over the realm's pixel-art scene.`,
  postEyebrow: `${SITE_NAME.toUpperCase()} BLOG`,
  postCardAlt: `A ${SITE_NAME} blog card: the post's title over its pixel-art cover.`,
  mathLine: MATH_LINE,
  mathAlt: (eyebrow: string) =>
    `${SITE_NAME}: ${MATH_TOWER.name}, ${eyebrow.toLowerCase()}. ${MATH_LINE} The tower's pixel-art scene behind the title.`,
  leaderboardAlt: `${SITE_NAME}: ${LEADERBOARD_TEXT.title}. ${LEADERBOARD_TEXT.description}`,
} as const;
