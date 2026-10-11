# Lesson template rollout: resume notes (paused again 2026-10-11)

Paused by the maintainer until they say "go". Delete this folder when the rollout is done.

## Merged into canary

- Lessons: builder r0–r8, strategist r0–r6, creator r0–r5.
- Realm art for r9–r11 (#198). e2e streaming fixes (#195, and in #199).

## Open PR

- #200 strategist r7 — reviewed and fixed. Merge when CI is green.

## Ready, PR not opened yet (one PR at a time)

- `feat/realm-art-r12-r15` — art for r12–r15, cto review: ship. Open after #200.

## In progress (branches end in a `chore(content): save unfinished …` commit if the agent was stopped mid-work)

| Branch                            | State                                                     | Next step                                                                            |
| --------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `content/template-creator-r6`     | Written. Both reviews done. Fixer was applying them.      | Finish `review-creator-r6.md` + `voice-creator-r6.md` (check the WIP note), then PR. |
| `content/template-strategist-r8`  | Written. Both reviews done. Fixer was applying them.      | Finish `review-strategist-r8.md` + `voice-strategist-r8.md`, then PR.                |
| `content/template-creator-r7`     | Written (d8ae969). Reviews were stopped before reporting. | Run fact check + voice check again, then fixer, then PR.                             |
| `content/template-creator-r8`     | Writer was working.                                       | Finish the lessons (see the WIP commit), then reviews.                               |
| `content/template-strategist-r15` | Writer was working.                                       | Finish the lessons, then reviews.                                                    |
| `content/template-builder-r14`    | Writer was working.                                       | Finish the lessons, then reviews.                                                    |

## Not started

creator r9–r13 · math f1–f8.

## After the rollout

Notion ticket "Revise everything: content + code audit" — it lists the case and quick-check fixes found during the rollout.

## How each group goes

Writer → content-reviewer + voice-guardian → one fixer applies both → PR → CI green → merge into canary. Open one PR at a time: a second e2e run cancels the first. Writers keep copying the case setup into the worked example; tell them to list the graded questions first and make sure the example answers none of them.
