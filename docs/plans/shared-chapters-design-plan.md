# Sigmorai — Shared chapters

> Some chapters teach the same idea on two paths. Clear it on one path, and it shows as cleared on the other path too. You study it once and earn its XP once. Read end-to-end before any code; each phase is gated by explicit approval.

## Status

**STATUS: Approved 2026-10-07 (maintainer), devil pass applied. Build step: cross-cutting. Track: all (builder, strategist, creator; scientist later).**

**SCHEMA:** no schema change and no progress-row migration. Not `SCHEMA REVIEW REQUIRED` (see Data model). If the maintainer picks the rejected "concept id in the DB" option, it becomes `SCHEMA REVIEW REQUIRED`.

## Amendments

## Amendments locked 2026-10-07 (devil pass, maintainer approved)

These override the sections below where they disagree.

- **Direction (maintainer):** each path keeps its own chapter list; matching pairs give credit. No merged lesson files, no "related" pairs.
- **A cleared or credited exercise is always open.** `checkOpen` treats the exercise's own clear (or its crediting sibling) as open, so a credited chapter can be replayed even when the chapter before it is not done. Without this, DONE chapters showed "locked" on the quest page.
- **Credit is for the case only.** Lessons and quick checks differ per path and pay their own small XP. This drops the step-to-step mapping and the `completeLesson` change.
- **`recordClear` takes an `award` flag from the action** (`!replay`, decided by `readAttempts` inside the existing `users` row lock). No second progress read. A credited replay writes a progress row and no XP row (so "every progress row has its XP row" is no longer true; harmless).
- **Ship the 6 open-realm pairs.** The 3 advanced pairs (model graders, handoffs, rate limits) are added when the advanced tier opens.
- **Two PRs:** PR 1 `content` (list file, schema, `content:check` rules + walker whitelist, content-reviewer); PR 2 `quest` (credit + the "Cleared on the <Path> path" label in the chapter list only; no level-map tooltip, no quest-header label).
- **Drop the prod count query.** We never claw back, so the number changes nothing.
- **Wording:** revalidation uses `refresh()` / `updateTag`, not `revalidatePath`; `content/shared-chapters.json` is whitelisted in the content walker (`lib/content/validate.ts`), its file name lives in `lib/constants` next to `OUTLINE_FILE`.
- **Final list after `content-reviewer` (PR 1): 4 groups.** `token-costs` (covers, builder r0 c6 → strategist r0 c4), `structured-output` (covers, builder r1 c5 → strategist r1 c3), `few-shot-examples` (covers, builder r1 c2 → strategist r1 c2; not `same`, because the strategist lesson does not teach the builder case's "zero-shot first on reasoning models"), `mcp-basics` (same, builder r5 c1 ⇄ strategist r5 c2). `be-specific` and `multimodal-input` are **related only**: their cases and the strategist r1 boss test facts the sibling lesson does not teach. The PR 2 e2e golden path uses `token-costs`: clear builder r0 c6's case, and on strategist r0 c4 is DONE.
- **Pure helper shape:** one helper returns `{ cleared, creditedFrom }`; e2e uses `?track=` on the realm page, no track switch.

---

## Context

**The request** (maintainer, 2026-10-07): "The realms/chapters intersect between the paths (builder, strategist, creator, later scientist). Each path should only show the chapters relevant to that person, even if they intersect. If I finish a chapter in one path, it should be finished in the other one, so I don't study it twice."

**What is true today** (read from the code, 2026-10-07):

- **Content is per track.** `content/<track>/<realm>/<chapter>/` holds `lesson.mdx`, `case.json` and `quick-check.json`. All 3 tracks are full: 54 chapters + 9 bosses each, 162 chapters in total. Each track has its own `outline.json` with its own 6 chapter titles per realm.
- **The track is inside the exercise id.** `builder/r1/c1/challenge`, `strategist/r3/boss/challenge` (`lib/content/ids.ts`). Ids are forever: they are stored in `progress`, `submissions` and `xp_events` (`content/CLAUDE.md`).
- **`progress`** is one row per cleared exercise, key `(user_id, exercise_id)` (`db/schema/progress.ts`).
- **`xp_events`** is the XP ledger. Unique index `xp_events_award_once_idx (user_id, exercise_id, reason)` makes an award happen once per id (`db/schema/xp.ts`). Today a builder chapter and a strategist chapter have different ids, so both pay XP.
- **One "cleared" set drives every screen and every lock.** `buildTrackMap` (`lib/grading/track-map.ts`) and `decideOpen` (`lib/grading/open.ts`) take a `Set` of cleared ids. The map reads only the current track's rows (`clearedIds`, `lib/data/realms.ts`, `like '<track>/%'`).
- **Chapter order:** chapter N needs chapter N−1's case. The boss needs all 6 cases of its realm, **on its own track** (`requiredClears`).
- **Replay rule:** a cleared case or quick check is a replay. No HP cost, no submissions row, 0 XP (`decideSubmitStart`, `lib/grading/case.ts`; `readAttempts` checks the exact id).
- **`recordClear`** (`lib/grading/award.ts`) locks the `users` row `FOR UPDATE`, then writes progress, then the XP row. Every graded action already locks the user row first (`lockUser`), so one user's writes never run at the same time.
- **Certificates** come from one progress row: the realm's boss case, or Math floor 8 (`lib/grading/certificates.ts`).
- **Leaderboard** sums `xp_events` (week, month) or reads `users.xp` (all time).
- **Switching path** only changes `users.track` (`lib/actions/switch-track.ts`). Progress already stays per track.
- **Tiers:** realms 0–2 beginner and 3–5 intermediate are open. Realms 6–8 are advanced and locked for everyone today.
- **Math Tower and Frontier** ids have no track. They are already shared. This spec does not touch them.
- **The creator spec** says each path teaches shared ideas "from its own angle", and "the realms share names but the lessons and cases differ" (`docs/plans/creator-path-design-plan.md`). This spec keeps that.

## Purpose

A learner who switches path, or follows two paths, should not study the same idea twice. Example: Lena clears **Builder → Prompt Forest → "Be specific"**. Later she opens the **Strategist** path. There, **"Write a brief"** already shows as cleared, with the text "Cleared on the Builder path". She does not get its 150 XP again. The leaderboard stays fair, because one idea pays once.

## Measured overlap

**Method.** For every pair of chapters on two different tracks (162 lessons), I compared: the outline titles, the cited source URLs in the lesson frontmatter (anchors and trailing `/` removed), and, for the top pairs, the `##` section headings and word counts.

**Source overlap alone over-counts.** Many lessons cite the same general vendor pages (for example a vendor's "prompt engineering overview"). So 383 cross-track pairs share 2+ URLs, but most teach different things. I only call a pair a match when the concept, the goal and the sections match.

### Counts

| Kind                                                                                      | builder–strategist | builder–creator | strategist–creator | Total pairs | Chapters involved |
| ----------------------------------------------------------------------------------------- | -----------------: | --------------: | -----------------: | ----------: | ----------------: |
| **Same** (same idea, same depth: credit both ways)                                        |                  3 |               4 |                  0 |       **7** |                14 |
| **Covers** (one chapter teaches all of the other, and more: credit one way, deep → light) |                  2 |               0 |                  0 |       **2** |                 4 |
| **Related** (same topic family, different goal or case: no credit)                        |                  6 |              12 |                 11 |      **29** |                 — |
| No real overlap                                                                           |                  — |               — |                  — |           — |                 — |

- **18 of 162 chapters (11%)** get shared credit. No idea is shared by all 3 tracks today.
- **In open realms (0–5): 6 of the 9 pairs.** The other 3 (Model graders, Handoffs, Rate limits) are in advanced realms. They start to matter when the advanced tier opens.
- Strategist and creator share topics, but never at the same depth and goal. So they have **0** credit pairs.

### The 9 credit pairs (proposed)

| Concept id                                 | Kind                             | Chapter A                                | Chapter B                                    | Evidence                                                                               | Realm tier   |
| ------------------------------------------ | -------------------------------- | ---------------------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------- | ------------ |
| `be-specific` (amended: related only)      | same                             | builder r1 c1 "Be specific"              | strategist r1 c1 "Write a brief"             | 3 of 4 sources shared; same sections (new-colleague test, steps, what good looks like) | beginner     |
| `few-shot-examples`                        | covers (amended; deep = builder) | builder r1 c2 "Examples"                 | strategist r1 c2 "Give examples"             | 3 of 5 sources; same sections (how many, what good looks like, hidden patterns)        | beginner     |
| `multimodal-input` (amended: related only) | same                             | builder r0 c4 "Multimodal input"         | creator r0 c3 "Multimodal input"             | same title; 4 of 9 sources; images in a message, cost, vendor limits                   | beginner     |
| `mcp-basics`                               | same                             | builder r5 c1 "MCP basics"               | strategist r5 c2 "MCP in plain words"        | 6 of 8 sources; same sections (host, client, server; server primitives)                | intermediate |
| `model-graders`                            | same                             | builder r6 c2 "Model graders"            | creator r6 c3 "Model graders"                | same title; same sections (kinds of grader, biases, rubric, calibrate)                 | advanced     |
| `handoffs`                                 | same                             | builder r7 c2 "Handoffs"                 | creator r7 c3 "Handoffs"                     | same title; same sections (two ways to delegate, what the next agent sees)             | advanced     |
| `rate-limits`                              | same                             | builder r8 c1 "Rate limits"              | creator r8 c4 "Rate limits"                  | same title; 5 of 5 sources the same; ramp-up, retries                                  | advanced     |
| `structured-output`                        | covers                           | builder r1 c5 "Structured output" (deep) | strategist r1 c3 "Ask for structure" (light) | 4 of 6 sources; builder adds schema design and validation                              | beginner     |
| `token-costs`                              | covers                           | builder r0 c6 "Costs" (deep)             | strategist r0 c4 "Tokens = cost" (light)     | 4 of 10 sources; builder adds caching, batching and caps                               | beginner     |

**Amended after review (see Amendments):** the shipped list is 4 groups: `token-costs`, `structured-output`, `few-shot-examples` (all covers, builder deep) and `mcp-basics` (same). `be-specific` and `multimodal-input` are related only. The 3 advanced pairs wait for the advanced tier.

"Covers" means: clear the builder chapter, and the strategist chapter is cleared. Clear the strategist chapter, and the builder chapter is **not** cleared, because it teaches more.

### Related pairs (no credit, listed so nobody re-checks them)

- **builder–strategist (6):** Retrieval ↔ Knowledge bases · Model graders / Test sets ↔ Quality evals · Auth & trust ↔ Security review · Secrets & data ↔ AI policy · The loop ↔ What agents do · Grounded answers ↔ Hallucinations.
- **builder–creator (12):** Embeddings / Retrieval ↔ Asset search · Cost control ↔ Cost control · Shared state ↔ Shared state · Regression ↔ Regression · Batching ↔ Batch runs · Guardrails ↔ Safety checks · Agent graphs ↔ Roles · Launch ↔ Launch (same title, different content: fallback model vs go/no-go gate) · Models & limits ↔ Models & limits (same title: LLM limits vs media models) · Prompt caching ↔ Brand kits · Why tools ↔ Tools in chat · Permissions ↔ Human sign-off.
- **strategist–creator (11):** Quality evals / Define success ↔ Define quality / Rubrics · A/B pilots ↔ A/B tests · Lock-in ↔ Vendor lock-in · Review outputs ↔ Review outputs · Images & voice ↔ Multimodal input · Team structures ↔ Roles · What agents do ↔ Creative agents · Human in the loop ↔ Human sign-off · Total cost ↔ Cost per asset · Access & permissions ↔ Asset rights · Spot repetition ↔ Batch runs.

Why no credit: the two cases test different decisions. Example: strategist "Knowledge bases" asks "build or buy a hosted tool"; builder "Retrieval" asks about hybrid search and reranking. Clearing one does not prove the other.

**The final list is content work.** The `content-reviewer` agent checks every pair in PR 1 (see Phases).

## User-visible behavior

1. **Each path keeps its own chapter list.** Same 9 realms, own 6 chapters per realm, own titles, own lesson and case. Nothing moves and nothing is merged. A strategist never sees a builder chapter title in their list.
2. **Golden path.** Lena clears the case of builder r1 c1 "Be specific" (+150 XP). She switches to strategist on the profile page. On the strategist realm page, r1 c1 "Write a brief" shows **DONE**, with a small line under the title: **"Cleared on the Builder path"**. On the level map, the node is a done node. The realm's "cleared" count includes it.
3. **Step by step.** Credit goes step to step: builder lesson → strategist lesson, builder case → strategist case, builder quick check → strategist quick check. A chapter is DONE when its case is done (as today).
4. **She can still open it.** A credited chapter opens like any cleared chapter: the lesson can be read, the case and quick check are **replays** (no HP, 0 XP, full feedback after submit). This lets her see the other angle for free.
5. **Locks follow the credit.** Chapter N opens when chapter N−1's case is cleared **or credited**. The boss opens when all 6 cases are cleared or credited.
6. **The boss is never shared.** Each path's boss tests its own realm mix. To earn the strategist r1 certificate, Lena must pass the **strategist** r1 boss.
7. **"Covers" is one way.** Mo clears strategist r1 c3 "Ask for structure". On the builder path, r1 c5 "Structured output" is **not** credited, because it teaches schema design he has not studied. He plays it and earns its XP. If Mo had cleared the builder chapter first, the strategist one would be credited.
8. **XP shows once.** The case result on a credited chapter says `+0 XP` like any replay. The HUD and leaderboard never change from a credited chapter.
9. **Signed out / visitor:** no progress, so no credit. Unchanged.
10. **Copy:** the label is plain product voice, built from the track label ("Cleared on the Builder path"). No NPC line. It is text, not only a colour (a11y rule).

## Fairness and integrity check

| Way to fake progress                                      | How the design stops it                                                                                                                                                                                                                             |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Clear chapter A, then clear sibling B for a second 150 XP | Before the XP insert, the server checks: is this exercise already credited by a cleared sibling? If yes, it writes the progress row but **no XP row** (0 XP). Same rule the page uses to show DONE, so "shown as done" always means "pays nothing". |
| Submit A and B at the same moment (race)                  | Every graded action locks the `users` row `FOR UPDATE` first (`lockUser`, `recordClear`). One user's two submits run one after the other, so the second one sees the first one's progress row.                                                      |
| Client says "I cleared it on another path"                | The browser sends only an exercise id, seed and answer indexes, as today. The credit list is a server-side content file; the server reads it, never the request.                                                                                    |
| Skip a deep chapter by clearing a light one               | "Covers" links go deep → light only. A light clear never credits a deep chapter.                                                                                                                                                                    |
| Get a certificate without passing that path's boss        | Bosses are never in a group (content check rule). The certificate still needs that track's boss progress row.                                                                                                                                       |
| See a sibling's correct answers before clearing           | A credited case is a replay, so feedback after submit shows explanations. The learner already proved the idea on the other path and gets 0 XP, so this gives nothing. Correct answers still never reach the browser before submit.                  |
| Old double awards                                         | Learners who cleared both siblings before this ships keep both XP rows. The ledger is append-only and `amount > 0` is a CHECK, so we never claw back. PR 2 counts them once (read-only query) and reports the number.                               |

## Data model

**No schema change. No migration. No progress-row rewrite.**

- The groups live in **one content file**: `content/shared-chapters.json`. It lists concept groups. Each group has a concept id (kebab-case, e.g. `be-specific`), a kind (`same` or `covers`), and its member chapters as `<track>/r<N>/c<N>`. For `covers`, it names which member is the deep one.
- **Credit is computed, never stored** (db/CLAUDE.md invariant 5: computed, not stored). The server reads the user's real progress rows, then adds the credited sibling ids in memory. So:
  - **Existing prod rows work on day one.** A user who cleared builder r1 c1 last week sees strategist r1 c1 credited the moment PR 2 deploys. No backfill.
  - **Ids do not change.** Every row keeps its track id. Export (`/api/account/export`) still shows the real rows.
  - `users.xp` still equals the ledger sum (`bun run db:check` stays green): the change only skips some inserts.
- **XP once per concept:** the unique index `(user_id, exercise_id, reason)` stays as it is and still stops the same id paying twice. The sibling check is an app rule inside the user-row lock (see Fairness). It needs no new index.
- **Invariant 4 needs one new sentence** in `db/CLAUDE.md`: "Realm chapters in a `content/shared-chapters.json` group credit each other on read; the progress row keeps its own track id."

**Rejected option (would need `SCHEMA REVIEW REQUIRED`):** write a concept id such as `shared/be-specific/challenge` into `progress` and `xp_events`, so the unique index alone enforces "once". Why not: it breaks the id grammar, the old rows still carry track ids (so we would still need the sibling check, or a migration that rewrites real users' rows), and a wrong group would be stored forever. The computed way can be fixed by editing one JSON file.

## Content contract

- **Zod schema** for the file in `lib/types` (one place for schemas). `bun run content:check` validates it and fails the build when:
  - a member is not a valid realm chapter (`buildExerciseId` rejects it), or its `lesson.mdx`/`case.json`/`quick-check.json` is missing;
  - a member is a boss, a Math floor or a Frontier level (only realm chapters may be shared);
  - two members of one group are on the same track;
  - a chapter is in more than one group;
  - a `covers` group has no deep member, or more than two members.
- **Review rule** (added to `content/CLAUDE.md`): before a pair is added, `content-reviewer` checks that (1) the two lessons teach the same facts, (2) for `same`, each case can be answered from either lesson, and (3) the realm boss question that tests this chapter on each track uses only facts the sibling lesson also teaches. If (3) fails, the pair is `related`, not shared.
- **Editing a group later.** Adding a pair is safe. Removing one makes the credited chapter show "not done" again (no XP is lost, a passed boss stays passed). Remove only to fix a wrong pair, and say so in the PR.
- **Scientist path later:** add the scientist chapter as one more member of an existing group, or make a new group. No code change.

## API contract

No new action, route or input field. Existing actions change only inside the server:

| Place                                           | Change                                                                                                                             |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `checkOpen` (`lib/grading/open.ts`)             | Reads the required ids **plus the ids that can credit them**, adds the credit, then calls the pure `decideOpen` (unchanged).       |
| `readAttempts` (`lib/grading/attempts.ts`)      | `cleared` is true when the exact id **or a crediting sibling** has a progress row, so a credited case is a replay (no HP, no row). |
| `recordClear` (`lib/grading/award.ts`)          | Inside the existing user-row lock: if a crediting sibling has a progress row, insert progress, skip the XP row, `awarded = 0`.     |
| `clearedIds` / track map (`lib/data/realms.ts`) | Reads this track's rows plus the sibling-track rows of this track's groups, then adds the credit before `buildTrackMap`.           |
| `ChapterView` (`lib/types`)                     | One optional field: the track it was credited from, for the label. Pure data; the page never decides credit.                       |

Error codes: unchanged. `revalidatePath` targets: unchanged (a clear on one track already revalidates the realm pages; the other track's pages are dynamic and read fresh on the next visit).

## AI and cost

N/A. The mentor stays grounded in the current lesson's sources only. No model calls are added.

## States and transitions

- **Chapter states** stay `done · open · locked · tier-locked · soon`. A credited chapter is `done`. No new state.
- **Tier lock wins.** A credited chapter in a locked advanced realm still shows `tier-locked` (order of precedence in `stepStatus` is unchanged). The 3 advanced pairs show credit only when the tier opens.
- **Loading / empty / error:** unchanged. The credit is part of the same server read; if that read fails, the existing error state shows.
- **Mobile (360px):** the label is one short line under the chapter title and wraps. Keyboard and reduced motion: no new interaction.

## Phases

### Phase 1 — The list (PR 1, `content`)

**Goal:** the groups file exists, is checked, and is reviewed. No behaviour change.

**Files**

- `content/shared-chapters.json` _(new)_ — the 9 pairs above (or fewer, after review).
- `lib/types/…` _(modify)_ — Zod schema for the file.
- `lib/content/validate.ts` _(modify)_ — the `content:check` rules above, with `bun test` cases.
- `content/CLAUDE.md`, `db/CLAUDE.md` _(modify)_ — the review rule and the invariant 4 sentence.

**Verification**

- `bun run content:check`, typecheck, lint, test, build.
- `content-reviewer` on each pair (facts, cases, boss questions). Drop any pair that fails.

**Approval gate:** maintainer approves the final pair list.

### Phase 2 — Credit on the server (PR 2, `quest`)

**Goal:** a clear on one path credits the sibling: map, locks, replays and XP.

**Files**

- `lib/content/…` _(new)_ — pure helper: cleared ids → cleared + credited ids, and "which ids can credit this one". `bun test` covers `same`, `covers` (one way only), step-to-step mapping, and that bosses are never credited.
- `lib/grading/open.ts`, `lib/grading/attempts.ts`, `lib/grading/award.ts`, `lib/data/realms.ts` _(modify)_ — as in the API contract.
- `e2e/…` _(modify)_ — clear builder r1 c1 case → switch to strategist → r1 c1 is DONE → its case is a replay with +0 XP → strategist r1 c2 is open.

**Verification**

- typecheck, lint, test, build, `bun run test:e2e`.
- `bun run db:check` on the e2e branch after the flow (XP cache = ledger).
- Read-only query on prod (Neon, no writes): how many users already have XP for both members of a pair. Put the number in the PR.
- `cto` review (diff touches `lib/grading/**`: never skipped).

**Approval gate:** PR 2 merges into canary only together with PR 3, so learners never see an unexplained DONE.

### Phase 3 — The label (PR 3, `ui`)

**Goal:** a credited chapter says where it was cleared.

**Files**

- `lib/constants/ui-copy.ts` _(modify)_ — "Cleared on the {Path} path", built from the track label.
- realm page chapter list, level-map node tooltip/label, quest page header _(modify)_ — show the label when the field is set.

**Verification**

- `ui-ux-reviewer` and `voice-guardian` on the copy. Browser check at 360px and desktop: label wraps, text not colour-only.

**Approval gate:** maintainer checks it on the canary preview.

---

## Acceptance criteria

- [ ] Each path still lists only its own chapters and titles. No file under `content/<track>/` moves.
- [ ] Clearing a member's case shows every credited sibling chapter as DONE, with "Cleared on the <Path> path".
- [ ] A credited case or quick check is a replay: no HP cost, no submissions row, +0 XP.
- [ ] Clearing a sibling never writes a second XP row for the same concept and reason. `bun run db:check` stays green.
- [ ] `covers` credit works deep → light only.
- [ ] Chapter locks and boss locks accept credited cases. Bosses and certificates are never shared.
- [ ] A user who cleared chapters before the deploy sees credit with no migration.
- [ ] `content:check` fails on every bad group listed in Content contract.
- [ ] Math Tower and Frontier behave exactly as before.

## Risks

1. **A pair is less equal than it looks.** Then a learner skips something the other path's boss tests. Mitigation: the boss-question check in the review rule; drop doubtful pairs to `related`. A boss can still be failed and retried, so the cost is a retry, not a broken path.
2. **Old double XP stays.** Some users already earned XP on both members. We keep it (no claw-back). PR 2 measures it; it should be small, because few users play two paths.
3. **Chapter order can jump.** If only chapter 3 is credited, chapter 4 opens before chapters 1–2 are done. The boss still needs all 6, so the realm can't be finished early. Acceptable; noted so nobody reports it as a bug.
4. **Removing a pair un-credits chapters.** Visible as "not done" again. Rule: remove only to fix a wrong pair.
5. **The learner expected more credit.** 29 related pairs still need two studies. The table above is the honest answer; the maintainer can promote a pair after the lessons are rewritten to match.

## Out of scope

- Merging two lessons into one shared lesson file, or rewriting lessons to make more pairs match.
- Sharing bosses or certificates.
- Credit for `related` pairs, or partial XP.
- A "your other paths" overview page.
- Math Tower and Frontier (already shared).
- The scientist track itself.

## Calls I'm under 95% on

1. **What "only show the chapters relevant to that person" means.** Lean: each path keeps its own chapter list and lessons; overlap is shown as credit, not by moving chapters. Why: ids are forever and the creator spec wants each path's own angle. Other option: one shared lesson file shown on both paths; downside: rewrites ~18 lessons, loses the audience angle, and needs new ids.
2. **Computed credit vs a stored concept id.** Lean: computed from `content/shared-chapters.json`, no schema change. Why: works for old prod rows with no migration and can be fixed by editing JSON. Other option: concept ids in `progress`/`xp_events`; downside: `SCHEMA REVIEW REQUIRED`, a row migration on real users, and old rows still need the check.
3. **One-way `covers` links.** Lean: keep them (2 pairs). Why: builder "Structured output" teaches schema design that "Ask for structure" does not. Other option: drop the 2 pairs and keep only `same`; downside: a builder who switches studies the light version again.
4. **Strict pair list (9) vs a wider one.** Lean: strict, 9 pairs, final list after `content-reviewer`. Why: credit must mean "you would pass this case". Other option: also credit the 29 related pairs; downside: learners skip real decisions and fail bosses.
5. **XP check by progress row, not by XP row.** Lean: check the sibling's progress row inside the user-row lock. Why: it is the same fact the page uses to show DONE, and every progress row was written with its XP row. Other option: check `xp_events` by reason; same result today, one more query shape.
6. **Ship credit (PR 2) and label (PR 3) separately.** Lean: two PRs, merged to canary the same day. Why: small reviews; `lib/grading` changes always get the CTO review. Other option: one PR; downside: grading and UI review mixed in one diff.

## Open questions

- None that block Phase 1. The maintainer approves or trims the 9-pair list at the Phase 1 gate.

## Companion plans

- `docs/plans/curriculum-design-plan.md` — tracks, realms, chapter grammar.
- `docs/plans/creator-path-design-plan.md` — "own angle" rule for shared ideas.
- `docs/plans/quest-actions-design-plan.md` — open check, replay, award-once.
- `docs/plans/certificates-design-plan.md` — certificates come from boss rows.
