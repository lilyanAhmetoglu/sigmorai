# Sigmorai — Quest actions

> The contract for what happens when a learner presses a button on the quest page: Run, Submit, answer a case, answer a quick check. It fixes HP, XP, the run caps, the error codes and what the learner sees after each press. Read end-to-end before any code; each phase is gated by explicit approval.

## Status

**STATUS: Ready to implement (devil + db-architect passes applied). Build step: 5. Track: both. Tickets: SIG-18 (builder quest page), SIG-19 (strategist case + quick checks).**

## Amendments

## Amendments locked 2026-10-05 (no-code pivot)

Maintainer decision, final: **no learner writes code, on either track.** Sigmorai teaches how to design and use AI systems. Every chapter and every boss ends in a graded scenario case (option indexes, server-graded). This block replaces every Run / Submit / sandbox / runner part of the body below; the case and quick-check parts stay.

- **One graded step per chapter, both tracks: a case.** `submitCase` (chapter and boss) and `submitQuickCheck` are the only quest actions besides `completeLesson`. **`submitChallenge`, `POST /api/run`, the Run button and the Console tab are deleted.** Why: there is no code to run.
- **Builder cases use the same `case.json` shape as strategist cases.** Same schema, same grading, same HP rule. The tech track differs only in what the scenario is about. Why: one schema, one loader, one grader, one page.
- **`case.json` gets an optional `exhibit` (string, shown read-only in monospace): a trace, a tool schema, a prompt, a config.** Why: a design case nearly always shows something to judge; adding it before any content exists is free.
- **The exercise id keeps the segment `challenge`** (`builder/r0/c1/challenge`, `strategist/r3/boss/challenge`) and the XP reason stays `challenge` (+150) / `boss` (+500). Why: ids are forever, and the open check, `CHAPTER_STEPS` and `XP_REASONS` already use them. The word "challenge" never appears in learner-facing copy: the UI says **Case**.
- **No sandbox gate, no caps, no lock.** `users.sandbox_day`, `run_count`, `submit_count`, `sandbox_pending_at` are dropped (migration 0003, db-architect). `CAP_REACHED` and `RUN_IN_PROGRESS` are gone. Why: a case costs nothing to grade.
- **`submissions` is graded at insert.** `status` is `passed` | `failed` with no default; `graded_at` is dropped (it always equalled `created_at`) and `submissions_graded_check` goes with it; `results` becomes NOT NULL. HP spent today = `failed` rows since 00:00 UTC, served by the existing `submissions_user_exercise_idx`. Migration 0003 (db-architect approved 2026-10-05); 0002 is never edited.
- **Error codes: 7, not 9.** `UNAUTHENTICATED`, `NOT_ONBOARDED`, `INVALID_INPUT`, `TIER_LOCKED`, `NOT_OPEN`, `NO_HP`, plus **`SERVER_ERROR`** (replaces `RUNNER_FAILED`: "our side failed, nothing saved").
- **HP stays for cases:** 3 per case per UTC day, a wrong answer set costs 1, quick checks cost 0, replays cost 0 and earn 0, refill at 00:00 UTC, shown in the quest panel.
- **A case has 3–5 questions; each case question has exactly 4 options, one correct (exam style). Quick checks keep 2–6 options.**
- **The seeded shuffle stays.**
- **No `maxDuration` on the quest page.**
- **Phases A and B are closed.** Their shipped code is removed in one PR. The only open phase is **Phase C, now "cases + quick checks, both tracks"**.
- **Deleted from the body:** §Code execution, the child-pass token, the `[runner]` cost log, the E2B pricing to-do, the sandbox rows of §Fairness, the "Honest limit" note, `RUN_*` constants, the Run / Submit / cap rows of §States. The two-button "Design change" note is withdrawn: the case screen's one button, **Submit answers**, is the design.
- **Cost section: "No model call, no sandbox. Cost is zero."**
- **Acceptance list:** strike the bullets about hidden tests, `os._exit`, runner errors, caps, parallel calls and `[runner]` lines. Keep: no score or XP in any input; correct flags and explanations absent before submit; award once; a failed case costs 1 HP; `TIER_LOCKED` on every action; seed and order stored; a fail never shows the correct option; 360 px + keyboard; text + icon.

## Amendments locked 2026-10-05 (devil + db-architect pass)

