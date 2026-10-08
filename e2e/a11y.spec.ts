import { expect, test } from '@playwright/test';
import { QUEST_TEXT } from '@/lib/constants';
import { expectNoViolations } from './axe';

/**
 * Public routes, checked signed out. /dashboard needs a hero, so its check
 * runs inside quest-loop.spec.ts, right after onboarding creates one.
 */
const PUBLIC_ROUTES = [
  '/',
  '/leaderboard',
  '/frontier',
  '/map',
  '/map/prompt-forest',
  '/map/canvas-workshop',
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

// A stepped lesson after a move and with every step shown (the route above checks step 1).
test('axe: lesson steps after Continue and Show all', async ({ page }) => {
  await page.goto('/quest/strategist/r0/c1/lesson');
  const progress = page.getByRole('progressbar', { name: QUEST_TEXT.stepLabel });
  await page.getByRole('button', { name: QUEST_TEXT.continue, exact: true }).click();
  await expect(progress).toHaveAttribute('aria-valuenow', '2');
  await expectNoViolations(page);
  await page.getByRole('button', { name: QUEST_TEXT.showAll }).click();
  await expect(page.getByRole('button', { name: QUEST_TEXT.showSteps })).toBeVisible();
  await expectNoViolations(page);
});
