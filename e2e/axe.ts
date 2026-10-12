import AxeBuilder from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa'];

/** Runs axe (WCAG 2.1 A + AA) on the current page and expects no violations. */
export async function expectNoViolations(page: Page) {
  // Next streams metadata: after a client navigation the <title> can land a
  // moment after the page body. Wait for it so axe does not flag document-title.
  await expect(page).toHaveTitle(/\S/);
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  // Only the useful parts, so a failure prints the rule and the elements.
  const found = violations.map((v) => ({
    rule: v.id,
    impact: v.impact,
    targets: v.nodes.map((n) => n.target.join(' ')),
  }));
  expect(found).toEqual([]);
}
