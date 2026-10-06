# Sigmorai — Creator path

> A third learning path, **Creator**, for designers who make images, video, audio and social media with AI. Same map, own chapters, graded cases, no code. Read end-to-end before any code; each phase is gated by explicit approval.

## Status

**STATUS: Approved 2026-10-06. PR 1 in review.**

**SCHEMA:** db-architect approved 2026-10-06 (keep the CHECK).

## Amendments

## Amendments locked 2026-10-06 (devil pass, maintainer approved)

These win over any later section of this spec that says otherwise (PR 2–5 below, "waits for the token", "Coming soon, no link").

- **Supersedes curriculum spec "No third track" (2026-10-05).** PR 1 adds a dated line to `docs/plans/curriculum-design-plan.md` and edits `ENGINEERING.md:32,84`. `docs/build-prompt.md:32` is the founding brief and stays; the curriculum line says it is superseded on this point.
- **Three PRs, not five.** PR 1 = `TRACKS` + migration + outline + all copy + docs (the picker, hint and privacy page must agree from the first merge). PR 2 = realm 00 content + the source ids it cites. PR 3 = realm 01. No sources-only PR.
- **Colour: `info` now, token later.** Swapping `TRACK_ACCENTS.creator` is one line. One Claude Design pass adds creator and scientist colours together and fixes the stale TR copy ("Code your way through…").
- **Count-free copy.** Every string that counts paths says "every path" / "your path", so a fourth track (Scientist, planned) needs no copy hunt. The beginner hint may still name paths.
- **Source rule is track-neutral.** `content/CLAUDE.md:34` becomes: at least 2 official vendors where 2 document the concept; Anthropic + OpenAI when both do. Third-party vendors (Adobe, Stability, ElevenLabs, Runway) are official for their own product, never the only vendor for a concept. Add a source id only when a lesson cites it.
- **Keep the CHECK** (db-architect, 2026-10-06). Generated `drizzle/0005_creator_track.sql` = drop + re-add `users_track_check`, nothing else. No `NOT VALID`. Do not pre-add `scientist`.
- **Canary DB step.** Before PR 1 merges, run `bun run db:migrate` against the canary preview / dev Neon branch by hand. CI migrates only `e2e` (PRs) and prod (`main`).
- **Release sequencing, no flag.** PR 1 merges into canary only when PR 2 (realm 00) is reviewed; both land the same day. `main` is not held.
- **Realms with an outline but no files behave like builder realm 04 today**: realm page open, "No chapters in this realm are ready yet", chapters COMING SOON. No new state.
- **Fourth track shape.** Adding a track stays: one `TRACKS` value, the `Record<Track, …>` maps (typecheck-forced), one outline, one generated migration, one landing card. No registry, no flag.
- **Wording fixes.** Errors on a CHECK failure are the existing `server_error`. A quick check is exactly 3 questions. Acceptance 1 reads: "`creator` appears only as a key of a `Record<Track, …>` map or in copy and seed data; never in a string compare." Builder and strategist have realms 00–03 live; Creator starts two realms behind on purpose.
- **Rollback = fix forward.** Move creator rows to `strategist`, then narrow the CHECK in a new migration. Never redeploy old code while a creator row exists (`lib/data/leaderboard.ts:39` throws).

## Amendments locked 2026-10-06 (maintainer decisions)

- **Name: Creator.** Track id `creator`. For designers who make images, video, audio, social posts and multimedia with AI.
- **Same 9 realms, same world map, same NPCs, same level art.** The Math Tower and the Frontier are shared, like today.
- **Own chapters.** Each realm has 6 creator chapters + 1 boss. Shared ideas (tokens, context, tools, agents, evals) are taught from a creator angle: prompting image and video models, reference images, style consistency, generation APIs, multimodal input, content provenance (C2PA), rights and safety policies, cost per generation, batch pipelines, review loops, brand kits as context.
- **Official docs only** as sources: OpenAI image/video/audio docs, Google Gemini/Imagen/Veo docs, Anthropic vision docs, the C2PA spec, Adobe docs, and similar. **Vendor-neutral:** a concept cites at least 2 vendors where it can.
- **No learner writes code.** Every chapter ends in a graded scenario case + a quick check, like the other two tracks.
- **First release: realms 00 and 01.** Realms 02–08 show in the outline as "Coming soon".

