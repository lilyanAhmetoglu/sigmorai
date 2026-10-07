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
 * - Vercel Web Analytics: no cookies; a visitor is a hash of the request,
 *   dropped after 24 hours; data points not tied to a person or IP address;
 *   fields: time, URL, route, referrer, filtered query params, geolocation
 *   (country, region, city), OS, browser, device type
 *   (vercel.com/docs/analytics/privacy-policy).
 * - Vercel Speed Insights: anonymous; fields: route, URL, network speed,
 *   browser, device type, OS, country, Web Vitals
 *   (vercel.com/docs/speed-insights/privacy-policy). Neither page names a
 *   storage region, so this page names none. Its doc does not say "no
 *   cookies", so the page claims that for Web Analytics only.
 * - Resend (newsletter, SIG-46): contacts are stored and processed in the
 *   USA (resend.com/legal/privacy-policy: "we transfer the data ... to the
 *   United States and process it there"). Unsubscribe marks the contact
 *   "Unsubscribed" globally, but does not delete it
 *   (resend.com/docs/dashboard/contacts/managing-unsubscribe-list). We send
 *   only the email address (lib/newsletter/resend.ts).
 * - Share buttons (SIG-48): plain links to linkedin.com, x.com and
 *   facebook.com share pages (components/share-buttons.tsx). No network
 *   script, widget or pixel loads on our pages; nothing is sent until the
 *   visitor clicks. The UTM tags end up in the page URL Web Analytics records.
 * - To check on the first deploy: DevTools → Application → Cookies on
 *   sigmorai.com shows no cookie from either script.
 *
 * MAINTAINER setup this page doesn't promise but the code supports:
 * - Clerk dashboard → Webhooks: add https://sigmorai.com/api/webhooks/clerk,
 *   event user.deleted. It erases our row when an account is deleted outside
 *   the app (a silent safety net).
 * - Vercel → Environment Variables: CLERK_WEBHOOK_SIGNING_SECRET (server-only)
 *   from that endpoint. Without it the webhook answers 400.
 * - Newsletter: every Broadcast must carry Resend's unsubscribe link
 *   placeholder, or the "Each email has an unsubscribe link" line is false.
 *   Turn off Broadcast open and click tracking in Resend: this page
 *   promises no tracking pixels.
 */

export const PRIVACY_META = {
  title: `Privacy · ${SITE_NAME}`,
  description: `What ${SITE_NAME} stores about you, why, who processes it, and how to download or delete it.`,
} as const;

export const PRIVACY_TEXT = {
  eyebrow: 'LEGAL',
  title: 'Privacy',
  updatedLabel: 'Last updated',
  updated: '7 October 2026',
  intro: `This page says what ${SITE_NAME} stores about you, why, who processes it, and how to get a copy or delete it.`,
} as const;

const CLERK_PRIVACY_URL = 'https://clerk.com/legal/privacy';
const VERCEL_PRIVACY_URL = 'https://vercel.com/legal/privacy-notice';
const RESEND_PRIVACY_URL = 'https://resend.com/legal/privacy-policy';

export const PRIVACY_SECTIONS: readonly PrivacySection[] = [
  {
    id: 'what-we-store',
    heading: 'What we store',
    paragraphs: ['When you create a hero, our database stores:'],
    items: [
      {
        term: 'Hero',
        text: 'Your hero name, your path, and when you made the hero. The hero name is public on the leaderboard.',
      },
      {
        term: 'Stats',
        text: 'Your XP, your streak and when you were last active. Your level is worked out from XP, not stored.',
      },
      { term: 'Progress', text: 'Each lesson, case and quick check you cleared, with the date.' },
      {
        term: 'Graded answers',
        text: 'For each case or quick check you submit: the options you picked, whether the attempt passed, and the time.',
      },
      { term: 'XP history', text: 'Each XP award: the amount, the reason and the date.' },
      {
        term: 'Account id',
        text: 'The id Clerk gives your sign-in account. It links these rows to you.',
      },
      {
        term: 'Public id',
        text: 'A random public id, used only in your certificate links.',
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
    paragraphs: ['Four services process your data for us:'],
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
        text: 'Hosting: it runs the app and serves every page. Vercel runs our server code in Washington, D.C., USA by default. Vercel also runs our visit statistics (see below).',
        link: { label: "Vercel's privacy notice", href: VERCEL_PRIVACY_URL },
      },
      {
        term: 'Resend',
        text: 'Sends the newsletter, only if you sign up for it. Resend stores and processes your email in the USA.',
        link: { label: "Resend's privacy policy", href: RESEND_PRIVACY_URL },
      },
    ],
  },
  {
    id: 'newsletter',
    heading: 'Newsletter',
    paragraphs: [
      'The newsletter box on the blog is optional, and you do not need an account to use it. When you sign up, we send your email address to Resend and nothing else. Resend keeps it on our contact list so it can send you the newsletter. Our own database does not store it.',
      'Each email has an unsubscribe link. Use it to stop all our emails; Resend then marks your address as unsubscribed. To have your address deleted from Resend too, reply to any newsletter email and ask; we delete it.',
      'The newsletter emails have no tracking pixels: we do not record whether you open them or click a link.',
    ],
  },
  {
    id: 'visit-statistics',
    heading: 'Visit statistics',
    paragraphs: [
      'We use Vercel Web Analytics and Vercel Speed Insights. They count page views and measure how fast pages load. They work for every visitor, signed in or not. Web Analytics uses no cookies. Speed Insights records anonymous timing data only.',
      'Web Analytics records, for each page view: the page address, the site you came from, your country, region and city, your browser, your operating system, and your device type (phone, tablet or computer). Speed Insights records the page address, your country, your browser, operating system and device type, plus how fast the page loaded and your network type (for example 4g).',
      'Vercel does not link these records to you or to your IP address. To count unique visitors, it makes a one-way code (a hash) from your request and deletes it after 24 hours. We see totals only, never one person.',
    ],
  },
  {
    id: 'share-buttons',
    heading: 'Share buttons',
    paragraphs: [
      'The LinkedIn, X and Facebook buttons are plain links. We load no script, widget or tracking pixel from these networks, so they learn nothing from your visit to our pages. When you click one, your browser opens that network’s own share page, and that network’s privacy policy applies there. We send the network nothing ourselves.',
      'Copy link and Share… use your own browser: the link goes to your clipboard or your device’s share menu, not to us.',
      'Shared links end with tags like utm_source=linkedin&utm_medium=social&utm_campaign=share. They only say which button made the link. Our visit statistics (see above) see them as part of the page address, so we can count visits that came from shares. They are not linked to you.',
    ],
  },
  {
    id: 'how-long',
    heading: 'How long we keep it',
    paragraphs: [
      'Until you delete your account. When you delete it, we delete your hero and every row listed above at once, and Clerk deletes your sign-in account.',
      "Deleted data can stay in Neon's restore history for up to 6 hours, then it is gone.",
      'Visit statistics are not linked to your account, so deleting it does not change them. They are totals only, with no record of you in them.',
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
      'Only the cookies Clerk needs to keep you signed in. Web Analytics uses no cookies. Speed Insights records anonymous timing data only. No ad cookies, and no tracking across other websites.',
    ],
  },
  {
    id: 'changes',
    heading: 'Changes',
    paragraphs: ['When this page changes, the date at the top changes too.'],
  },
];
