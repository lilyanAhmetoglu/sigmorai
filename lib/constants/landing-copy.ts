import type { Audience, Track } from '@/lib/types';
import { REALMS, TRACK_ACCENTS } from './curriculum';
import { QUICK_CHECK_QUESTIONS } from './content';
import { HP_PER_CHALLENGE, XP_REWARDS } from './xp';
import { SITE_NAME } from './site';

/**
 * Landing page words (product voice: plain, no lore outside a DialogBox).
 * Hero and track text follow design/ui_kits/webapp/Sigmorai App.dc.html
 * (landing screen, TR table). Only claims the curriculum backs up.
 */

const beginnerRealms = REALMS.filter((realm) => realm.tier === 'beginner');
const firstRealm = beginnerRealms[0];
const lastRealm = beginnerRealms[beginnerRealms.length - 1];

export const LANDING_META = {
  title: `${SITE_NAME}: learn AI engineering as a pixel-art RPG`,
  description:
    'Nine realms, from how a model reads a prompt to multi-agent systems in production. Every lesson cites its sources. Paths for beginners, business people, developers and designers.',
} as const;

export const LANDING_TEXT = {
  navLabel: 'Account',
  /** Replaces Sign in / Start free for a signed-in visitor (links to the dashboard). */
  continueQuest: 'Continue quest',
  eyebrow: 'AI ENGINEERING · PIXEL-ART RPG',
  title: 'Start your AI engineering adventure.',
  lede: `Nine realms, from how a model reads a prompt to multi-agent systems in production. Every lesson cites its sources. You clear a level by deciding a real scenario: how to design the system, or how to use it at work, or how to make AI media.`,
  audienceEyebrow: 'WHO IT IS FOR',
  audienceTitle: 'Pick the path that fits you',
  audienceIntro:
    'Pick the path that matches your job. The realms share names, but each path has its own lessons and cases: builders design systems, strategists decide business cases, creators decide media cases.',
  howEyebrow: 'HOW IT WORKS',
  howTitle: 'How you clear a level',
  /** Numbered steps; the numbers are drawn by CSS, so the words stand alone. */
  howSteps: [
    'Read a short lesson. It lists the official sources behind every claim.',
    `Decide a real case. A failed try costs 1 HP (${HP_PER_CHALLENGE} HP per case, back every day). Clear it for +${XP_REWARDS.challenge} XP and the next chapter opens.`,
    `Take the quick check: ${QUICK_CHECK_QUESTIONS} questions on the lesson. +${XP_REWARDS['quick-check']} XP, no HP cost.`,
    `Clear the realm's boss case (+${XP_REWARDS.boss} XP) to earn a certificate you can share.`,
  ],
  realmsEyebrow: 'THE MAP',
  realmsTitle: `${REALMS.length} realms, one world`,
  /** Keep in step with OPEN_TIERS (curriculum.ts): beginner + intermediate today. */
  realmsIntro: `Each realm is a course: chapters and a boss. Beginner and intermediate realms are open now; the advanced ones open later.`,
  realmsAll: 'Explore all realms',
  blogEyebrow: 'FROM THE BLOG',
  blogTitle: 'Latest posts',
  blogAll: 'Read the blog',
} as const;

/** How many blog posts the landing page shows. */
export const LANDING_POST_COUNT = 3;

/**
 * The share image (app/(marketing)/opengraph-image.tsx). The alt repeats the
 * words drawn in the image. Satori can't read CSS variables, so the colours are
 * the token values from design/tokens/colors.css (landing-copy.test.ts checks them).
 */
export const SHARE_IMAGE = {
  alt: `${SITE_NAME}: ${LANDING_TEXT.title} The ${SITE_NAME} logo over a pixel-art meadow with an open book on a stone stand.`,
  colors: {
    /** --ink-950 (--border-outline, shadows) */
    outline: '#0a0913',
    /** --ink-900 (--surface-1) */
    surface: '#131126',
    /** --ink-100 (--text-1) */
    text: '#f2f1fa',
    /** --spark-500 (--xp) */
    accent: '#ffc53d',
  },
} as const;

/** "Who it is for" cards, in order: beginner, business, tech, media. */
export const AUDIENCES: readonly Audience[] = [
  {
    id: 'beginner',
    track: 'strategist',
    cta: 'Start as a beginner',
    label: 'NEW TO AI',
    accent: 'success',
    title: 'For total beginners',
    body: `No AI background needed. Realms ${firstRealm.id}–${lastRealm.id} are beginner level. Pick the strategist path when you sign up. You start with what a model is, what it can and can't do, and what it costs.`,
    points: [
      'One short lesson per chapter, then a case and a quick check',
      'No code on any path',
      'The Math Tower explains the maths, floor by floor',
    ],
    forWho: 'STUDENTS · GRADUATES · ANYONE WHO USES AI AT WORK',
  },
  {
    id: 'strategist',
    track: 'strategist',
    cta: 'Start the strategist path',
    label: 'STRATEGIST',
    accent: TRACK_ACCENTS.strategist,
    title: 'For business people',
    body: 'Managers, founders and operators. Every level ends with a real business case to decide.',
    points: [
      'What AI and agents can really do',
      'Picking use cases and measuring ROI',
      'Governance, risk and rolling out to teams',
    ],
    forWho: 'MANAGERS · FOUNDERS · PRODUCT · OPS',
  },
  {
    id: 'builder',
    track: 'builder',
    cta: 'Start the builder path',
    label: 'BUILDER',
    accent: TRACK_ACCENTS.builder,
    title: 'For technical people',
    body: 'Engineers and developers. Every level ends with a graded design case: agents, tools, MCP, RAG, prompts, harnesses.',
    points: [
      'APIs, tool use and agent SDKs',
      'MCP servers, evals and multi-agent systems',
      'Pass levels by judging real design cases',
    ],
    forWho: 'DEVELOPERS · DATA SCIENTISTS · ML ENGINEERS',
  },
  {
    id: 'creator',
    track: 'creator',
    cta: 'Start the creator path',
    label: 'CREATOR',
    accent: TRACK_ACCENTS.creator,
    title: 'For designers and creators',
    body: 'Designers, art directors and social teams. Every level ends with a real media case to decide.',
    points: [
      'How image, video and audio models work',
      'Prompts, brand kits and keeping one style',
      'Rights, labels and what each asset costs',
    ],
    forWho: 'DESIGNERS · ART DIRECTORS · SOCIAL · MARKETING',
  },
];

/** A track's own landing card (not the beginner one), for its "who it is for" line in onboarding. */
export const audienceFor = (track: Track): Audience => {
  const audience = AUDIENCES.find((a) => a.id === track);
  if (!audience) throw new Error(`No landing card for track ${track}`);
  return audience;
};