---

## Context

| Fact already locked                                                                       | Where                                         |
| ----------------------------------------------------------------------------------------- | --------------------------------------------- |
| Track ids live in one list, `TRACKS`                                                      | `lib/constants/exercises.ts:7`                |
| Progress is per track through the exercise id (`creator/r0/c1/lesson` needs no new table) | `db/CLAUDE.md:12`, `lib/content/ids.ts:40`    |
| XP, level, streak are one ledger for all paths. Math Tower and Frontier ids have no track | curriculum spec → SIG-36 block                |
| Switching path lives on `/profile`, one action `switchTrack`                              | `lib/actions/switch-track.ts:30`              |
| Case = 3–5 questions, 4 options, one correct. Quick check = case shape, 2–6 options       | `content/CLAUDE.md:32`                        |
| Realms 06–08 are `advanced` (visible, locked)                                             | `lib/constants/curriculum.ts` `REALMS[].tier` |
| Outline shape: `realms[9]{ id, topic, lore, chapters[6]{ id, title }, boss{ task? } }`    | `lib/types/curriculum.ts:31-56`               |
| A chapter title is ≤ 16 chars (fits a map pin)                                            | curriculum spec → PR 4 block                  |

**Good news:** most code reads `TRACKS`, so adding one value makes most UI show three paths. The work is the migration, the copy, the colour, the outline and the content.

## Purpose

Designers use AI every day, but they use different models and tools (image, video, audio generators) than builders or managers. Today they must pick "builder" or "strategist", and neither talks about their work. Creator gives them the same game and the same ideas (tokens, context, tools, agents, evals) with their own examples. Outcome: a designer learns how media models work, how to prompt them, what they cost, and how to ship AI media safely, without writing code.

## User-visible behavior

1. **Onboarding.** The path picker shows three choices: Strategist, Builder, Creator. Creator's line (draft, voice-guardian checks it): _"You judge real media cases: image and video prompts, brand kits, rights."_
2. **Beginner hint** gains one sentence (draft): _"Make images, video or audio? Pick creator."_
3. **HUD** shows a `creator` badge in the creator colour (see Visual).
4. **Realms catalog** `/realms?track=creator` shows the 9 creator realms. Realms 00–01 have live chapters; 02–05 show "Coming soon"; 06–08 show ADVANCED · LOCKED (same tier rule as the other tracks).
5. **Quest loop** is the same: lesson → case → quick check, boss after 6 chapters. Ids: `creator/r0/c1/lesson`, `creator/r0/boss/challenge`.
6. **Profile → Your path** lists three paths. Switching keeps all progress (ids carry the track).
7. **Leaderboard** shows "CREATOR · LV n" next to the hero, like the other paths.
8. **Landing page** gets a fourth audience card: "For designers and creators".

No learner uploads an image or audio file. Cases describe the media in text (the existing `exhibit` string). Image exhibits are out of scope (see Calls).

## Fairness and integrity check

- Nothing changes in grading. Creator cases use the same server-only grading, the same `xp_events` rows and the same once-per-id award.
- A player who clears realm 0 on builder, strategist **and** creator earns XP three times. This is already true for two tracks (different ids = different content). Accepted: each is real, different content.
- Correct indexes stay server-only, like today.

## Data model

**One migration. `db-architect` first.**

