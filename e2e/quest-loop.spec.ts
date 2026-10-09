import { clerk } from '@clerk/testing/playwright';
import { neon } from '@neondatabase/serverless';
import { expect, test, type Page } from '@playwright/test';
import {
  AUTH_ROUTES,
  BLOG_HREF,
  HP_PER_CHALLENGE,
  HUD_TEXT,
  LEADERBOARD_TEXT,
  NAV_ITEMS,
  ONBOARDING_TEXT,
  QUEST_TEXT,
  REALMS,
  REALMS_HREF,
  REALMS_TEXT,
  realmHref,
  SHELL_TEXT,
  STEP_STATUS_TEXT,
  TRACK_TEXT,
  XP_REWARDS,
} from '@/lib/constants';
import { expectNoViolations } from './axe';
import { answersFor, lessonStepTitles, type Answer } from './content';
import { E2E_EMAIL, heroNameFor, testUserId } from './test-user';

// The second test needs the hero the first one onboards: a failed loop skips it.
test.describe.configure({ mode: 'serial' });

const CHAPTER_DIR = 'strategist/00-bootstrap-village/c1';
const QUEST = '/quest/strategist/r0/c1';

/** Clerk's account button (UserButton); `cl-<element>` is Clerk's stable appearance class. */
const ACCOUNT_BUTTON = '.cl-userButtonTrigger';

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

  // A visitor's / loads no Clerk (ClerkGate); the (auth) pages always do.
  await page.goto(AUTH_ROUTES.signIn);
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
  // One header everywhere: the static pages show the same HUD (PublicHud reads /api/hud).
  for (const path of ['/', BLOG_HREF]) {
    await page.goto(path);
    await expect(
      page.getByRole('banner').getByRole('group', { name: HUD_TEXT.label }),
    ).toContainText(hero);
  }
  // On a public page Clerk mounts after hydration (the __client_uat hint), with
  // its UI: the account button shows. A client navigation into the (app) group
  // keeps the player's HUD and account button.
  const banner = page.getByRole('banner');
  await expect(banner.locator(ACCOUNT_BUTTON)).toBeVisible();
  await banner
    .getByRole('navigation', { name: SHELL_TEXT.navLabel })
    .first()
    .getByRole('link', { name: NAV_ITEMS.find((item) => item.href === REALMS_HREF)?.label })
    .click();
  await expect(page).toHaveURL(new RegExp(`${REALMS_HREF}$`));
  await expect(banner.getByRole('group', { name: HUD_TEXT.label })).toContainText(hero);
  await expect(banner.locator(ACCOUNT_BUTTON)).toBeVisible();

  // Lesson: one step at a time. Continue moves focus to each step (named by
  // its heading); the last button moves it to "Lesson done", which still needs a press.
  await page.goto(`${QUEST}/lesson`);
  const stepTitles = lessonStepTitles(CHAPTER_DIR);
  const progress = page.getByRole('progressbar', { name: QUEST_TEXT.stepLabel });
  await expect(progress).toHaveAttribute('aria-valuenow', '1');
  for (const title of stepTitles.slice(1)) {
    await page.getByRole('button', { name: QUEST_TEXT.continue, exact: true }).click();
    await expect(page.getByRole('heading', { level: 2, name: title, exact: true })).toBeVisible();
    await expect(page.getByRole('region', { name: title, exact: true })).toBeFocused();
  }
  await expect(progress).toHaveAttribute('aria-valuenow', String(stepTitles.length));
  await page.getByRole('button', { name: QUEST_TEXT.finish, exact: true }).click();
  // Lesson done: one button, +10 XP once. Exact: "Go to Lesson done" contains the same words.
  const lessonDone = page.getByRole('button', { name: QUEST_TEXT.lessonDone, exact: true });
  await expect(lessonDone).toBeFocused();
  await lessonDone.click();
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

// Shared chapters (token-costs: builder r0 c6 covers strategist r0 c4). Runs
// after the loop above, which onboarded the test user. Builder chapters 1–5
// are seeded as cleared so chapter 6's case is open; the e2e branch only.
test('a case cleared on the builder path credits its strategist twin', async ({ page }) => {
  const userId = await testUserId();
  const sql = neon(process.env.DATABASE_URL!);
  for (let c = 1; c <= 5; c++) {
    await sql.query(
      'insert into progress (user_id, exercise_id) values ($1, $2) on conflict do nothing',
      [userId, `builder/r0/c${c}/challenge`],
    );
  }
  const result = page.getByRole('status').filter({ hasText: /correct/ });

  // A visitor's / loads no Clerk (ClerkGate); the (auth) pages always do.
  await page.goto(AUTH_ROUTES.signIn);
  await clerk.signIn({ page, emailAddress: E2E_EMAIL });

  // The deep case, on the builder path: a real clear, full XP.
  await page.goto('/quest/builder/r0/c6/challenge');
  await pick(page, answersFor('builder/00-bootstrap-village/c6', 'case.json'), 'right');
  await submit(page);
  await expect(result).toContainText(QUEST_TEXT.passed);
  await expect(page.getByText(QUEST_TEXT.cleared(XP_REWARDS.challenge))).toBeVisible();

  // The strategist realm page shows its twin as cleared, and says where.
  await page.goto(realmHref(REALMS[0].slug, 'strategist'));
  await expect(page.getByText(REALMS_TEXT.creditedFrom(TRACK_TEXT.builder.label))).toBeVisible();
  // The lock follows the credit: chapter 5 opens (chapters 1–3 are not done).
  const c5 = page
    .getByRole('listitem')
    .filter({ hasText: REALMS_TEXT.chapterLabel(5) })
    .first();
  await expect(c5).toContainText(STEP_STATUS_TEXT.open.label);

  // The twin's case is a replay: no HP, no XP.
  await page.goto('/quest/strategist/r0/c4/challenge');
  await expect(page.getByText(QUEST_TEXT.replayNote)).toBeVisible();
  await pick(page, answersFor('strategist/00-bootstrap-village/c4', 'case.json'), 'right');
  await submit(page);
  await expect(page.getByText(QUEST_TEXT.passedReplay)).toBeVisible();
});
