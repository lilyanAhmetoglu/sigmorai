# Lesson template rollout: resume notes (paused 2026-10-09)

Paused by the maintainer for about 48 hours. Delete this folder when the rollout is done.

## Merged into canary

- builder r0–r7, strategist r0–r5, creator r0–r4 (PRs up to #194).
- #195: e2e fix, the credited-chapter check is scoped to the main region.

## In progress (each branch ends in a `chore(content): save unfinished …` commit)

| Branch                           | State                                                              | Next step                                                             |
| -------------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------- |
| `content/template-builder-r8`    | Written. Fact check + voice check done. Fixes partly applied.      | Finish `review-builder-r8.md` + `voice-builder-r8.md`, then PR.       |
| `content/template-strategist-r6` | Written. Fact check + voice check done. Fixes done in c2, c3 only. | Finish `review-strategist-r6.md` + `voice-strategist-r6.md`, then PR. |
| `content/template-creator-r5`    | c1–c3 written; c4–c6 drafted, not checked.                         | Finish c4–c6, run the checks, then fact check + voice check.          |
| `content/template-strategist-r7` | c1–c3 drafted, not checked; c4–c6 not started.                     | Finish all six, run the checks, then fact check + voice check.        |

For r6 c4, use the fact check's wording "makes a related point", not "says the same in its own words".

## Not started

strategist r8, r15 · creator r6–r13 · builder r14 · math f1–f8.

## Later pass

Change older case and quick-check explanations that say "OpenAI says", "Google says" or "Runway says" to "the <vendor> docs".

## Open questions for the maintainer

- Skip Vercel previews for content branches? (Free plan: 100 deploys a day.)
- Add strategist and creator lines to `content/CLAUDE.md`?
- Say "release" when ready.

## How each group goes

Writer → content-reviewer + voice-guardian → one fixer applies both → PR → CI green → merge into canary. Open one PR at a time: a second e2e run cancels the first.