- `users.track`: CHECK `users_track_check` changes from `in ('builder','strategist')` to `in ('builder','strategist','creator')` (`db/schema/users.ts:17,29`, built by `oneOf` from `TRACKS`; today's SQL is `drizzle/0000_init.sql:45`).
- Made by `bun run db:generate` after `TRACKS` changes → `drizzle/0005_<name>.sql` (drop + re-add the constraint). Widening only: every existing row still passes.
- No new table, column or index. `progress` and `xp_events` already hold any exercise id.
- **Deploy order risk:** prod migrations run on merge to `main` (`migrate.yml`). If the new code is live before the migration, picking Creator fails the CHECK. `createHero` / `switchTrack` must show their normal error, not crash. The window is short.
- **Rollback risk:** once one `creator` row exists, older code breaks: `z.enum(TRACKS)` in `lib/data/leaderboard.ts:39` would throw on that row. After PR 1 ships, fix forward only. Say this in the PR.

## API contract

No new action or route. `OnboardingSchema` (`lib/types/user.ts:56`) and `SwitchTrackSchema` (`lib/types/user.ts:64`) take the new value through `z.enum(TRACKS)`. `?track=creator` works on `/realms` through `TrackSchema` (`lib/data/realms.ts:116`).

## AI and cost

No change. The mentor answers only from the current lesson's sources, so a creator lesson grounds it in creator sources. No image, video or audio generation runs inside Sigmorai (cost: zero new model spend).

## Code touch points

Found with `grep -rnE "strategist|builder" app lib components db scripts e2e` plus readers of `TRACKS`. **Auto** = follows `TRACKS`, no edit, but check it at 360px.

### Must edit

| File:line                                               | What it assumes                                          | Change                                                           |
| ------------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------- |
| `lib/constants/exercises.ts:6-7`                        | `TRACKS = ['builder','strategist']`, comment "two paths" | Add `'creator'`                                                  |
| `db/schema/users.ts:17,29` → `drizzle/0005_*.sql`       | CHECK has 2 values                                       | Generated migration (SCHEMA REVIEW REQUIRED)                     |
| `lib/constants/curriculum.ts:11-15`                     | `TRACK_ACCENTS: Record<Track, Accent>` has 2 keys        | Add `creator` (typecheck forces it). Colour: see Visual          |
| `lib/constants/ui-copy.ts:92-98`                        | `TRACK_TEXT` has 2 keys                                  | Add `creator: { label: 'CREATOR', short }` (typecheck forces it) |
| `lib/constants/ui-copy.ts:114-115`                      | Beginner hint names 2 paths                              | Add the creator sentence                                         |
| `lib/constants/landing-copy.ts:31`                      | "Both paths cross the same nine realms…"                 | "All three paths…" + one creator sentence                        |
| `lib/constants/landing-copy.ts:53-95`                   | `AUDIENCES` has 3 cards                                  | Add a creator card (`id: 'creator'`, `TRACK_ACCENTS.creator`)    |
| `app/styles/components/landing.css:122`                 | `md:grid-cols-3` for the audience cards                  | 4 cards: `md:grid-cols-2` (2×2). Lean, see Calls                 |
| `lib/constants/realms-copy.ts:60`                       | Catalog description: "builder and strategist paths"      | Name all three, or "every path"                                  |
| `lib/constants/realms-copy.ts:193`                      | Math intro: "free on both paths"                         | "on every path"                                                  |
| `lib/constants/legal-copy.ts:61`                        | Privacy: "your path (builder or strategist)"             | Add creator. Privacy copy → voice-guardian                       |
| `content/creator/outline.json` _(new)_                  | `validate.ts:166-171` needs an outline for every track   | The outline below. **Must ship in PR 1** (see Phases)            |
| `scripts/seed.ts:18-25`                                 | Seed heroes only builder/strategist                      | Add 1–2 creator heroes (so the leaderboard shows the badge)      |
| `lib/types/user.test.ts:146`, `lib/content/ids.test.ts` | `test.each(['builder','strategist'])`                    | Add `creator` cases                                              |
| `e2e/a11y.spec.ts:11-12`                                | Public routes list only strategist quest pages           | Add `/quest/creator/r0/c1/lesson` once realm 00 is live          |

### Auto (no edit, check it)

| File:line                                                                            | Why it follows                                    | Check                                                                        |
| ------------------------------------------------------------------------------------ | ------------------------------------------------- | ---------------------------------------------------------------------------- |
| `lib/types/exercise.ts:11,13`, `lib/types/user.ts:56,64`                             | `Track`, `TrackSchema`, onboarding/switch schemas | typecheck                                                                    |
| `lib/content/ids.ts:40`                                                              | Id regex builds the track part from `TRACKS`      | `creator/r0/c1/lesson` parses (test)                                         |
| `lib/content/validate.ts:56,166,184`, `lib/content/docs-watch.ts:45`                 | content:check and docs-watch loop over `TRACKS`   | `bun run content:check` green                                                |
| `lib/content/load.ts` (`loadTrackOutline`)                                           | Reads `content/<track>/outline.json`              | `/realms?track=creator` renders                                              |
| `lib/grading/track-map.ts`, `lib/grading/open.ts`                                    | Take a `Track`; no track names inside             | open-rule tests on a creator id                                              |
| `lib/data/realms.ts:116-118,155-160`                                                 | `pickTrack`, `getRealmMeta` loop over `TRACKS`    | Realm page meta still uses `DEFAULT_TRACK` topic (fine)                      |
| `lib/data/leaderboard.ts:39`                                                         | `z.enum(TRACKS)`                                  | A creator row parses (see rollback risk)                                     |
| `app/sitemap.ts:14`                                                                  | Lists live ids for every track                    | Creator lessons appear once live                                             |
| `components/onboarding/hero-form.tsx:79`                                             | Maps `TRACKS` to stacked radios                   | 3 radios fit at 360px (they stack)                                           |
| `components/profile/path-panel.tsx:66`                                               | Maps `TRACKS` to stacked radios                   | Same                                                                         |
| `components/realms/track-switch.tsx:19` + `app/styles/components/realms.css:184-195` | One `inline-flex` row, `px-4` per link, no wrap   | **Risk:** 3 labels may overflow at 360px. Measure; add `flex-wrap` if needed |
| `components/hud/hud-bar.tsx:45`                                                      | Badge shows the raw id + `TRACK_ACCENTS`          | "creator" badge fits the HUD at 360px                                        |
| `components/leaderboard/board-row.tsx:32,41`, `app/(app)/profile/page.tsx:40,49-51`  | `TRACK_ACCENTS` + `TRACK_TEXT`                    | Badge colour + label                                                         |
| `e2e/quest-loop.spec.ts:46`                                                          | Picks strategist by label                         | No change (still valid)                                                      |

### Docs that say "two tracks" (same PR as the code they describe)

`content/CLAUDE.md:5,34` (layout + source rule), `ENGINEERING.md:32,84` ("both tracks"), `.claude/context/project.md` ("Two paths"), `AGENTS.md` intro. The design export (`design/ui_kits/webapp/Sigmorai App.dc.html:966-970`, `TR` table with `tech`/`biz` only) is changed in Claude Design by the maintainer, never by code.

### Not a touch point

The mentor (`lib/mentor/`, `app/api/mentor/`) has no track logic. The DEFAULT_TRACK for visitors stays strategist (`lib/constants/curriculum.ts:26`).

## Visual: the track colour

Builder = `accent` (ember), Strategist = `xp` (spark), from the design's `TR` table. The other colour families in `design/tokens/colors.css` already mean something:

| Token family             | Already means                             | Fit for Creator?                     |
| ------------------------ | ----------------------------------------- | ------------------------------------ |
| mint (`success`)         | pass, and the landing "NEW TO AI" card    | No: a badge would read as "passed"   |
| byte (`info`)            | info and links (`--link`)                 | Weak: may read as a link             |
| glitch (`danger`)        | errors, HP loss                           | No: the HUD would look like an error |
| rune (`math`)            | Math Tower                                | No: clashes with the tower           |
| `--realm-5`, `--realm-7` | one realm each (raw hex inside the token) | No: realm meaning                    |

**No free token fits.** The design needs a **Claude Design pass**: add a creator track colour (and the third `TR` entry, the creator card, three-way track tabs). Code never invents a hex. **Interim, only if the maintainer wants to ship before the pass:** `info`. PR 2 waits for the token otherwise.

## Creator outline

Same realm names, NPCs and tiers as `REALMS`. Titles ≤ 16 chars. Every `boss.task` is a scenario ("Plan / Choose / Design X for Y"), names no vendor, and is graded by a case. Lore is for DialogBoxes only (voice-guardian). Per-chapter topic notes stay in this spec, not in `outline.json`.

| id  | Realm             | Tier         | Topic (creator)                                                | Creator chapters (6)                                                                                   | `boss.task`                                                                     |
| --- | ----------------- | ------------ | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| 0   | Bootstrap Village | beginner     | How media models work: modalities, tokens, limits, cost, rules | Media models · Tokens & pixels · Multimodal input · Models & limits · Cost per asset · Rights & safety | Choose models and a budget for a product launch's images and short videos       |
| 1   | Prompt Forest     | beginner     | Prompting image, video and audio models                        | Shot prompts · Reference images · Style & brand · Edit & inpaint · Video prompts · Review outputs      | Plan a prompt kit that keeps one brand look across a whole campaign             |
| 2   | Tool Forge        | beginner     | Generation APIs and tools for creators                         | Generation APIs · Tools in chat · Async jobs · Files & formats · Errors & retries · Creative apps      | Plan the steps from a client brief to a delivered video                         |
| 3   | Context Library   | intermediate | Brand kits, reference libraries and consistency as context     | Brand kits · Reference sets · Asset search · Long media · Consistent cast · Asset rights               | Design the brand kit and reference library the model reads for every asset      |
| 4   | Agent Citadel     | intermediate | Creative agents: storyboards, review loops, stop rules         | Creative agents · Storyboards · Review loops · Stop rules · Human sign-off · Agent limits              | Set review steps and stop rules for an agent that makes a 30-second ad          |
| 5   | MCP Bridgelands   | intermediate | Linking design tools, asset libraries and publishing           | Connect tools · MCP for design · Asset libraries · Publish flows · Access & keys · Vendor lock-in      | Choose how a studio links its design tools, asset library and social accounts   |
| 6   | Eval Arena        | **advanced** | Judging media quality: rubrics, graders, safety checks         | Define quality · Rubrics · Model graders · A/B tests · Safety checks · Regression                      | Build a scorecard that decides if a new image model can replace the old one     |
| 7   | Swarm Spire       | **advanced** | Batch pipelines and multi-agent studios                        | Pipelines · Roles · Handoffs · Batch runs · Shared state · Cost control                                | Plan a pipeline that makes 50 localised ad versions inside a fixed budget       |
| 8   | Production Peaks  | **advanced** | Provenance, labels, rollout and incidents                      | Provenance · Watermarks · Disclosure · Rate limits · Incident plan · Launch                            | Plan a brand's AI media rollout: content credentials, labels, review and limits |

**Lore one-liners** (draft, DialogBox voice, voice-guardian checks):

| id  | Lore                                                                                       |
| --- | ------------------------------------------------------------------------------------------ |
| 0   | Elder Maren shows you the village loom, where the Oracle first wove pictures from words.   |
| 1   | Ranger Iso teaches you to name the light, the lens and the mood before you ask the Oracle. |
| 2   | Smith Korren's forge turns slow orders into finished work, if you wait for the fire.       |
| 3   | Archivist Vela keeps every brand's colours and faces, so the Oracle never forgets a hero.  |
| 4   | Warden Tess lets a helper draw the storyboard, but keeps the last stamp herself.           |
| 5   | Bridgekeeper Nal opens the road between your sketchbook, your vault and the town square.   |
| 6   | Judge Arra holds two pictures to the light and asks: which one keeps the promise?          |
| 7   | The Conductor sends fifty painters out at once, and counts every coin they spend.          |
| 8   | Summit Guide Pell seals every image with its true maker's mark before it leaves the peak.  |

**Chapter notes for the first release (realms 0–1).** These guide authors and content-reviewer. Every claim needs an official page.

| Chapter | Teaches                                                                                                      |
| ------- | ------------------------------------------------------------------------------------------------------------ |
| r0c1    | What image, video, audio and text-in-image models do; input vs output modalities                             |
| r0c2    | Images and audio count as tokens or units too; size and length change cost (only what each vendor documents) |
| r0c3    | Giving a model an image or audio to read (vision); what differs by vendor                                    |
| r0c4    | Picking a model: quality, speed, size, length, aspect ratio limits                                           |
| r0c5    | Price per image / per second / per minute, from live pricing pages; budget per asset                         |
| r0c6    | Vendor usage policies: people, likeness, brands, unsafe content; what gets refused and why                   |
| r1c1    | A prompt as a shot: subject, setting, light, lens, composition                                               |
| r1c2    | Using reference images to guide content or style                                                             |
| r1c3    | Keeping one style and one brand across many assets                                                           |
| r1c4    | Editing part of an image (masks, inpainting) instead of starting again                                       |
| r1c5    | Video prompts: motion, camera, length, first/last frame                                                      |
| r1c6    | Checking outputs: hands, text, brand errors; when to edit vs re-generate                                     |

Lesson guard: r0c2 and r0c5 must not state a number from memory. Use the vendor's live docs and pricing page, with the date.

## Sources

**Source rule for Creator (needs maintainer OK, see Calls):** the current rule (`content/CLAUDE.md:34`) asks for 1 Anthropic + 1 OpenAI page _where both document the concept_. Anthropic documents image **input** (vision) but no image, video or audio **generation**. So for generation chapters the 2 vendors are usually OpenAI + Google. Anthropic is cited where it documents the idea (vision, prompting, usage policy).

**Already in `content/sources.yaml` (covers most of realm 0–1):** `claude-docs` (vision), `openai-docs` (image generation, video generation, audio/speech, moderation), `gemini-docs` (image generation, Imagen, Veo, audio and video understanding). Each page still needs a fetch check before a lesson cites it.

**Candidate new ids** (all `to verify`; same format: `id, kind, title, url, owner, trustTier`; nothing is edited by this spec):

| id (candidate)          | kind | url (base, to verify)                                       | owner       | For                                                                                                                     |
| ----------------------- | ---- | ----------------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------- |
| `c2pa-spec`             | docs | `https://c2pa.org/specifications`                           | c2pa        | r8 provenance                                                                                                           |
| `content-authenticity`  | docs | `https://opensource.contentauthenticity.org/docs`           | adobe       | r8 provenance                                                                                                           |
| `adobe-firefly-docs`    | docs | `https://developer.adobe.com/firefly-services/docs`         | adobe       | r1, r2, r3                                                                                                              |
| `vertex-genmedia-docs`  | docs | `https://cloud.google.com/vertex-ai/generative-ai/docs`     | google      | r2 (async video jobs), r7 batch                                                                                         |
| `google-synthid`        | docs | `https://ai.google.dev/responsible/docs/safeguards/synthid` | google      | r8 watermarks                                                                                                           |
| `anthropic-aup`         | docs | `https://www.anthropic.com/legal/aup`                       | anthropic   | r0c6                                                                                                                    |
| `openai-usage-policies` | docs | `https://openai.com/policies/usage-policies`                | openai      | r0c6 — **warning:** `openai.com` returned 403 to the fact-checker before (`sources.yaml` comment). May not be checkable |
| `hf-diffusers-docs`     | docs | `https://huggingface.co/docs/diffusers`                     | huggingface | open-model view, r0–r1                                                                                                  |
| `stability-docs`        | docs | `https://platform.stability.ai/docs`                        | stability   | r1 edit/inpaint                                                                                                         |
| `elevenlabs-docs`       | docs | `https://elevenlabs.io/docs`                                | elevenlabs  | audio, r0–r2                                                                                                            |
| `runway-api-docs`       | docs | `https://docs.dev.runwayml.com`                             | runway      | video, r2                                                                                                               |

Platform disclosure rules (YouTube, Meta, TikTok help pages) are official for their platform but are not AI vendors. Decide at realm 8, not now.

## States and transitions

| State                                | Shows                                                    |
| ------------------------------------ | -------------------------------------------------------- |
| Creator realm 0–1 chapter, live      | Normal open / locked-by-order / done states              |
| Creator realm 2–5                    | "Coming soon", no link                                   |
| Creator realm 6–8                    | ADVANCED · LOCKED, like the other tracks                 |
| `?track=creator`, signed out         | Readable catalog and lessons; submit asks to sign in     |
| Picking Creator before the migration | The normal onboarding error, no crash                    |
| 360px                                | Track switch with 3 labels fits or wraps; no page scroll |

All loading, empty and error states are the existing ones.

## Phases (small PRs, branch from `canary`)

**Why PR 1 is big:** the code can't add `creator` to `TRACKS` without the outline (content:check fails at `lib/content/validate.ts:166-171`, and `/realms?track=creator` can't load). And the outline can't land first (validate rejects `creator/outline.json` as an unknown file). So TRACKS, the migration and the outline go together.