The `devil` and `db-architect` reviewed the first draft. The maintainer approved their list. The body below is already edited to match; each line says what the first draft said and why it changed.

- **No `sandbox_runs` table.** The cap and the lock live on `users`: `sandbox_day`, `run_count`, `submit_count`, `sandbox_pending_at`. Why: one row per user is enough to count and to lock; a new table needed an index and a retention job for a log nobody reads yet. The cost log is now one console line.
- **The Submit cap is a counter (`submit_count`), not a count of `submissions` rows.** Why: the existing index does not serve that count, and case answers must not use up sandbox calls.
- **The one-at-a-time lock is kept** (maintainer call), as `users.sandbox_pending_at`, stale after `RUN_STALE_MS`, cleared after the runner on any outcome.
- **`submissions` gets a `status` column and loses `passed`.** First draft: an HP rule built from `passed` + `graded_at`. Why: an explicit state is easier to read and to check in SQL.
- **No signed attempt token.** First draft: an HMAC token, a new secret, a TTL and `BAD_ATTEMPT`. Now the page sends a random `seed` and the action re-shuffles from it. Why: the shuffle only stops shared answer letters; a learner who picks their own seed gains nothing, so signing it was cost without value.
- **9 error codes, not 12.** `NOT_FOUND` folds into `INVALID_INPUT`; the two cap codes become one `CAP_REACHED { kind }`; `BAD_ATTEMPT` is gone. `/api/run` keeps `error: string` and adds `code`, so the runner PR's shape stays.
- **Child-pass token goes over stdin and comes back as the last stdout line.** First draft: two private pipes. Why: same protection, simpler harness.
- **The streak rule is defined here** (`lib/xp/streak.ts`). Why: no other spec owned it.
- **Route is `app/(app)/quest/[...exercise]`. HP shows in the quest panel, not the HudBar** (the HUD shell already hides it).
- **`completeLesson` stays a contract only.** Its "Lesson done" button and page are SIG-11, not SIG-18/19.
- **3 phases, not 4.** The schema work moves into Phase A (Run). Phase A starts only after PRs #15 (content loaders) and #16 (code runner) are on `canary`.
- **Level start: LV 1** (maintainer, SIG-33). This spec does not define the curve.
- **Dropped:** the `lib/runner/fake.ts` change (dead), the retention job, the new index.
- **All 8 open questions resolved** as the draft's leans. See "Resolved 2026-10-05".

---

## Context

This is the "step-5 actions spec" that `curriculum-design-plan.md` points to (§Lock rules, §API contract). It defines `TIER_LOCKED` and the quick-check XP rule.

| Already in place                                                                                                                         | Where                                                                   |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `users` (xp cache, streak, lastActiveAt), `progress` (one row per cleared exercise), `submissions` (every attempt), `xp_events` (ledger) | `db/schema/*.ts` on `canary`                                            |
| Award-once unique index `(user_id, exercise_id, reason)` on `xp_events`                                                                  | `db/schema/xp.ts`                                                       |
| `XP_REWARDS` (lesson 10, quick-check 5, challenge 150, boss 500), `levelForXp`                                                           | `lib/constants/xp.ts`, `lib/xp/level.ts`                                |
| `isRealmOpen(tier)`, exercise id grammar                                                                                                 | `lib/content/curriculum.ts`, `ids.ts`                                   |
| Content schemas + public views (`toPublicChallenge`, `toPublicCase`, `toPublicQuickCheck`)                                               | PR #15 `feat/content-loaders` (`lib/types/content.ts`, `lib/content/*`) |
| Sandbox runner, `POST /api/run` (visible tests only), `RunResult`, nonce-protected harness, wiring checklist in `load-tests.ts`          | PR #16 `feat/code-runner` (`lib/runner/**`, `lib/types/runner.ts`)      |

This spec builds on those shapes. It does not redefine them.

Screens: builder quest and strategist case in `design/ui_kits/webapp/Sigmorai App.dc.html` (`isQuestTech`, `isQuestBiz`, the `+150 XP` toast). The design has no quick-check screen; it reuses the case layout.

**Level start:** a new player starts at LV 1 (maintainer, SIG-33). The curve lives in `lib/xp/level.ts`; level-up here uses whatever `levelForXp` returns.

## Purpose

