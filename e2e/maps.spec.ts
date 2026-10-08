import { expect, test } from '@playwright/test';
import { MAP_TEXT, QUEST_STOP_TEXT, REALMS, WORLD_MAP_TEXT } from '@/lib/constants';

/**
 * Clear maps (level-art and world-map specs, amendments 2026-10-08), signed
 * out: the level map is a quest path of cards with words, not a strip of
 * numbers; world-map markers show a name, a status word and progress. No
 * sideways page scroll at phone width.
 */
const PHONE = { width: 390, height: 844 };

test('level map: a card per chapter and the boss, with a status word and steps', async ({
  page,
}) => {
  await page.goto('/map/prompt-forest?track=strategist');
  const cards = page.locator('.quest-stop');
  // 6 chapters + boss on the strategist path.
  await expect(cards).toHaveCount(7);
  const first = cards.first();
  await expect(first).toContainText(MAP_TEXT.chapterTag(1));
  await expect(first).toContainText(QUEST_STOP_TEXT.current.label);
  await expect(first.getByRole('link')).toHaveAttribute('aria-current', 'step');
  await expect(first.getByRole('list', { name: MAP_TEXT.steps }).getByRole('listitem')).toHaveCount(
    3,
  );
  // A shut card is an aria-disabled button that says what opens it.
  const second = cards.nth(1);
  await expect(second.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
  await expect(second).toContainText('Clear chapter 1 first.');
  await expect(cards.last()).toContainText(MAP_TEXT.bossTag);
});

test('level map: a realm with no art shows a named banner; no sideways scroll on a phone', async ({
  page,
}) => {
  await page.setViewportSize(PHONE);
  const realm = REALMS.find((r) => r.slug === 'canvas-workshop')!;
  await page.goto(`/map/${realm.slug}`);
  await expect(page.locator('.quest-map-banner[data-flat]')).toContainText(realm.name);
  const sideways = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(sideways).toBe(false);
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
  await expect(label).toContainText('0/7');
  // The accessible name starts with the visible tag, then the name (WCAG 2.5.3).
  await expect(marker).toHaveAccessibleName(
    new RegExp(`^${WORLD_MAP_TEXT.startHere.toLowerCase()}, Bootstrap Village, 00, open, `),
  );
  // Zoom ½: the plates hide, the pins stay.
  await page.getByRole('button', { name: WORLD_MAP_TEXT.zoomOut }).click();
  await expect(label).toBeHidden();
});