### PR 1 — `feat(db)`: track id, migration, outline

**Files:** `lib/constants/exercises.ts` · `db/schema/users.ts` (no code change; the CHECK follows) · `drizzle/0005_*.sql` + `meta/` (generated) · `lib/constants/curriculum.ts` (`TRACK_ACCENTS.creator`, interim or new token) · `lib/constants/ui-copy.ts` (`TRACK_TEXT.creator`) · `content/creator/outline.json` (all 9 realms, no chapter folders) · tests (`user.test.ts`, `ids.test.ts`, an outline-parse case).

**Gates:** devil → db-architect (migration) → voice-guardian (titles, lore, boss tasks, track line) → content-reviewer (outline) → cto.

**Checks:** `bun run typecheck`, `lint`, `test`, `content:check`, `build`; `db:generate` diff shows only the CHECK; migrate on a Neon branch; `/realms?track=creator` shows 9 realms, all "Coming soon" / locked; onboarding creates a creator hero on the branch DB.

**Note:** after this merges, Creator is visible on canary (the picker maps `TRACKS`). It shows no lessons yet. Fine on canary; see Calls #1 for `main`.

### PR 2 — `feat(ui)`: copy, colour, layout

**Files:** `lib/constants/ui-copy.ts` (beginner hint) · `lib/constants/landing-copy.ts` (line 31 + creator card) · `app/styles/components/landing.css` (grid) · `lib/constants/realms-copy.ts` (60, 193) · `lib/constants/legal-copy.ts` (61) · `app/styles/components/realms.css` (track switch wrap, if needed) · `scripts/seed.ts` · the docs list above.