The quest page is where XP is earned, so it is where cheating would happen. Today the runner can run code, but nothing grades it, costs HP or writes XP. This spec says exactly how a press becomes a grade, an HP change and an `xp_events` row, all on the server, so the leaderboard stays honest and the sandbox bill stays small.

## Decisions

1. **Two buttons: Run and Submit.** Run = free practice on the visible tests, through `POST /api/run`. Submit = the graded attempt, a Server Action, visible + hidden tests, costs 1 HP on a fail, writes `submissions` + `progress` + `xp_events`. Why: learners need a free way to try code; one button would make every typo cost HP.
2. **Daily caps and a one-at-a-time lock, on the `users` row.** Two counters (`run_count`, `submit_count`) reset by `sandbox_day`, and `sandbox_pending_at` as the lock. Why: Vercel functions share no memory, and the user row is already locked for HP.
3. **HP is spent before the runner, and refunded if the runner fails.** Why: a crashed function still costs HP (no free retries), but our own errors never punish the learner.
4. **`TIER_LOCKED` and `NOT_OPEN` are re-checked on Run and on Submit**, before any sandbox call or HP change.
5. **A child-pass token in the harness, and strict type checks in hidden tests.** Why: `os._exit(0)` today exits with code 0, which counts as a pass.
6. **Cases and quick checks: the browser sends option indexes only.** The page shuffles options from a random seed; the action re-shuffles from the same seed, maps each index back, and stores the order with the submission. XP once per exercise via the existing unique index.
7. **After Submit the learner sees per-test or per-question results.** Explanations appear only after submit. XP and level-up come from the server's answer, never from a client constant.
8. **Every sandbox call logs one line** (user, exercise, kind, status, ms). Run code is never stored.

## User-visible behaviour

### Builder challenge (golden path)

1. The learner opens `/quest/builder/r0/c1/challenge`. Left: lesson. Right: editor, `HP ■■■` in the challenge panel, test list, Console / Ask Mentor tabs.
2. They press **▸ Run tests**. The visible tests run. Each shows ✓ or ✗ with a short reason ("`location` is not required"). Console shows their `print` output. HP does not change.
3. They press **Submit**. Visible + hidden tests run. Hidden tests show as "Hidden test 1 · passed" with no detail.
4. All pass: the "LEVEL CLEARED · +150 XP" panel shows, the toast says "+150 XP · Quest cleared: Tokens", and the HUD XP updates. If the level went up, a second toast says "Level 4 reached".
5. One test fails: HP drops to `■■□`. The panel says "2 of 3 HP left today. Run is still free."

**Design change (noted, not silently amended):** the design has one button, "▸ Run tests". This spec adds a second, primary **Submit** button, and "▸ Run tests" becomes the secondary style. The design's "Claim & continue" adds XP on click; here XP is already written at Submit, so the button becomes **Continue** (navigate only). `DESIGN.md` is not edited. Maintainer to-do: re-export the quest screen in Claude Design with both changes.

### Strategist case (golden path)

1. `/quest/strategist/r0/c1/challenge` shows the scenario and 3 questions. Option order is shuffled for this attempt.
2. The learner picks one option per question and presses **▸ Submit answers**. Submit stays disabled until every question has an answer.
3. All correct: every option's explanation appears, then the same cleared panel and toast as the builder.
4. Some wrong: each question shows "Correct" or "Not quite" (text + icon, not colour only). For a wrong question, only the explanation of **the option they picked** appears. The correct option is not revealed. HP drops by 1.

### Quick check

Same flow as a case: 3 questions, all must be right, +5 XP once. **No HP cost.** Reset gives a new shuffle.

### Edge cases the learner can hit

