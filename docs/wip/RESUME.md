# Lesson template rollout: resume notes (paused again 2026-10-11, 17:05 UTC)

Paused by the maintainer until they say "go". Delete this folder when the rollout is done.

## Merged into canary

- Lessons: builder r0–r8, strategist r0–r7, creator r0–r5 (strategist r7 = #200).
- Realm art for r9–r11 (#198). e2e streaming fixes (#195, and in #199).

## Ready, PR not opened yet (one PR at a time)

- `feat/realm-art-r12-r15` (baf22da) — art for r12–r15, cto review: ship. Open this first.

## In progress (each branch ends in a `chore(content): save unfinished …` commit)

| Branch                            | Head    | State                                                                                                     | Next step                                                                                                                                                                                                     |
| --------------------------------- | ------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `content/template-creator-r6`     | 28fe3bc | All review fixes applied, but not checked.                                                                | Run content:check, format, test; overlap + mirror check (the new c4 budget Try it may be close to case Q4); read each lesson as one story; c5 quotes "Multiple rounds of testing…" twice — keep one. Then PR. |
| `content/template-strategist-r8`  | bff1e3a | Only c1 fixed (M1–M4 + voice). c1 not formatted.                                                          | Apply M5–M15, the should-fixes and the voice items for c2–c6 from `review-strategist-r8.md` + `voice-strategist-r8.md`. Then checks, PR.                                                                      |
| `content/template-creator-r7`     | d8ae969 | All 6 written and checked by the writer. Reviews were stopped.                                            | Run fact check + voice check again, then fixer, then PR.                                                                                                                                                      |
| `content/template-creator-r8`     | d4acf04 | c1–c3 done; c4 drafted + facts checked; c5 drafted, not checked; c6 old text. c3 case explanations fixed. | Finish c4–c6 (c6: teach the Veo 2-day timer reset on extension), run checks, then reviews.                                                                                                                    |
| `content/template-strategist-r15` | 829e107 | c1–c3 done (test not run on the c3 commit); c4–c6 old text.                                               | Run test; write c4–c6 (Cowork tasks run in the cloud, beta on Team/Enterprise; local files processed on Anthropic servers; new mode menu shows Auto and Manual). Then reviews.                                |
| `content/template-builder-r14`    | 883f439 | c1 and c2 done; c3–c6 old text (c3 sources already checked: all 37 quotes still match).                   | Write c3–c6, then reviews.                                                                                                                                                                                    |

## Not started

creator r9–r13 · math f1–f8.

## After the rollout

Notion ticket "Revise everything: content + code audit" — it lists the case and quick-check fixes found during the rollout.

## How each group goes

Writer → content-reviewer + voice-guardian → one fixer applies both → PR → CI green → merge into canary. Open one PR at a time: a second e2e run cancels the first. Writers keep copying the case setup into the worked example; tell them to list the graded questions first and make sure the example answers none of them.
