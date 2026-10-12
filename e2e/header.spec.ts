import { expect, test } from '@playwright/test';
import {
  AUTH_ROUTES,
  AUTH_TEXT,
  BLOG_HREF,
  COOKIE_NOTICE_TEXT,
  LIVE_NAV_ITEMS,
  MAP_HREF,
  PRIVACY_HREF,
  SHELL_TEXT,
  SITE_NAME,
} from '@/lib/constants';
import { clerkFapiOrigin } from '@/lib/security/headers';

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
  '/math',
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

// Clerk only where needed (curriculum plan, amendments 2026-10-08): a visitor on
// a public page or an (app) page loads no Clerk script and calls no Clerk API.
const FAPI = clerkFapiOrigin(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
const CLERK_SCRIPT = /\/(clerk\.browser|ui\.browser)\.js/;

for (const route of ['/', BLOG_HREF, MAP_HREF, '/no-such-page']) {
  test(`no Clerk for a visitor: ${route}`, async ({ page }) => {
    const clerkRequests: string[] = [];
    page.on('request', (request) => {
      // A page navigation is not Clerk JS. With a development key (pk_test, as in CI) the
      // server middleware sends a visitor's first load through a `dev-browser-missing`
      // handshake redirect; a production key does not. Count scripts and API calls only.
      if (request.isNavigationRequest()) return;
      const url = request.url();
      if ((FAPI && url.startsWith(FAPI)) || CLERK_SCRIPT.test(url)) clerkRequests.push(url);
    });
    await page.goto(route, { waitUntil: 'networkidle' });
    // The plain visitor links render; networkidle means hydration and any late chunk are done.
    await expect(
      page.getByRole('banner').getByRole('link', { name: AUTH_TEXT.startFree }),
    ).toBeVisible();
    await expect(page.locator('script[data-clerk-js-script]')).toHaveCount(0);
    expect(clerkRequests).toEqual([]);
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

// The cookie notice (playwright.config.ts dismisses it for every other test).
test.describe('cookie notice', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('shows on a first visit, OK hides it for good', async ({ page }) => {
    await page.goto('/');
    const notice = page.getByRole('region', { name: COOKIE_NOTICE_TEXT.label });
    await expect(notice).toBeVisible();
    await expect(notice.getByRole('link', { name: COOKIE_NOTICE_TEXT.privacy })).toHaveAttribute(
      'href',
      PRIVACY_HREF,
    );
    await notice.getByRole('button', { name: COOKIE_NOTICE_TEXT.ok }).click();
    await expect(notice).toHaveCount(0);
    await page.reload();
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(notice).toHaveCount(0);
  });
});
