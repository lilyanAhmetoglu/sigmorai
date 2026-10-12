import { expect, test, type Page } from '@playwright/test';
import {
  MAP_HREF,
  MAP_TEXT,
  MATH_HREF,
  MATH_TOWER,
  QUEST_STOP_TEXT,
  REALMS,
  REALMS_HREF,
  TRACK_PARAM,
  WORLD_MAP_TEXT,
} from '@/lib/constants';
import { realmStopCount } from './content';

/**
 * Clear maps (level-art and world-map specs, amendments 2026-10-08), signed
 * out: the level map is a quest path of cards with words, not a strip of
 * numbers; world-map markers show a name, a status word and progress. No
 * sideways page scroll at phone width.
 */
const PHONE = { width: 390, height: 844 };

/**
 * The real level map, not the loading.tsx skeleton: while the page streams,
 * the skeleton's banner and cards can still be in the DOM. Only the real map
 * is a <section>.
 */
const levelMap = (page: Page) => page.locator('section.quest-map');

test('level map: a card per chapter and the boss, with a status word and steps', async ({
  page,
}) => {
  await page.goto('/map/prompt-forest?track=strategist');
  const cards = levelMap(page).locator('.quest-stop');
  // 6 chapters + boss on the strategist path.
  await expect(cards).toHaveCount(7);
  const first = cards.first();
  await expect(first).toContainText(MAP_TEXT.chapterTag(1));
  // A visitor has cleared nothing: START, like the header button.
  await expect(first).toContainText(QUEST_STOP_TEXT.start.label);
  await expect(first.getByRole('link')).toHaveAttribute('aria-current', 'step');
  await expect(first.getByRole('list', { name: MAP_TEXT.steps }).getByRole('listitem')).toHaveCount(
    3,
  );
  // A shut card is an aria-disabled button that says what opens it.
  const second = cards.nth(1);
  const shut = second.getByRole('button');
  await expect(shut).toHaveAttribute('aria-disabled', 'true');
  await expect(shut).toHaveAccessibleDescription('Clear chapter 1 first.');
  await expect(second).toContainText('Clear chapter 1 first.');
  await expect(cards.last()).toContainText(MAP_TEXT.bossTag);
});

test('level map: a visitor at 390px is not scrolled down on load', async ({ page }) => {
  await page.setViewportSize(PHONE);
  await page.goto('/map/prompt-forest?track=strategist');
  await expect(levelMap(page).locator('.quest-stop').first()).toBeVisible();
  // ScrollToCurrent runs after hydration; give it a moment, then check nothing moved.
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
});

test('level map: no sideways scroll on a phone', async ({ page }) => {
  await page.setViewportSize(PHONE);
  await page.goto('/map/prompt-forest?track=strategist');
  await expect(levelMap(page).locator('.quest-map-banner')).toBeVisible();
  const sideways = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(sideways).toBe(false);
});

test('level map: a realm with no art shows a named banner', async ({ page }) => {
  const realm = REALMS.find((r) => !r.scene);
  test.skip(
    !realm,
    'every realm has art; the flat banner is covered by the SPECIALIST_REALMS unit test in lib/content/curriculum.test.ts',
  );
  await page.setViewportSize(PHONE);
  await page.goto(`/map/${realm!.slug}`);
  await expect(levelMap(page).locator('.quest-map-banner[data-flat]')).toContainText(realm!.name);
});

test('world map: markers show name, status and progress at zoom 1, on a phone too', async ({
  page,
}) => {
  await page.setViewportSize(PHONE);
  await page.goto('/map?track=strategist');
  const marker = page.locator('.world-marker[aria-current="location"]');
  const label = marker.locator('.world-marker-label');
  await expect(label).toBeVisible();
  await expect(label).toContainText('Bootstrap Village', { ignoreCase: true });
  // One bar cell per chapter and the boss, as the outline lists them.
  await expect(label.locator('.world-marker-cell')).toHaveCount(realmStopCount('strategist', 0));
  // The accessible name starts with the visible tag, then the name (WCAG 2.5.3).
  await expect(marker).toHaveAccessibleName(
    new RegExp(`^${WORLD_MAP_TEXT.startHere.toLowerCase()}, Bootstrap Village, 00, open, `),
  );
  // Zoom ½: the plates hide, the pins stay.
  await page.getByRole('button', { name: WORLD_MAP_TEXT.zoomOut }).click();
  await expect(label).toBeHidden();
});

test('/realms moves to the world map for good, keeping ?track=; realm pages stay', async ({
  request,
  page,
}) => {
  const res = await request.get(`${REALMS_HREF}?${TRACK_PARAM}=creator`, { maxRedirects: 0 });
  expect(res.status()).toBe(308);
  const to = new URL(res.headers().location, 'http://x');
  expect(`${to.pathname}${to.search}`).toBe(`${MAP_HREF}?${TRACK_PARAM}=creator`);
  await page.goto(`${REALMS_HREF}/${REALMS[1].slug}`);
  await expect(page).toHaveURL(new RegExp(`${REALMS_HREF}/${REALMS[1].slug}$`));
});

test('world map: the Math Tower has a pin and a name on the map, and a side-realm link', async ({
  page,
}) => {
  await page.setViewportSize(PHONE);
  await page.goto(MAP_HREF);
  // On the map: a 44px link with a visible name plate, named for screen readers too.
  const landmark = page.getByRole('link', { name: WORLD_MAP_TEXT.landmark(MATH_TOWER.name) });
  await expect(landmark).toHaveAttribute('href', MATH_HREF);
  const box = await landmark.boundingBox();
  expect(box?.width).toBeGreaterThanOrEqual(44);
  expect(box?.height).toBeGreaterThanOrEqual(44);
  await landmark.scrollIntoViewIfNeeded();
  await expect(landmark.locator('.world-landmark-name')).toBeVisible();
  // The map key explains its pin.
  await expect(page.getByRole('list', { name: WORLD_MAP_TEXT.legendLabel })).toContainText(
    WORLD_MAP_TEXT.legend.sideRealm,
  );
  // Under the map: the side-realm button goes to the tower.
  await page.getByRole('link', { name: MATH_TOWER.name, exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`${MATH_HREF}$`));
});

test('world map: no sideways page scroll on a phone at 360px', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto(MAP_HREF);
  await expect(page.locator('.realm-card').first()).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});