| Situation                               | What they see                                                                                                         |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Run cap reached                         | "You used 40 of 40 runs today. Runs reset at 02:00 (your time)." Run disabled; **Submit still works** while HP lasts. |
| Submit cap reached                      | "You used 30 of 30 graded runs today. They reset at 02:00 (your time)." Cases and quick checks still work.            |
| HP at 0                                 | Submit disabled: "No HP left for this challenge. HP refills at 02:00 (your time)." Run, lesson and mentor still work. |
| A run is already going (second tab)     | "A run is already in progress. Wait for it to finish."                                                                |
| Runner timeout or sandbox error         | "The runner failed. No HP was used. Try again." HP unchanged.                                                         |
| One slow test (learner's infinite loop) | That test fails with "Timed out after 5.0s". This **is** graded and costs HP on Submit.                               |
| Exercise already cleared (replay)       | Graded as normal. "Cleared again · XP already earned." No HP cost, no XP.                                             |
| Advanced realm (06–08)                  | "ADVANCED · LOCKED — coming later." No button works.                                                                  |
| Chapter not open yet                    | "Clear chapter 2 first."                                                                                              |
| Signed out                              | Lesson readable. Run / Submit say "Sign in to run and submit."                                                        |

Times are computed on the server as a UTC instant (`resetsAt`). The browser formats it in local time.

## Fairness and integrity check

| Attack                                             | Stop                                                                                                                                                       |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Send `passed: true` or an XP amount                | Inputs are code, a seed or option indexes only (Zod `.strict()`). Amounts come from `XP_REWARDS`.                                                          |
| Replay a cleared exercise for XP                   | `insert … on conflict do nothing returning` on `xp_events_award_once_idx`. Zero rows back = no XP, no `users.xp` change.                                   |
| Retry Submit for free after a crash                | The `pending` submission is written before the runner. A crashed function leaves it `pending`, and `pending` counts as spent HP.                           |
| Two tabs submit at once to beat HP                 | The user row is locked (`select … for update`) while HP is counted, and `sandbox_pending_at` allows one sandbox call per user at a time.                   |
| Loop Submit on a cleared challenge (no HP cost)    | The Submit cap exists for exactly this: replays cost no HP, so without `submit_count` a cleared challenge would be a free sandbox loop.                    |
| `os._exit(0)` / `sys.exit(0)` before the test runs | Child-pass token (below). `sys.exit` is already a fail (`SystemExit` is caught).                                                                           |
| Return an object whose `__eq__` is always `True`   | Hidden tests check the exact type first (`type(result) is int`), using `type`/`isinstance` saved before learner code runs. `content-reviewer` checks this. |
| `print` inside the function to leak hidden inputs  | Submit returns **no stdout** and no detail for hidden tests. Console output exists only on Run (visible tests).                                            |
| Share "the answer is B"                            | Options are shuffled per attempt. Picking your own seed only re-orders options you can already read; it gains nothing.                                     |
| Learn the case answer from a failed attempt        | A fail reveals only which questions were wrong and why the picked option is wrong. The correct option shows only after a pass.                             |
| Get free Runs to test hidden tests                 | Run only ever loads `visibleTests` (`load-tests.ts`). Hidden tests and the solution never leave the server, even after a pass.                             |
| Make the harness error on purpose to get refunds   | An error returns no results, so nothing leaks. Errored calls still used a `submit_count` slot.                                                             |

**Child-pass token.** For each test, the parent makes a fresh random token and writes it to the child's **stdin**. The child reads it and closes stdin before the learner's code runs. It prints the token as the **last stdout line**, only after the test code finishes. Pass = exit code 0 **and** the last stdout line equals the token. The parent strips that line before the output reaches the learner. `os._exit(0)` never prints the token, so the test fails with "Exited before the test finished".

**Honest limit.** Learner code shares the child process, so deep Python tricks (frame or `gc` inspection) could still find the token. These defences stop the cheap tricks, not a determined attacker. `submissions.payload` keeps Submit code, so a suspicious leaderboard entry can be checked by hand.

## Data model

db-architect reviewed this (2026-10-05). One migration, no new table, no new index.

**`users`, 4 new columns**

| Column               | Type                                       | Notes                                                                           |
| -------------------- | ------------------------------------------ | ------------------------------------------------------------------------------- |
| `sandbox_day`        | `date` null                                | The UTC day the two counters belong to.                                         |
| `run_count`          | `integer not null default 0`, check `>= 0` | Runs used on `sandbox_day`.                                                     |
| `submit_count`       | `integer not null default 0`, check `>= 0` | Graded sandbox calls used on `sandbox_day`. Cases and quick checks don't count. |
| `sandbox_pending_at` | `timestamptz` null                         | The one-at-a-time lock. Stale after `RUN_STALE_MS`.                             |

**Sandbox gate** (Run and Submit, inside a short transaction):

1. `select … from users where id = $me for update`.
2. In code: if `sandbox_day` is not today (UTC), treat both counts as 0.
3. `sandbox_pending_at` set and younger than `RUN_STALE_MS` → `RUN_IN_PROGRESS`.
4. Count ≥ cap (`RUN_DAILY_CAP` or `SUBMIT_DAILY_CAP`) → `CAP_REACHED`.
5. Update: `sandbox_day = today`, count + 1, `sandbox_pending_at = now()`. Commit.
6. Call the runner **outside** the transaction.
7. Clear `sandbox_pending_at` on any outcome (pass, fail, timeout, error).

**`submissions`, one change**

- Add `status text not null default 'pending'`, check `status in ('pending','passed','failed','errored')`.
- Drop `passed`.
- Add check `(status = 'pending') = (graded_at is null)`.
- **HP spent** today on an exercise = rows since the UTC day start with `status in ('pending','failed')`. `errored` = refunded. `HP left = HP_PER_CHALLENGE − spent`, floored at 0. Computed, never stored (`db/CLAUDE.md` invariant 5). The existing `submissions_user_exercise_idx` serves this count.

**How the other tables are used (no change)**

- `submissions.payload`: builder `{ code }`; case / quick check `{ seed, answers: number[] /* original indexes */, order: number[][] /* display → original, per question */ }`.
- `submissions.results`: builder `{ status, tests: [{ name, passed, hidden }] }` (no detail, no stdout); case `{ questions: [{ correct: boolean }] }`.
- `progress`: `insert … on conflict do nothing` on pass.
- `xp_events`: reasons `challenge`, `boss`, `quick-check`, `lesson` (all exist in `XP_REASONS`).
- `users.xp += amount` only when the `xp_events` insert returned a row.
- **Streak** (`lib/xp/streak.ts`, `bun test` covered): advances once per UTC day on **any pass**, replays included. Same day as `lastActiveAt` → no change; the day after → +1; later → back to 1. `lastActiveAt = now()` on every pass.

**Cost log:** no table. Each sandbox call prints one line: `[runner] user=<id> exercise=<id> kind=run status=completed ms=1834`. No code, no output, no test names.

New constants (`lib/constants`): `HP_PER_CHALLENGE = 3`, `RUN_DAILY_CAP = 40`, `SUBMIT_DAILY_CAP = 30`, `RUN_STALE_MS` (`RUN_SANDBOX_TTL_MS` + slack), `SUBMISSION_STATUSES`.

## API contract

Error codes live in one Zod enum, `QuestErrorCodeSchema` in `lib/types/quest.ts`:

| Code              | When                                                                      | HTTP (`/api/run`) |
| ----------------- | ------------------------------------------------------------------------- | ----------------- |
| `UNAUTHENTICATED` | no Clerk session                                                          | 401               |
| `NOT_ONBOARDED`   | session but no `users` row                                                | 403               |
| `INVALID_INPUT`   | Zod fails, wrong step for this action, or no content file (stub chapter)  | 400 / 404 / 413   |
| `TIER_LOCKED`     | realm tier not in `OPEN_TIERS`                                            | 403               |
| `NOT_OPEN`        | chapter order not met                                                     | 403               |
| `NO_HP`           | 0 HP left on this exercise today (not cleared yet)                        | —                 |
| `CAP_REACHED`     | daily cap hit; carries `{ kind: 'run' \| 'submit', used, cap, resetsAt }` | 429               |
| `RUN_IN_PROGRESS` | a fresh `sandbox_pending_at` exists                                       | 409               |
| `RUNNER_FAILED`   | runner `timeout` / `error`, or setup failed. HP refunded.                 | 502               |

Server Actions return `{ ok: false, code, message, resetsAt? }`, never a raw throw. `/api/run` keeps its `{ error: string }` body and adds `code` and `resetsAt?`.

**Open check (one server-only helper, `bun test` covered).** In order: parse the id → the content file exists → `isRealmOpen(REALMS[realm].tier)` else `TIER_LOCKED` → chapter 1 is open; chapter N is open when chapter N−1's challenge has a `progress` row (same track); the boss opens after all 6 challenges. Inside an open chapter, the lesson, challenge and quick check are all open. Order is checked inside the exercise's own track, not against `users.track`. Math and Frontier ids join in step 6.

### `POST /api/run` (exists; this spec finishes it)

Input stays `RunBodySchema` `{ exerciseId, code }`. Steps: auth → onboarded → body → open check → sandbox gate (`kind: 'run'`) → `runCode` with `visibleTests` → clear the lock → log line → return `RunResult`. `RunResult` is unchanged: `{ status, tests, output, truncated }`. No HP, no XP, no `submissions` row. This closes the four `load-tests.ts` checklist items.

### `submitChallenge` (Server Action, `lib/actions/quest.ts`)

```ts
input:  { exerciseId: string /* …/challenge or …/boss/challenge, builder */, code: string /* ≤ RUN_CODE_MAX_CHARS */ }
output: { ok: true; passed: boolean; replay: boolean; hpLeft: number;
          tests: { name: string; passed: boolean; hidden: boolean; detail?: string /* visible only */ }[];
          xp: { awarded: number; total: number; levelBefore: number; levelAfter: number } | null }
      | { ok: false; code: QuestErrorCode; message: string; resetsAt?: string }
```

1. Transaction A (short): lock the user row; open check; if not cleared, `NO_HP`; sandbox gate steps 2–5 (`kind: 'submit'`); insert a `pending` submission. Commit.
2. Outside any transaction: `runCode` with `visibleTests + hiddenTests`. (A DB transaction must never stay open for 15 s.)
3. Runner `timeout` / `error`: set the submission to `errored` (`graded_at = now()`), clear the lock, return `RUNNER_FAILED`.
4. Transaction B: grade (pass = `status === 'completed'` and every test passed); set `passed` or `failed`; on pass insert `progress`, insert `xp_events` (`challenge` or `boss`) on conflict do nothing returning, add to `users.xp` only if a row came back, update the streak; clear the lock.
5. `revalidatePath('/', 'layout')` (HUD XP) and the quest page. Return.

The quest page sets `export const maxDuration = 30` (Server Actions take the page's limit).

### The shuffle seed

When the quest page renders a case or quick check, the server makes a random 32-hex `seed` and shuffles each question's options with a seeded shuffle. It sends the shuffled public view and the `seed`. Nothing is stored before submit. Signed-out readers get the same view, but no submit.

### `submitCase` and `submitQuickCheck` (Server Actions)

```ts
input:  { exerciseId: string; seed: string /* 32 hex */; answers: number[] /* display indexes, one per question */ }
output: { ok: true; passed: boolean; replay: boolean; hpLeft: number | null /* null for quick check */;
          questions: { correct: boolean; picked: { text: string; explanation: string };
                       options?: { text: string; explanation: string; correct: boolean }[] /* only when passed or replay */ }[];
          xp: { awarded: number; total: number; levelBefore: number; levelAfter: number } | null }
      | { ok: false; code: QuestErrorCode; message: string; resetsAt?: string }
```

One transaction: lock the user row → open check → answers length = question count, each index in range (`INVALID_INPUT`) → for `submitCase`, `NO_HP` unless cleared → re-shuffle from `seed` and map each display index to the original → grade (pass = all correct) → insert the submission as `passed` or `failed` with `{ seed, answers, order }` → on pass the same `progress` / `xp_events` / `users` / streak writes (reason `challenge` or `quick-check`) → revalidate. No sandbox, so no cap and no lock.

### `completeLesson` (Server Action, contract only)

`{ exerciseId: …/lesson }` → open check → `progress` + `xp_events` (`lesson`, +10) once, streak update. Same `xp` result shape. The "Lesson done" PixelButton and the lesson page are **SIG-11**. They are not in SIG-18/19 acceptance.

## AI and cost

No model call. The mentor tab is step 7. Cost is the sandbox only.

- Worst case per user per day: 40 Runs + 30 graded runs = 70 sandbox calls, each ≤ 15 s.
- Before launch, check the cost of one call on E2B's live pricing page and confirm the caps. Do not trust memory.
- Cost watching: grep the `[runner]` log lines (count, status, ms per user).

## Code execution

- Run: `visibleTests` only, stdout returned (capped at `RUN_OUTPUT_MAX_CHARS`).
- Submit: `visibleTests + hiddenTests` in one sandbox call, **no stdout returned**, hidden-test detail stripped on the server before the result leaves the action.
- Limits stay as in `lib/constants/runner.ts` (15 s wall clock, 5 s per test, 256 MB per test).
- Harness change (Phase A): child-pass token over stdin, as in §Fairness. A `bun test` proves a solution that calls `os._exit(0)` fails every test.
- Hidden-test authoring rule, added to `content/CLAUDE.md` in Phase A: check the exact type before comparing values.

## States and transitions

| State                    | Run button               | Submit button                      | Notes                                                |
| ------------------------ | ------------------------ | ---------------------------------- | ---------------------------------------------------- |
| Signed out               | "Sign in to run"         | "Sign in to submit"                | Lesson readable                                      |
| Idle, HP > 0             | enabled                  | enabled, "Costs 1 HP if it fails"  |                                                      |
| Running (either)         | disabled, "Running…"     | disabled                           | `aria-busy`, live region announces the result        |
| Result: fail             | enabled                  | enabled if HP left                 | ✗ + text per test; focus moves to the result heading |
| Result: pass, first time | enabled                  | becomes **Continue**               | Cleared panel + XP toast (+ level-up toast)          |
| Replay                   | enabled                  | enabled, "Practice · no HP, no XP" |                                                      |
| HP 0                     | enabled                  | disabled with refill time          |                                                      |
| Run cap hit              | disabled with reset time | enabled                            |                                                      |
| Submit cap hit           | enabled                  | disabled with reset time           |                                                      |
| Runner failed            | enabled                  | enabled                            | "No HP was used" message                             |
| Tier locked / not open   | hidden                   | hidden                             | Reason text + icon                                   |

- **HP lives in the quest panel** (`HP ■■□`, text + squares), not in the HudBar.
- **Mobile ≤ 390 px:** lesson stacks above the editor; Run and Submit sit side by side, each ≥ 44 px tall, wrap to two rows if needed.
- **Reduced motion:** toasts appear without the slide; the XP bar is segmented anyway.
- **Voice:** the cleared panel is product voice. The design's "The forge glows brighter" is lore outside a DialogBox, so it goes to `voice-guardian` (move it into the NPC's DialogBox or cut it).
- Pass/fail is never colour-only: ✓ / ✗ plus "passed" / "failed" text.

## Phases

**Phase A starts only after PRs #15 (content loaders) and #16 (code runner) are on `canary`.**

### Phase A — Run, finished (SIG-18, part 1)

**Goal:** the migration lands, and `/api/run` uses real content, checks tier and order, enforces the run cap and the lock, logs, and the harness has the child-pass token.

**Files**

- `db/schema/users.ts`, `db/schema/submissions.ts` _(modify)_, `drizzle/<n>_quest_actions.sql` _(generated)_
- `lib/constants/runner.ts`, `lib/constants/xp.ts` _(modify)_ — caps, `RUN_STALE_MS`, `HP_PER_CHALLENGE`, `SUBMISSION_STATUSES`
- `lib/types/quest.ts` _(new)_ — `QuestErrorCodeSchema`, action input/output schemas
- `lib/grading/open.ts` + test _(new)_ — the open check
- `lib/grading/sandbox-gate.ts` + test _(new)_ — day roll, lock, caps
- `lib/xp/hp.ts`, `lib/xp/streak.ts` + tests _(new)_
- `lib/runner/load-tests.ts`, `app/api/run/route.ts`, `lib/runner/e2b/harness.ts` + test _(modify)_
- `content/CLAUDE.md` _(modify)_ — hidden-test type rule

**Verification:** `bun test` (open check: tier, order, boss; HP refill at the UTC boundary, `errored` refunded; streak across midnight; `os._exit(0)` fails; run 41 → 429; two parallel runs → one 409); `bunx drizzle-kit check`; `bun run runner:smoke` against E2B once; typecheck, lint, build.

**Approval gate:** CTO review clean; maintainer runs it on a preview.

### Phase B — Builder Submit + quest page (SIG-18, part 2)

**Goal:** a builder can clear a challenge and see XP land.

**Files:** `lib/actions/quest.ts` (`submitChallenge`, `completeLesson` contract), `lib/grading/challenge.ts` + test, `app/(app)/quest/[...exercise]/page.tsx` (+ loading/error; a catch-all, because exercise ids contain `/`), `components/quest/*` (buttons, HP, test list, cleared panel), `Toast` use.

**Verification:** `bun test` (award once; replay gives 0 XP and no HP cost; runner error refunds HP; hidden detail and stdout never in the result; submit 31 → `CAP_REACHED`); Playwright with `CODE_RUNNER=fake` (fail → HP 2; pass → +150 in the HUD); browser check at 360 px.

**Approval gate:** CTO review; `ui-ux-reviewer`; `voice-guardian` on the new copy.

### Phase C — Strategist case + quick checks (SIG-19)

**Goal:** a strategist can clear a case, and every chapter's quick check works.

**Files:** `lib/grading/shuffle.ts` + test (seeded shuffle, index mapping), `lib/actions/quest.ts` (`submitCase`, `submitQuickCheck`), `components/quest/answer-*` + `use-answers.ts` (one form for cases and quick checks).

**Verification:** `bun test` (same seed → same order; different seeds → different orders; a fail never returns the correct option; quick check costs no HP; cases never touch `submit_count`); Playwright strategist flow.

**Approval gate:** CTO review; maintainer clears strategist 0 c1 on a preview.

---

## Acceptance criteria

SIG-18 and SIG-19 only. The lesson button is SIG-11.

- [ ] No Server Action or route takes a score, pass flag, XP amount or level as input (grep the Zod schemas).
- [ ] Hidden tests, `solution`, `correct` flags and explanations are absent from every client payload before submit (test on the page props and action results).
- [ ] Submit returns no stdout and no hidden-test detail.
- [ ] A solution with `os._exit(0)` fails every test (harness test).
- [ ] Clearing an exercise twice writes one `xp_events` row; `bun run db:check` passes.
- [ ] A failed Submit costs exactly 1 HP; a runner error or timeout costs 0; HP is back to 3 after the UTC day boundary.
- [ ] With 0 HP, Submit returns `NO_HP` and starts no sandbox.
- [ ] Run 41 in a UTC day returns `CAP_REACHED { kind: 'run' }` with `resetsAt`; Submit still works.
- [ ] Submit 31 in a UTC day returns `CAP_REACHED { kind: 'submit' }`; cases and quick checks still work.
- [ ] Two parallel sandbox calls by one user: one gets `RUN_IN_PROGRESS`. A lock older than `RUN_STALE_MS` does not block.
- [ ] An advanced-realm exercise returns `TIER_LOCKED` on Run and on every action, with no sandbox call and no HP change.
- [ ] Case option order differs between two seeds (seeded test), and the stored submission has the seed and order.
- [ ] A failed case never shows the correct option; a pass shows every explanation.
- [ ] Every sandbox call prints one `[runner]` line with status and ms; no code in it.
- [ ] Every state in §States works at 360 px and by keyboard; pass/fail is text + icon.

## Out of scope

- The XP level curve (SIG-33 sets LV 1), leaderboard (step 6), Math Tower and Frontier quick checks (step 6 extends the open check), the mentor tab (step 7).
- The "Lesson done" button and the lesson page (SIG-11).
- Paid HP refills (never: no dark patterns), entitlements and the paywall.
- A runs table, a retention job, an admin cost dashboard.
- Languages other than Python; a custom E2B template.
- Full isolation against deliberate Python introspection (see Honest limit).

## Resolved 2026-10-05

The first draft's 8 open questions. The maintainer approved every lean.

1. **Quick check costs no HP.** It is a +5 XP self-check.
2. **A failed case shows only the picked option's explanation**, never the correct option. Otherwise the second attempt is free.
3. **Chapter-level open:** chapter N opens when chapter N−1's challenge is cleared; all 3 steps inside an open chapter are open.
4. **Caps: 40 Runs and 30 graded runs per user per UTC day.** Still check live E2B pricing before launch.
5. **The lesson +10 XP trigger is a "Lesson done" button**, built in SIG-11.
6. **A crashed function keeps its HP spent** (the submission stays `pending`). Refunding it would open free retries.
7. **The streak counts any pass, replays included.** It gives no XP.
8. **HP comes from the `submissions.status` column**, not a rule over `passed` + `graded_at`.

## Maintainer to-dos

- Re-export the builder quest screen with **Run** (secondary) + **Submit** (primary) and **Continue** instead of "Claim & continue". Same for the case screen's button.
- Add a quick-check screen (or confirm it reuses the case layout) and the "Lesson done" button (SIG-11).

## Companion plans

- `docs/plans/curriculum-design-plan.md` — tier lock, chapter order, quick-check shape.
- `docs/plans/knowledge-base-design-plan.md` — sources the lesson cites (no change here).
