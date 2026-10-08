import { expect, test } from '@playwright/test';
import { AUTH_ROUTES, AUTH_TEXT, LIVE_NAV_ITEMS, SHELL_TEXT, SITE_NAME } from '@/lib/constants';

/**
 * One header on every page (maintainer, 2026-10-08): the same logo, the same
 * nav in the same order, and (signed out) Sign in + Start free links. Public and
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

    // Plain links (they work before hydration and without Clerk). No Sign in on /sign-in.
    const signIn = header.getByRole('link', { name: AUTH_TEXT.signIn, exact: true });
    if (route === AUTH_ROUTES.signIn) await expect(signIn).toHaveCount(0);
    else await expect(signIn).toHaveAttribute('href', AUTH_ROUTES.signIn);
    await expect(header.getByRole('link', { name: AUTH_TEXT.startFree })).toHaveAttribute(
      'href',
      AUTH_ROUTES.signUp,
    );
  });
}

test('a phone: one header row, Sign in in the Menu', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto('/');
  const header = page.getByRole('banner');
  const startFree = header.getByRole('link', { name: AUTH_TEXT.startFree });
  await expect(startFree).toBeVisible();
  await expect(header.getByRole('link', { name: AUTH_TEXT.signIn, exact: true })).toBeHidden();
  // Logo, Menu and Start free share one row.
  const mid = (box: { y: number; height: number } | null) => (box ? box.y + box.height / 2 : NaN);
  const logo = await header.getByRole('link', { name: SITE_NAME.toUpperCase() }).boundingBox();
  expect(Math.abs(mid(logo) - mid(await startFree.boundingBox()))).toBeLessThan(4);

  await header.getByText(SHELL_TEXT.menu).click();
  await expect(header.getByRole('link', { name: AUTH_TEXT.signIn, exact: true })).toBeVisible();
});

test('the nav marks the current section', async ({ page }) => {
  await page.goto('/blog');
  const nav = page.getByRole('banner').getByRole('navigation', { name: SHELL_TEXT.navLabel });
  await expect(nav.first().getByRole('link', { name: 'Blog' })).toHaveAttribute(
    'aria-current',
    'page',
  );
});
