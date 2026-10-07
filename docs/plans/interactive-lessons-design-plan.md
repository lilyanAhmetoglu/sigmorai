# Sigmorai — Interactive lessons (SIG-50)

> The contract for making a lesson feel like a game step, not a blog post: short steps with Continue / Back, small ungraded "Try it" checks, and two small visual widgets. No grading, no XP and no schema change. Read end-to-end before any code; each phase is gated by explicit approval.

## Status

**STATUS: Substantive stub (draft for review). Build step: cross-cutting. Track: all (builder, strategist, creator, Math Tower, Frontier). Ticket: SIG-50 (maintainer, 2026-10-06).**

Before Phase 1 starts: maintainer approval of this spec, the `devil` gate, and **design sign-off** (see Design source below).

## Amendments

## Amendments locked 2026-10-07 (devil pass, maintainer "go with your lean")

These override the sections below where they disagree.

- **No step-in-URL and no saved "Show all".** Reload opens step 1; "Show all" lasts for the visit. Why: both forced an inline script that must parse the hash; no lesson uses `#` links.
- **No inline anti-flash script.** The server renders step 1 visible and the rest `hidden`; one `<noscript><style>` un-hides the steps and hides the controls. Why: no flash and no JS in a string. A static CSP already ships (`lib/security/headers.ts`); the Risks line "none today" was wrong.
- **Try it no-reuse rule = exact match after normalising** (lowercase, digits and punctuation out, spaces collapsed) of the question against every graded prompt, and of the right option against every graded correct option, in all of `content/`. The Jaccard 0.6 rule is dropped (false positives, untuned number). `content-reviewer` catches paraphrases.
- **Component rules live in `lessonBodyProblems`** (`lib/content/mdx.tsx`), so the page and `content:check` share one check. `validate.ts` holds only the cross-file no-reuse rule.
- **No `next/dynamic`, no `lazy.tsx`, no chunk-load error boundary.** Widgets import directly; the error box is for a bad prop only. The acceptance line "their JS loads only on lessons that use them" is removed. Why: two tiny widgets.
- **Reuse `postHeadings`** (`lib/content/blog.ts`) for the step list and `QUEST_TEXT.continue` for the button. New copy keys: `stepBack`, `finish`, `showAll`, `showSteps`, `stepLabel`, `stepAnnounce`.
- **Finish focuses the "Lesson done" panel** by a fixed id on `.lesson-done` (its first button or link).
- **Token estimate maths** lives in `lib/utils/token-estimate.ts` (pure, `bun test`).
- **Phases 2–3 wait for the per-path curriculum P0** (each track gets its own realm list and chapter counts) and name pilots by exercise id, not folder path. Phase 1 may land first: it touches no content files.
- **Design:** derived from the current lesson screen and tokens (no Claude Design pass was available). The `ui-ux-reviewer` pass on the Phase 1 preview stands in for design sign-off until the maintainer reviews it.
- Acceptance lines on the URL hash, saved Show-all and the inline script, and the inline-script Risk, are void. Show all/Show steps is a label-swap button (no aria-pressed); the live region says 'Step n of N' and 'All N steps shown.'; the last button reads 'Go to Lesson done'. (Phase 1 review: a step move focuses the step's `<section>`, named by its `##` heading, so Back to step 1 includes the intro; the step bar uses the page's realm accent; hidden steps use `hidden="until-found"` where the browser supports it, so find-in-page opens the matching step. This replaces the Risks line "left for later".)

---

## Context

What is in place on `canary` today:

- **The lesson page.** `app/(app)/quest/[...exercise]/page.tsx` → `LessonPage`. Title and minutes, then LESSON | SOURCES tabs (`components/tabs.tsx`) on the left, the "Lesson done" panel (`components/quest/lesson-done.tsx`) on the right. Spec: `quest-actions-design-plan.md`, block "Amendments locked 2026-10-05 (lesson page, SIG-11)".
- **The body renderer.** `components/quest/lesson-body.tsx` (server) calls `renderLesson` in `lib/content/mdx.tsx`. MDX is compiled on the server at request time. The body rules are strict: starts at `##`, no `import`/`export`, no `{…}` expressions, a tag allowlist, and one allowed component, `<DialogBox>`. `bun run content:check` compiles every body with the same rules.
- **The content.** 170 lesson files: 54 builder, 54 strategist, 54 creator (162 realm chapters) and 8 Math Tower floors. Every lesson has 5 to 10 `##` sections (most have 7 or 8). A lesson is 590 to 1,110 words (median about 870), so one section is about 110 words. 62 lessons have a short intro paragraph before the first `##`. 114 lessons end with `## Key points`.
- **No lesson uses `<DialogBox>` today.** The component is allowed, but no lesson file has one.
- **Primitives to reuse.** `XPBar` (segmented pixel progress bar, `role="progressbar"`), `Choice` (radio row with a correct / wrong mark as colour AND icon + word), `PixelButton`, `Panel`, `Badge`. Segment math: `lib/xp/segments.ts` (`filledSegments`).
- **Motion tokens.** `--dur-3` (240 ms, "panel in"), `--ease-snap` for UI, `--ease-pixel` (steps) for bars. Motion is used only under `prefers-reduced-motion: no-preference` (see `level-map.css`, `landing.css`).
- **Next.js 16 lazy loading** (`node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md`): `next/dynamic` code-splits a Client Component only when the `dynamic()` call sits inside a Client Component. A Server Component that dynamically imports a Client Component gets no split.
- **No flash before hydration** (`…/02-guides/preventing-flash-before-hydration.md`): an inline script placed right after an element runs before first paint and can set client-only state (here: steps on, or the saved "show all" choice).

### Design source

The ticket asks for a Claude Design pass on the lesson screen first. **That pass is not available in this session.** So this spec derives the lesson screen from the existing design (`design/ui_kits/webapp/Sigmorai App.dc.html` → `isQuestTech`, `tabLesson`) and the tokens in `design/tokens/`. It adds no new colour, font, radius or shadow.

**This needs maintainer design sign-off.** The gate is the Phase 1 Vercel preview, checked at 360 px and desktop. If a Claude Design screen for the stepper arrives later, `design/` wins (DESIGN.md) and we amend this spec.

## Purpose

Today a lesson is one long page of text. On a phone it feels like a blog post, and there is nothing to do until the case. This feature cuts each lesson into short steps the learner moves through one at a time. It adds a few small "Try it" checks to test yourself (no XP), and two small widgets that show an idea with numbers you can change. It is for every learner on every track. The outcome: the same lessons, the same facts, but they feel like part of the game.

## Decisions

1. **Steps come from the existing `##` sections.** No rewrite of 170 lessons. The server groups the body into one step per `##` section. The intro (text before the first `##`), when there is one, joins step 1. Example: the Tokens lesson (`builder/r0/c1`) has 7 sections, so it shows 7 steps.
2. **A client stepper shows one step at a time.** Continue and Back buttons, and a progress bar ("STEP 3/7"). A "Show all" toggle shows every step as one page, for people who want to read straight through.
3. **No JavaScript means all steps are visible.** The server sends every step in the HTML. The stepper hides steps only after it knows JS runs.
4. **`<TryIt>` is an optional MDX component.** One question, 2 or 3 options, instant feedback, a short "why". It is **ungraded**: no XP, no HP, no server call, nothing stored. Its answer is in the page source, so it must never reuse a case or quick-check question (`content:check` rule).
5. **Two widgets in v1:** `<TokenCounter>` and `<ContextWindowBar>`. Small client components, loaded lazily, used as MDX components. The agent-loop stepper and the cosine-similarity slider come later.
6. **No DialogBox change.** NPC moments are content work for a later ticket.
7. **No schema change, no new XP, no new server action.** "Lesson done" stays the one explicit button (+10 XP once). The stepper never calls it and never gates it.

## User-visible behavior

### Golden path (phone, 360 px)

