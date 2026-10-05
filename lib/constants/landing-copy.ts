import type { Audience } from '@/lib/types';
import { REALMS, TRACK_ACCENTS } from './curriculum';
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
    'Nine realms, from how a model reads a prompt to multi-agent systems in production. Every lesson cites its sources. Paths for beginners, business people and developers.',
} as const;

export const LANDING_TEXT = {
  navLabel: 'Account',
  eyebrow: 'AI ENGINEERING · PIXEL-ART RPG',
  title: 'Start your AI engineering adventure.',
  lede: `Nine realms, from how a model reads a prompt to multi-agent systems in production. Every lesson cites its sources. You clear a level by deciding a real scenario: how to design the system, or how to use it at work.`,
  audienceEyebrow: 'WHO IT IS FOR',
  audienceTitle: 'Pick the path that fits you',
  audienceIntro:
    'Both paths cross the same nine realms. Builders clear levels by deciding how to design the system. Strategists clear them by deciding real business cases.',
} as const;

/** "Who it is for" cards, in the ticket's order: beginner, business, tech. */
export const AUDIENCES: readonly Audience[] = [
  {
    id: 'beginner',
    label: 'NEW TO AI',
    accent: 'success',
    title: 'For total beginners',
    body: `No AI background needed. Realms ${firstRealm.id}–${lastRealm.id} are beginner level. Pick the strategist path when you sign up. You start with what a model is, what it can and can't do, and what it costs.`,
    points: [
      'One short lesson per chapter, then a case and a quick check',
      'No code on either path',
      'The Math Tower explains the maths, floor by floor',
    ],
    forWho: 'STUDENTS · GRADUATES · ANYONE WHO USES AI AT WORK',
  },
  {
    id: 'strategist',
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
];
