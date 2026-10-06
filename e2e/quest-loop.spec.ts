import { clerk } from '@clerk/testing/playwright';
import { expect, test, type Page } from '@playwright/test';
import {
  HP_PER_CHALLENGE,
  HUD_TEXT,
  LEADERBOARD_TEXT,
  ONBOARDING_TEXT,
  QUEST_TEXT,
  TRACK_TEXT,
  XP_REWARDS,
} from '@/lib/constants';
import { expectNoViolations } from './axe';
import { answersFor, type Answer } from './content';
import { E2E_EMAIL, heroNameFor, testUserId } from './test-user';

const CHAPTER_DIR = 'strategist/00-bootstrap-village/c1';
const QUEST = '/quest/strategist/r0/c1';

/** Pick one option per question by its text, inside that question's group. */
async function pick(page: Page, answers: Answer[], which: 'right' | 'wrong') {
  for (const answer of answers) {
    const group = page.getByRole('group', { name: answer.prompt });
    await group.getByRole('radio', { name: answer[which], exact: true }).check();
  }
}

async function submit(page: Page) {
  await page.getByRole('button', { name: QUEST_TEXT.submitAnswers }).click();
}

// The full loop: sign in → onboarding → lesson → case (fail, then pass) →
// quick check → leaderboard. Assertions are on text, never on rank numbers.
test('a new hero clears chapter 1 and shows on the leaderboard', async ({ page }) => {
  const hero = heroNameFor(await testUserId());
  const caseAnswers = answersFor(CHAPTER_DIR, 'case.json');
  const checkAnswers = answersFor(CHAPTER_DIR, 'quick-check.json');
  const result = page.getByRole('status').filter({ hasText: /correct/ });

  await page.goto('/');
  await clerk.signIn({ page, emailAddress: E2E_EMAIL });

  // Onboarding: the setup deleted the users row, so this is a fresh hero.
  await page.goto('/onboarding');
  await expectNoViolations(page);
  await page.getByLabel(ONBOARDING_TEXT.heroName).fill(hero);
  await page.getByRole('radio', { name: TRACK_TEXT.strategist.label }).check();
  await page.getByRole('button', { name: ONBOARDING_TEXT.submit }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('group', { name: HUD_TEXT.label })).toContainText(hero);
  // The signed-in a11y check (a11y.spec.ts covers the public routes).
  await expectNoViolations(page);

  // Lesson: one button, +10 XP once.
  await page.goto(`${QUEST}/lesson`);
  await page.getByRole('button', { name: QUEST_TEXT.lessonDone }).click();
  await expect(page.getByText(QUEST_TEXT.lessonCleared(XP_REWARDS.lesson))).toBeVisible();

  // Case, first try: every answer wrong costs 1 HP and shows only the count.
  await page.goto(`${QUEST}/challenge`);
  await pick(page, caseAnswers, 'wrong');
  await submit(page);
  await expect(result).toContainText(QUEST_TEXT.failed(0, caseAnswers.length));
  await expect(result).toContainText(QUEST_TEXT.hpLeft(HP_PER_CHALLENGE - 1, HP_PER_CHALLENGE));

  // Try again: a new sheet (new seed, new order), so pick() queries the radios afresh.
  await page.getByRole('button', { name: QUEST_TEXT.tryAgain }).click();
  await pick(page, caseAnswers, 'right');
  await submit(page);
  await expect(result).toContainText(QUEST_TEXT.passed);
  await expect(page.getByText(QUEST_TEXT.cleared(XP_REWARDS.challenge))).toBeVisible();

  // Quick check.
  await page.goto(`${QUEST}/quick-check`);
  await pick(page, checkAnswers, 'right');
  await submit(page);
  await expect(result).toContainText(QUEST_TEXT.passed);

  // Leaderboard: the hero's own row, marked "YOU" in text.
  await page.goto('/leaderboard');
  const mine = page.getByRole('listitem').filter({ hasText: hero });
  await expect(mine).toContainText(LEADERBOARD_TEXT.you);
});