1. The learner opens `/quest/builder/r0/c1/lesson`. They see the back link, the tag, the title, "7 min", and the LESSON | SOURCES tabs, as today.
2. Inside the LESSON tab, above the text: a progress bar `STEP 1/7` (segmented, one cell per step) and a small text button **Show all**.
3. Below it: step 1 only. That is the intro plus the section "What a token is".
4. Under the step: **Back** (secondary, disabled on step 1) and **Continue** (primary). Both are at least 44 px tall. Under `sm` they share one row, half width each.
5. The learner taps **Continue**. Step 2 shows. The page scrolls to the top of the step. Focus moves to the step's `##` heading. A screen reader hears "Step 2 of 7: Why tokens matter for a system design". The bar shows `STEP 2/7`.
6. A step can end with a **Try it** box. The learner taps an option. The box marks it right or wrong (colour AND icon + word, as `Choice` does) and shows the "why" line. A **Try again** button clears it. Continue never waits for a Try it answer.
7. On the last step (usually "Key points"), **Continue** becomes **Finish**. Finish moves focus to the "Lesson done" panel and scrolls it into view (on a phone the panel sits under the lesson). It does not mark the lesson done. The learner still presses **Lesson done** to earn +10 XP, as today.

### Desktop

Same stepper, inside the left column. The "Lesson done" panel stays sticky on the right, so the learner can press it at any step. Nothing new is sticky.

### Show all

