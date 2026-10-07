import { test } from '@playwright/test';
import { expectNoViolations } from './axe';

/**
 * Public routes, checked signed out. /dashboard needs a hero, so its check
 * runs inside quest-loop.spec.ts, right after onboarding creates one.
 */
const PUBLIC_ROUTES = [
  '/',
  '/leaderboard',
  '/frontier',
  '/blog',
  '/blog/be-specific',
  '/quest/strategist/r0/c1/lesson',
  '/quest/strategist/r0/c1/challenge',
];

for (const route of PUBLIC_ROUTES) {
  test(`axe: ${route}`, async ({ page }) => {
    await page.goto(route);
    await expectNoViolations(page);
  });
}
