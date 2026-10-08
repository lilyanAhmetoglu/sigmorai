import { expect, test } from '@playwright/test';
import { AUTH_TEXT, LIVE_NAV_ITEMS, SHELL_TEXT, SITE_NAME } from '@/lib/constants';

/**
 * One header on every page (maintainer, 2026-10-08): the same logo, the same
 * nav in the same order, and (signed out) Sign in + Start free. Public and
 * in-app routes, plus a 404. The signed-in HUD on public pages is checked in
 * quest-loop.spec.ts, right after onboarding creates a hero.
 */
const ROUTES = [
  '/',
  '/blog',
  '/blog/be-specific',
  '/privacy',
  '/sign-in',
  '/realms',
  '/map',
  '/leaderboard',
  '/quest/strategist/r0/c1/lesson',
  '/no-such-page',
];

for (const route of ROUTES) {
  test(`one header: ${route}`, async ({ page }) => {
    await page.goto(route);
    const banners = page.getByRole('banner');
    await expect(banners).toHaveCount(1);
    const header = banners.first();

    await expect(
      header.getByRole('link', { name: SITE_NAME.toUpperCase(), exact: true }),
    ).toHaveAttribute('href', '/');

    const nav = header.getByRole('navigation', { name: SHELL_TEXT.navLabel }).first();
    await expect(nav.getByRole('link')).toHaveText(LIVE_NAV_ITEMS.map((item) => item.label));

    await expect(header.getByRole('button', { name: AUTH_TEXT.signIn })).toBeVisible();
    await expect(header.getByRole('button', { name: AUTH_TEXT.startFree })).toBeVisible();
  });
}

test('the nav marks the current section', async ({ page }) => {
  await page.goto('/blog');
  const nav = page.getByRole('banner').getByRole('navigation', { name: SHELL_TEXT.navLabel });
  await expect(nav.first().getByRole('link', { name: 'Blog' })).toHaveAttribute(
    'aria-current',
    'page',
  );
});