- **Show all** shows every step as one long page (today's view), with no Back / Continue. The button then reads **Show steps** (a label swap, no `aria-pressed`). The live region says "All N steps shown." or "Step n of N".
- The choice lasts for the visit only. Nothing is saved, in the browser or on the server.
- Going back to steps keeps the step the learner was on.

### Where you are

- The step is kept in the URL hash as the step heading's id (the same `headingId` the blog uses). Continue and Back use `history.replaceState`, so they add no browser-history entries. A reload, or a link to `#why-tokens-matter-for-a-system-design`, opens that step.
- An unknown hash opens step 1.

### Try it (ungraded)

- Title strip: `TRY IT · NO XP`. Then the question in plain product voice, then 2 or 3 options.
- Tap an option: instant mark and the "why" text. No network request.
- **No JS:** the options show as a list and the answer sits in a `<details>` "Show answer" element under them. With JS, picking an option opens it.
- Never in the story voice. Never says "correct answer for the case".

### Token counter (widget)

- A text box (label "Text"), prefilled with the author's sample.
- Under it, live: characters, words, and two estimates: "≈ N tokens (4 characters per token)" and "≈ N tokens (0.75 words per token)". A fixed note: "A rough rule for English. The real count depends on the model's tokenizer."
- Empty box: "Type or paste text to see an estimate."
- Input is capped (20,000 characters). Over the cap the box stops taking text and says so.
- Pure browser maths. **No API call** (the token counting endpoint needs a key and has its own rate limit).

### Context window bar (widget)

- A segmented bar: one run of cells per part (for example System prompt, History, Tool definitions, Output), plus the free space.
- Next to it, a list with every part's label and token number, the total, the window and "free" or "over by N". The list is the text alternative; the bar itself is `aria-hidden`. Parts differ by colour AND by label, never by colour only.
- One part may be adjustable with a slider (for example "History"). Moving it updates the bar and the list.
- Over the window: the total turns into a danger badge with the word "OVER" and the number. The widget states no vendor behaviour (no "the API errors"); the lesson text does that, with a source.

### Edge cases

- **A lesson with fewer than 3 steps:** no stepper. It renders as today.
- **Blog posts:** never stepped, no Try it, no widgets. They keep plain Markdown.
- **Frontier lessons** have no NPC. They still get the stepper, Try it and widgets (lesson kind, not NPC, decides). No `<DialogBox>` there, as today.
- **The SOURCES tab:** switching tabs keeps the step (the tab panel stays mounted).
- **Find in page (Ctrl+F)** cannot see hidden steps. Show all fixes this; noted under Risks.
- **A widget fails to load:** its error box says "This widget did not load. The lesson text has the same numbers." The rest of the lesson works.
- **Signed out:** works the same. Lessons are public; nothing here needs a session.

## Fairness and integrity check

What could go wrong, and how the design stops it:

- **Try it answers leak into the source.** True, by design: the options, the right one and the "why" are in the HTML. Fine, because Try it is worth nothing. The risk is a Try it that is really a graded question. Stopped by the `content:check` rule below and by `content-reviewer`.
- **`content:check` rule (deterministic).** For every `<TryIt>`, compare its question with every graded question prompt in `content/` (all `case.json`, boss `case.json` and `quick-check.json` files). Normalise both: lower case, drop digits and punctuation, split into words. Fail when the question equals a graded prompt, or when the word overlap (Jaccard) is 0.6 or more. Also fail when the Try it's right option equals the correct option text of any graded question in the same chapter. Example: the quick check asks "About how many tokens is a 600-word English text…". A Try it "About how many tokens is a 900-word English text…" has the same words without the digits, so it fails.
- **`content-reviewer` rule (judgment).** A Try it must not be a graded question with new numbers or new names, and must not walk the learner through a case scenario. It checks the lesson's own facts, phrased as a new situation.
- **No XP path.** Try it and widgets call no Server Action and no route handler. They write nothing. `xp_events` is untouched. "Lesson done" is unchanged and is never pressed for the learner.
- **The token counter as a calculator.** The c1 quick check asks for a word-to-token estimate. The counter applies the same rule the lesson already teaches with a worked example. A learner can do this with any calculator. Accepted; the quick check is +5 XP and tests whether you know the rule.
- **No answers from graded content reach the page.** The stepper only regroups the lesson body. It reads no `case.json` or `quick-check.json`.

## Data model

N/A. No table, column or migration. The "Show all" choice is per-browser `localStorage` only.

## API contract

N/A. No Server Action, no route handler, no `revalidatePath`. The only server work is the MDX compile, which already exists.

**MDX surface (the authoring contract).** Every prop is a plain string attribute, because `{…}` expressions stay banned. `content:check` validates each component's attributes and children with a Zod schema in `lib/types`. The renderer parses the same schema; a bad prop renders the widget's error box, never a crash.

```mdx
<TryIt question="A support article is 3,000 characters of English. About how many tokens is it?">
  <Option>About 300</Option>
  <Option correct>About 750</Option>
  <Option>About 3,000</Option>
  <Why>1 token is about 4 characters in English, so 3,000 ÷ 4 = 750.</Why>
</TryIt>

<TokenCounter sample="Hello, Claude" />

<ContextWindowBar window="128000">
  <Part label="System prompt" tokens="2000" />
  <Part label="History" tokens="40000" adjustable max="140000" />
  <Part label="Tool definitions" tokens="3000" />
  <Part label="Output" tokens="4000" />
</ContextWindowBar>
```

Rules `content:check` enforces:

- `<TryIt>`: `question` required (≤ 200 characters); 2 or 3 `<Option>` children; exactly one `correct`; exactly one `<Why>`; options have no nested components. `<Option>` and `<Why>` only inside `<TryIt>`. At most one Try it per step, and at most 4 per lesson.
- `<TokenCounter>`: `sample` optional (≤ 500 characters). At most one per lesson.
- `<ContextWindowBar>`: `window` a whole number from 1,000 to 10,000,000; 1 to 5 `<Part>` children, each with `label` (≤ 30 characters) and whole-number `tokens`; at most one `adjustable` part, which needs `max`. At most one bar per lesson.
- A widget's numbers are **examples**, not facts about a named model. No model name in a widget prop. Example: `window="128000"` with the lesson text saying "a model with a 128k window", not "Claude X has 128k". Real limits go in the lesson text, with a source, so docs-sync can catch them going stale.
- All of these are allowed in lesson bodies only. Blog bodies keep `NO_COMPONENTS`.

## AI and cost

N/A. No model call. The token counter uses the rule of thumb from the lesson's sources, in the browser. The mentor is untouched.

## States and transitions

| Thing              | Loading                                       | Empty                                      | Error                                | Success                          |
| ------------------ | --------------------------------------------- | ------------------------------------------ | ------------------------------------ | -------------------------------- |
| Stepper            | Server HTML: all steps (no JS) or step N (JS) | Fewer than 3 steps: plain body, no stepper | N/A (no fetch)                       | One step, bar, Back and Continue |
| Try it             | Server HTML with `<details>` answer           | N/A (schema needs options)                 | N/A (no fetch)                       | Mark + why, Try again            |
| Token counter      | Server HTML with the sample's numbers         | "Type or paste text to see an estimate."   | Error box (chunk failed or bad prop) | Live numbers                     |
| Context window bar | Server HTML with the starting numbers         | N/A (schema needs a part)                  | Error box (chunk failed or bad prop) | Bar + list, slider live          |

- **Mobile width.** Everything fits at 360 px with no page scroll sideways. The bar's cells shrink; the list wraps. Back / Continue share one row.
- **Keyboard only.** Back, Continue, Finish, Show all, the options, Try again, the text box and the slider are real buttons and inputs, in reading order. The 3 px Spark focus ring. No new keyboard shortcuts (they would clash with screen readers).
- **Screen readers.** The progress bar is `XPBar` (a named `progressbar`). A polite live region says "Step 3 of 7: <heading>" after a move. Focus goes to the new step's heading (`tabIndex=-1`).
- **`prefers-reduced-motion: reduce`.** No step animation and instant scroll. With motion allowed: the new step comes in over `--dur-3` with `--ease-snap`, and the bar fills with `--ease-pixel`. Never a smooth fill.
- **No JS.** All steps visible, no Back / Continue / Show all, Try it answers in `<details>`, widgets show their starting numbers.
- **Signed out.** Same as signed in. "Lesson done" keeps its current signed-out state.
- **Locked lesson.** Unchanged (`QuestNotice`).

## Phases

Three PRs into `canary`. Each one ships alone and is useful alone. Each one needs the `devil` gate before build, `cto` review before commit, and `ui-ux-reviewer` after build (ticket).

### Phase 1 — Step through a lesson (PR 1, `feat/lesson-stepper`, scope `quest`)

**Goal:** every lesson with 3+ sections shows one step at a time, with Continue / Back, a progress bar and Show all. No content change.

**Files**

- `lib/content/mdx.tsx` _(modify)_ — a remark step that runs **after** the body rules and groups top-level nodes into one step per `##` (intro joins step 1). Authors cannot write the step element themselves: the rules run first and refuse it.
- `components/quest/lesson-body.tsx` _(modify)_ — take the body kind (lesson or blog) instead of guessing from `npc`; lessons get steps, blog posts don't.
- `components/quest/lesson-stepper.tsx` _(new, client)_ — step state, Back / Continue / Finish, Show all, the hash, focus and live region. Reuses `XPBar`, `PixelButton`.
- `app/styles/components/lesson.css` _(modify)_ — step, controls and motion styles. Tokens only.
- `lib/constants/ui-copy.ts` _(modify)_ — new `QUEST_TEXT` lines (Continue, Back, Finish, Show all, Show steps, the step label, the live-region text).
- `lib/content/*.test.ts` _(new or modify)_ — grouping: intro, 1 section, 10 sections, `##` inside a code block is not a step.
- `e2e/quest-loop.spec.ts`, `e2e/a11y.spec.ts` _(modify)_ — Continue to the last step, Finish, Lesson done; axe on the stepped lesson.

**Verification**

- `bun run typecheck`, `lint`, `test`, `build`, `content:check`, `test:e2e`.
- Browser at 360 px and desktop: steps, Show all, reload on a hash, JS disabled (all steps visible), reduced motion on.
- `ui-ux-reviewer` on the preview.

**Approval gate:** the maintainer signs off the stepper design on the PR 1 preview (this replaces the missing Claude Design pass for v1).

---

### Phase 2 — Try it (PR 2, `feat/lesson-try-it`, scope `quest`; content in a separate `content/` PR if the maintainer prefers)

**Goal:** authors can add ungraded Try it checks; two pilot lessons use them.

**Files**

- `components/quest/try-it.tsx` _(new, client)_ — the box; reuses `Choice` for the options and the marks.
- `components/quest/lesson-body.tsx` _(modify)_ — map `TryIt`, `Option`, `Why`. The server turns the MDX children into plain props (options, which one is right, why) before the client box gets them.
- `lib/content/mdx.tsx` _(modify)_ — add the three names to the lesson component allowlist; nesting rules.
- `lib/types/content.ts` _(modify)_ — Zod schemas for the Try it props.
- `lib/content/validate.ts` _(modify)_ — the no-reuse rule (exact and Jaccard ≥ 0.6, across all graded prompts) and the right-option rule. Tests for both.
- `content/CLAUDE.md` _(modify)_ — the Try it authoring rules and the no-reuse rule.
- `content/builder/00-bootstrap-village/c1/lesson.mdx`, `content/strategist/00-bootstrap-village/c4/lesson.mdx` _(modify)_ — one or two Try it each (pilot).

**Verification**

- All checks as in Phase 1, plus a `content:check` test that a copied quick-check prompt fails.
- `content-reviewer` on the two pilot lessons (every Try it fact traced to a cited source). `voice-guardian` on the Try it lines (plain voice, no lore).
- `ui-ux-reviewer`. Browser with JS off: the `<details>` answer works.

**Approval gate:** the maintainer is happy with the pilot Try it boxes before more lessons get them.

---

### Phase 3 — Two widgets (PR 3, `feat/lesson-widgets`, scope `quest`)

**Goal:** `<TokenCounter>` and `<ContextWindowBar>` work as MDX components and load only on lessons that use them.

**Files**

- `components/quest/widgets/token-counter.tsx`, `context-window-bar.tsx` _(new, client)_.
- `components/quest/widgets/lazy.tsx` _(new, client)_ — the `next/dynamic` loaders. They must sit in a client file, or Next does not split the code. Each widget has an error boundary with the error box.
- `lib/xp/segments.ts` _(reuse)_ — the bar's cell maths. **A second bar component, on purpose:** `XPBar` is one value with one accent and a `progressbar` role; the context bar is many parts with a legend. Extending `XPBar` would mix two jobs.
- `lib/constants/` _(modify)_ — the rule-of-thumb numbers (4 characters, 0.75 words) with their source URLs in a comment, the 20,000-character cap.
- Pure estimate maths in a small tested TS file next to the constants' users (`bun test`).
- `lib/types/content.ts`, `lib/content/mdx.tsx`, `lib/content/validate.ts` _(modify)_ — schemas, allowlist, limits.
- `content/CLAUDE.md` _(modify)_ — widget rules (examples, not model facts).
- `content/builder/00-bootstrap-village/c1/lesson.mdx` (TokenCounter), `content/builder/00-bootstrap-village/c5/lesson.mdx` (ContextWindowBar, in "The context window") _(modify)_ — pilot.

**Verification**

- All checks as before. `bun run build` output: the widget chunks are separate and not loaded on a lesson without widgets (check the network tab).
- Browser at 360 px: the bar and list fit; the slider is usable by touch and keyboard. JS off: starting numbers show.
- `content-reviewer` (the widget note text and the pilot lessons), `ui-ux-reviewer`.

**Approval gate:** maintainer review; then the later widgets (agent-loop stepper, cosine-similarity slider) get their own ticket.

---

## Acceptance criteria

- [ ] Every lesson with 3+ `##` sections opens on step 1, with `STEP n/N` (realm accent), Back, Continue, and **Go to Lesson done** on the last step.
- [ ] A move focuses the new step's section (named by its heading); the live region says "Step n of N".
- [ ] Lesson text and order are unchanged. No lesson file was edited for Phase 1.
- [ ] With JS disabled, every step is visible and no control is shown.
- [ ] No flash: the server HTML shows step 1 only, with no inline script.
- [ ] Show all / Show steps works, keeps the current step, says "All N steps shown." / "Step n of N", and lasts for the visit only.
- [ ] Find in page finds text in a hidden step and opens that step (browsers with `hidden="until-found"`).
- [ ] "Lesson done" works at any step and is never pressed for the learner. XP for a lesson is still +10, once.
- [ ] Try it: instant mark (colour AND icon + word), why text, Try again, no network request (checked in the network tab), works with JS off via `<details>`.
- [ ] `content:check` fails a Try it that copies or near-copies any graded prompt, or whose right option equals a graded correct option in the same chapter.
- [ ] Token counter and context bar match their schemas, show the four states, make no network request, and their JS loads only on lessons that use them.
- [ ] At 360 px: no sideways page scroll, every tap target ≥ 44 px, the 3 px Spark focus ring on every control.
- [ ] Reduced motion: no animation, instant scroll.
- [ ] axe passes on the stepped lesson (e2e `a11y.spec.ts`).
- [ ] Blog posts look and behave exactly as before.
- [ ] No new colour, font, radius or shadow; no gradient. `ui-ux-reviewer` has no blocking finding on each PR.
- [ ] typecheck, lint, test, build, content:check and test:e2e all pass on each PR.

## Out of scope

- The agent-loop stepper and the cosine-similarity slider (later ticket).
- NPC DialogBox moments in lessons, and any DialogBox change (later content ticket; no lesson uses one today).
- Rewriting or re-splitting lessons. Adding Try it or widgets beyond the pilot lessons (a content rollout ticket after Phase 2 and 3 sign-off).
- Any XP, HP or streak for steps, Try it or widgets. Any "you must finish the steps" gate on Lesson done or on the case.
- Saving step position or Try it answers on the server, or analytics on them.
- Real token counts from a vendor API.
- A new Claude Design screen (requested by the ticket; not available here; see Design source).
- Steps for blog posts.

## Risks

- **All 170 lessons change at once in Phase 1.** A grouping bug shows on every lesson. Mitigation: unit tests on real lesson shapes, a run over every lesson in the test (each must give 3+ steps and lose no text), and a quick revert path (the stepper only wraps the same HTML).
- **Hidden steps and Ctrl+F.** The browser cannot find text in a hidden step. Show all is the fix. `hidden="until-found"` would solve it but browser support is not even; left for later.
- **SEO.** Lessons are indexed. All steps stay in the HTML (hidden with CSS after JS), so the text stays crawlable.
- **The inline script.** It must be tiny and only set an attribute. If a Content-Security-Policy is added later (none today), it will need a nonce.
- **Try it near-copies that the word check misses** (a paraphrase). `content-reviewer` is the second line. The check is a floor, not a proof.
- **Widget numbers that look like facts.** The "examples only, no model names" rule keeps stale model limits out of widgets.
- **Bundle size.** Two small widgets, lazily loaded; the stepper is one small client file on every lesson. Check the build output in each PR.

## Calls I'm under 95% on

1. **Steps from `##` sections.** Lean: one step per `##`, intro joins step 1, no stepper under 3 steps. Why: no rewrite of 170 lessons, and sections are already short (about 110 words). Other option: hand-placed step breaks in MDX, downside a content pass on every lesson.
2. **How "no JS = all visible" works without a flash.** Lean: the server sends all steps; a tiny inline script right after the stepper sets "steps on" (and the saved Show all choice) before first paint, as in Next's preventing-flash guide. Other option: `<noscript><style>` that un-hides steps, downside a `<style>` in the body and no way to apply the saved Show all choice before paint.
3. **Step position in the URL hash.** Lean: yes, with `replaceState`. Why: a reload keeps your place, cheap because `headingId` exists. Other option: no position at all, downside a reload sends you back to step 1.
4. **Continue never waits for Try it, and Finish never marks the lesson done.** Lean: both. Why: the SIG-11 rule says Lesson done is one explicit button with no scroll or time tracking. Other option: require each Try it, downside friction and a fake "progress" signal.
5. **Try it no-reuse threshold.** Lean: exact match or word Jaccard ≥ 0.6 (digits dropped) against every graded prompt in `content/`. Other option: same chapter only, downside it misses shared chapters and boss questions.
6. **Try it answers visible in the page source.** Lean: accept it, because it is ungraded. Other option: a server action to check the answer, downside a network call and a new endpoint for zero XP.
7. **Pilot lessons.** Lean: builder r0 c1 (Tokens: Try it + TokenCounter), strategist r0 c4 (Tokens = cost: Try it), builder r0 c5 (Models & limits: ContextWindowBar). Other option: one lesson only, downside we learn less about the authoring rules.
8. **Design source.** Lean: derive from the existing lesson screen and tokens, and use the Phase 1 preview as the design sign-off. Other option: wait for a Claude Design pass, downside the ticket is blocked with no date.

## Open questions

- Design sign-off: is the Phase 1 preview enough, or should a Claude Design pass come first (ticket wording)?
- Should strategist and creator pilots join Phase 3 (a creator widget idea is not in the ticket)?
- Rollout after the pilots: one content ticket per track, or per realm?

## Companion plans

- `quest-actions-design-plan.md` — the lesson page (SIG-11 block), "Lesson done", and why grading stays server-only.
- `curriculum-design-plan.md` — lesson, case and quick-check shapes.
- `shared-chapters-design-plan.md` — why the Try it no-reuse check runs over all tracks.
- `knowledge-base-design-plan.md` — how sources are kept fresh (why widget numbers must not be model facts).
