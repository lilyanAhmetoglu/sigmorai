import type { PrivacySection } from '@/lib/types';
import { SITE_NAME } from './site';

/**
 * Privacy page words (app/(marketing)/privacy). Plain product voice, no lore.
 * Only true claims: if the app changes what it stores or who processes it,
 * this file changes in the same PR (Anthropic joins in the mentor PR).
 * No placeholders may ship: legal-copy.test.ts fails on "maintainer" or "[".
 *
 * Sources (checked 2026-10-06):
 * - Neon: project database in AWS us-east-2 (Ohio); restore window 6 hours
 *   (history_retention 21600 s), read from the Neon project.
 * - Vercel: Functions default region iad1, Washington, D.C.
 *   (vercel.com/docs/functions/configuring-functions/region). The repo sets no region.
 * - Clerk: US-hosted, no regional data residency (clerk.com/security.md).
 *
 * MAINTAINER setup this page doesn't promise but the code supports:
 * - Clerk dashboard → Webhooks: add https://sigmorai.com/api/webhooks/clerk,
 *   event user.deleted. It erases our row when an account is deleted outside
 *   the app (a silent safety net).
 * - Vercel → Environment Variables: CLERK_WEBHOOK_SIGNING_SECRET (server-only)
 *   from that endpoint. Without it the webhook answers 400.
 */

export const PRIVACY_META = {
  title: `Privacy · ${SITE_NAME}`,
  description: `What ${SITE_NAME} stores about you, why, who processes it, and how to download or delete it.`,
} as const;

export const PRIVACY_TEXT = {
  eyebrow: 'LEGAL',
  title: 'Privacy',
  updatedLabel: 'Last updated',
  updated: '6 October 2026',
  intro: `This page says what ${SITE_NAME} stores about you, why, who processes it, and how to get a copy or delete it.`,
} as const;

const CLERK_PRIVACY_URL = 'https://clerk.com/legal/privacy';
const VERCEL_PRIVACY_URL = 'https://vercel.com/legal/privacy-notice';

export const PRIVACY_SECTIONS: readonly PrivacySection[] = [
  {
    id: 'what-we-store',
    heading: 'What we store',
    paragraphs: ['When you create a hero, our database stores:'],
    items: [
      {
        term: 'Hero',
        text: 'Your hero name, your path (builder or strategist), and when you made the hero. The hero name is public on the leaderboard.',
      },
      {
        term: 'Stats',
        text: 'Your XP, your streak and when you were last active. Your level is worked out from XP, not stored.',
      },
      { term: 'Progress', text: 'Each lesson, case and quick check you cleared, with the date.' },
      {
        term: 'Graded answers',
        text: 'For each case or quick check you submit: the options you picked, whether each one was right, and the time.',
      },
      { term: 'XP history', text: 'Each XP award: the amount, the reason and the date.' },
      {
        term: 'Account id',
        text: 'The id Clerk gives your sign-in account. It links these rows to you.',
      },
    ],
  },
  {
    id: 'identity',
    heading: 'Your email and sign-in',
    paragraphs: [
      'Our database does not store your email or a password. Clerk holds your sign-in identity: your email address, any social login you use, and your sessions.',
    ],
  },
  {
    id: 'why',
    heading: 'Why we store it',
    paragraphs: [
      'To run the game: save your progress, grade your cases, give you XP and show the leaderboard. We do not sell your data and we do not use it for ads.',
    ],
  },
  {
    id: 'processors',
    heading: 'Who processes it',
    paragraphs: ['Three services process your data for us:'],
    items: [
      {
        term: 'Clerk',
        text: 'Sign-in and identity. Clerk stores your sign-in details in the USA.',
        link: { label: "Clerk's privacy policy", href: CLERK_PRIVACY_URL },
      },
      {
        term: 'Neon',
        text: 'The Postgres database that holds the data listed above. It runs on AWS in Ohio, USA (us-east-2).',
      },
      {
        term: 'Vercel',
        text: 'Hosting: it runs the app and serves every page. Vercel runs our server code in Washington, D.C., USA by default.',
        link: { label: "Vercel's privacy notice", href: VERCEL_PRIVACY_URL },
      },
    ],
  },
  {
    id: 'how-long',
    heading: 'How long we keep it',
    paragraphs: [
      'Until you delete your account. When you delete it, we delete your hero and every row listed above at once, and Clerk deletes your sign-in account.',
      "Deleted data can stay in Neon's restore history for up to 6 hours, then it is gone.",
    ],
  },
  {
    id: 'your-rights',
    heading: 'Download or delete your data',
    paragraphs: ['To export or delete your data, use the buttons on your profile page.'],
    items: [
      {
        term: 'Download',
        text: 'Profile → Your data → Download my data. You get one JSON file with everything we store about you.',
      },
      {
        term: 'Delete',
        text: 'Profile → Your data → Delete account. This deletes your data and your sign-in account.',
      },
    ],
  },
  {
    id: 'cookies',
    heading: 'Cookies',
    paragraphs: [
      'Only the cookies Clerk needs to keep you signed in. No analytics, no ad cookies, no tracking.',
    ],
  },
  {
    id: 'changes',
    heading: 'Changes',
    paragraphs: ['When this page changes, the date at the top changes too.'],
  },
];