**Waits on:** the Claude Design colour pass (or the maintainer accepts `info`).

**Gates:** devil → voice-guardian (all copy, privacy line) → ui-ux-reviewer → cto.

**Checks:** typecheck, lint, test, build; browser at 360px and desktop: onboarding, profile, `/realms` switch, HUD badge, landing cards, leaderboard row. Lighthouse a11y on `/` and `/realms`.

### PR 3 — `feat(content)`: sources for realms 0–1

**Files:** `content/sources.yaml` only (the ids above that realms 0–1 need, each base URL fetched that day).

**Gates:** content-reviewer → cto (short). **Checks:** `content:check`, `bun run seed` on a branch DB.

### PR 4 — `feat(content)`: creator realm 00

**Files:** `content/creator/00-bootstrap-village/c1…c6/{lesson.mdx, case.json, quick-check.json}` + `boss/case.json` · `e2e/a11y.spec.ts` (add a creator lesson route).

**Gates:** devil → content-reviewer (every claim vs the live page) → voice-guardian → cto. **Checks:** `content:check`, `test`, `build`, read two lessons end to end at 360px; one case played through on a branch DB.

### PR 5 — `feat(content)`: creator realm 01

Same files and gates for `01-prompt-forest`.

**Release to `main`** only after PR 4 is on canary (Calls #1).

---

## Acceptance criteria

- [ ] `TRACKS` is the only place the id `creator` is typed in `app/**` and `lib/**` (outside tests and copy).
- [ ] The migration only widens `users_track_check`; existing rows pass.
- [ ] A new hero can pick Creator; `/profile` can switch to and from Creator; progress on the other paths stays.
- [ ] `content/creator/outline.json` passes `content:check`: 9 realms, 6 chapters each, titles ≤ 16 chars.
- [ ] Creator realms 06–08 are ADVANCED · LOCKED; no lesson, case or answer reaches the browser.
- [ ] No creator `boss.task` or chapter title names a vendor.
- [ ] Every creator lesson cites at least 2 vendors where 2 document the concept; every url sits under a `trustTier: official` entry.
- [ ] Track switch, HUD badge, picker and landing cards work at 360px with no page scroll.
- [ ] The creator badge has a text label (not colour only).
- [ ] No new hex in code; the colour is a design token.

## Out of scope

- Uploading images, audio or video, or any in-app generation.
- Image exhibits in cases (the `exhibit` field is a string today).
- Realms 02–08 content (outline only).
- A creator-only Math Tower or Frontier.
- A per-track leaderboard filter.
- Renaming `builder` / `strategist`.

## Calls I'm under 95% on

1. **Creator visible before content.** Lean: no feature flag. PR 1 shows Creator on canary with no lessons; release to `main` only after PR 4 (realm 00) is on canary. Why: zero extra code. Other option: an `OPEN_TRACKS` list for the picker, downside one more constant and a second place to forget.
2. **Track colour.** Lean: wait for a Claude Design pass that adds a creator token. Why: no free family; every option already means something. Other option: `info` now, downside it looks like a link colour.
3. **Source rule for Creator.** Lean: amend `content/CLAUDE.md` so that, for generation topics, OpenAI + Google (or another official vendor) meets the 2-vendor rule, and Anthropic is required only where it documents the idea (vision, prompting, policy). Other option: keep the rule as is, downside it is unclear for chapters Anthropic doesn't cover.
4. **Default path stays strategist.** Lean: yes; add one hint sentence for designers. Other option: ask "what do you make?" first, downside a bigger onboarding change.
5. **Same advanced lock (realms 06–08).** Lean: yes, one tier rule for all tracks. Other option: open creator 06 (quality evals) early, downside breaks "tier is a realm property".
6. **Landing grid.** Lean: 2×2 (`md:grid-cols-2`). Other option: `lg:grid-cols-4`, downside cramped cards on laptops.
7. **Usage-policy sources.** Lean: cite `anthropic.com/legal/aup` and the Google policy page; check whether `openai.com/policies` can be fetched before relying on it. Other option: skip vendor policies in r0c6, downside rights and safety is a core creator topic.
8. **Third-party media vendors (Adobe, Stability, ElevenLabs, Runway).** Lean: allow them as official sources for their own product docs, but never as the only vendor for a concept. Other option: big three only, downside thin coverage for audio and video.
9. **Realm 0 chapter "Tokens & pixels".** Lean: keep it, but teach only what vendors document (image tokens and per-image or per-second pricing). Other option: fold it into "Cost per asset", downside loses the shared "tokens" idea the maintainer asked for.

## Companion plans

- `docs/plans/curriculum-design-plan.md` — realms, tiers, outlines, source rule.
- `docs/plans/knowledge-base-design-plan.md` — `sources.yaml`, sync job, mentor grounding.
- `docs/plans/quest-actions-design-plan.md` — open rule, grading, XP.
- `docs/plans/level-art-design-plan.md` — shared level art (no new art needed).
