# Sigmorai — Path curriculum (realms per path)

> Each path gets its own realm list. All paths keep the same 9 core realms. A path can also have its own specialist realms, and a realm can have more than 6 chapters. First user: Creator, with 5 new realms for designers. Read end-to-end before any code; each phase is gated by explicit approval.

## Status

**STATUS: Draft for review (2026-10-07). Build step: cross-cutting. Track: all (creator first, then builder and strategist).**

**SCHEMA:** no schema change. Exercise ids are `text` in `progress`, `submissions` and `xp_events`. Not `SCHEMA REVIEW REQUIRED` (see Data model).

## Amendments

## Amendments locked 2026-10-07 (devil pass, maintainer "go with your lean")

These override the sections below where they disagree.

- **Engine ships as two PRs.** 1a = chapter count from the outline (open rule, next case, map, validate, level-map spacing, copy). 1b = realm list per track (`REALMS` owner/scene, per-track grammar, outline-order map, certificates, art fallback, docs). Today's outlines pass both; each is green alone.
- **No `CORE_REALM_COUNT`.** Core realms are the `REALMS` rows with `track: null`.
- **A core realm's outline grows only with its files.** `content:check` fails when an outline chapter past `MIN_CHAPTERS` lacks its lesson, case or quick check. This removes the "grown realm, new chapters not live" state (no boss re-locked with nothing to play).
- **The outline is memoised** (module memo in prod, per request in dev, like `liveIds`), because `checkOpen` reads it on every graded action.
- **Real counts where a realm view exists** (`N CHAPTERS + BOSS`, `x/N CLEARED`); count-free only on the landing and catalog intros.
- **Specialist realm pages hide the path switch;** `getRealmPage` and `getRealmMeta` use the owner track's outline.
- **Level-map spacing sets the label width too** (`--node-gap`), tested at 6 and 12 chapters.
- **`lib/data/quest.ts` is untouched** (the helpers carry the `neutral` fallback); this avoids a clash with SIG-50.
- **Source status R means "cited before", not "verified".** Every claim in a new chapter needs a fresh fetch. The build environment's network was opened fully on 2026-10-07 (maintainer), so content PRs 3–8 run here with fresh fetches; no docs-watch `--snapshot` is needed.
- **The realm OG image and the dashboard realm tile** branch on `scene` (no art → flat `neutral` fill, site-default OG).
- **Accepted side effect:** a boss cleared before its realm grew stays cleared (and its certificate stays), while the header reads e.g. 7/10 until the new chapters are played.
- **Ids:** an id past the outline's chapter count is `INVALID_INPUT`, never `NOT_OPEN` (tested). Specialist realm numbers are fixed when each realm first ships, and never renumbered after.

---

## Context

**The request** (maintainer, 2026-10-07, summary): "As a designer I see only shot prompts, Prompt Forest, Tool Forge, Context Library. Not enough. I want to learn how to make designs with tools, motion graphics and MCPs. Don't stick with 9 realms and 6 chapters. Add as much content as you can for people who want to be professional designers. Prompts for designers are completely different from technical prompts. The skeleton is the same for everyone; paths meet (prompts, tools, MCP, context), but each path needs its own extra content."

**What is true today** (read from the code, 2026-10-07):

| Fact                                                                                                                                                                                   | Where                                                                  |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| A fixed grid: `REALM_COUNT = 9`, `CHAPTER_COUNT = 6`, for every track                                                                                                                  | `lib/constants/exercises.ts:10-12`                                     |
| `REALMS` is one table (id, slug, name, NPC, tier), shared by all tracks. Code reads it as `REALMS[id]`                                                                                 | `lib/constants/curriculum.ts:43-79`                                    |
| The id grammar is built from the two counts: `r0`–`r8`, `c1`–`c6`                                                                                                                      | `lib/content/ids.ts:42-43`                                             |
| An outline must have exactly 9 realms (`id` = index) and exactly 6 chapters each                                                                                                       | `lib/types/curriculum.ts:31-59`                                        |
| A boss needs all 6 chapter cases. "Next case" after c6 is the boss                                                                                                                     | `lib/grading/open.ts:56`, `lib/grading/case.ts:105`                    |
| The map, realm pages and dashboard walk `REALMS` and index `outline.realms[realm.id]`                                                                                                  | `lib/grading/track-map.ts:159-182`                                     |
| `content:check` lists every allowed file from `trackExerciseIds(track)` (9 × 6)                                                                                                        | `lib/content/validate.ts:69-77`                                        |
| A certificate per (track × open-tier realm), plus the Math Tower                                                                                                                       | `lib/constants/certificates.ts:32-54`                                  |
| The level map has 7 fixed node columns (6 chapters + boss) on a 1024×240 art grid                                                                                                      | `lib/constants/level-map.ts`, `design/assets/levels/layout.json`       |
| Art and accent come from the realm number: `/levels/realm-0N`, `--realm-N` (0–8 only)                                                                                                  | `lib/content/curriculum.ts:12-21`                                      |
| The dashboard shows at most `DASHBOARD_REALM_LIMIT` (3) realm tiles                                                                                                                    | `lib/constants/curriculum.ts:40`, `app/(app)/dashboard/page.tsx`       |
| Copy counts the grid: "9 realms", "6 chapters and a boss", "Clear all 6 chapters first."                                                                                               | `landing-copy.ts:45-47`, `realms-copy.ts:67-77,190`, `ui-copy.ts:296`  |
| Shared-chapter groups name chapters like `builder/r1/c5`; credit is case-only                                                                                                          | `docs/plans/shared-chapters-design-plan.md`                            |
| Every track is fully written: 54 chapters + 9 bosses each                                                                                                                              | shared-chapters spec → Context                                         |
| Creator realm 1 (Prompt Forest) already has: Shot prompts · Reference images · Style & brand · Edit & inpaint · Video prompts · Review outputs. Realm 5 c2 is "MCP for design" (Figma) | `content/creator/outline.json`, `content/creator/01-prompt-forest/c*/` |

**What this replaces.** The "9 × 6 grid" lines in `docs/build-prompt.md`, `.claude/context/project.md` ("9 realms per track … 6 chapters + 1 boss"), `content/CLAUDE.md` ("Realms `r0`–`r8`, chapters `c1`–`c6`"), the curriculum spec (§Constants `CHAPTERS_PER_REALM`, §Content files "≠ 9 realms … ≠ 6 chapters" test, Frontier amendment "the 9 × 6 count stays") and the creator spec ("Same 9 realms … 6 creator chapters"). PR 1 adds a dated line to each spec and edits the two docs. `docs/build-prompt.md` is the founding brief and stays as it is.

## Purpose

Today every path has the same 9 × 6 grid. So a designer gets 54 chapters, and most of them are the builder's ideas told with media examples. There is no room for design tools, motion work, voice, model-by-model image craft or design systems. This spec lets each path grow on its own, without breaking any id or any player's progress. Outcome: a designer finds a real design curriculum. A builder and a strategist can get their own deep realms later, the same way.

**Example.** Mia picks Creator. Her map shows the 9 core realms she already knew, plus "Canvas Workshop" (design tools and MCP) and "Reel Hollow" (motion and video). Her Prompt Forest now has 9 chapters, not 6. A builder does not see Canvas Workshop at all.

## The model in one picture

```
Every path:      r0 r1 r2 r3 r4 r5 r6 r7 r8     ← core realms, same ids forever
Creator adds:    r9 r10 r11 r12 r13              ← creator-only realms
Builder adds:    r14 r15 …  (later phase)        ← builder-only realms
Strategist adds: r17 …      (later phase)

creator/outline.json lists its realms in map order, for example:
  r0, r1, r11, r2, r10, r12, r3, r13, r4, r5, r9, r6, r7, r8
and each realm has 6–12 chapters (c1 … cN).
```

- A **core realm** (r0–r8) is on every path. Each path keeps its own chapters inside it, as today.
- A **specialist realm** (r9 and up) belongs to one path only.
- **Realm numbers are global.** No two realms share a number, even on different paths. So one number still gives one folder, one art path and one accent, as the devil pass asked (2026-10-05).
- **Ids are forever.** `creator/r1/c3/challenge` stays. New ids are added; none are renamed.

## User-visible behavior

1. **Realms catalog** (`/realms?track=creator`) lists the path's realms in its outline order: core and specialist mixed. A specialist realm card shows a text badge "PATH REALM" (text, not colour only). Another path's specialist realms are not shown.
2. **Realm page** (`/realms/<slug>`) shows all chapters of the realm, 6 to 12, then the boss. For a specialist realm the page always shows its own path. `?track=` is ignored there (no 404, no switch), and the canonical URL has no `?track=`.
3. **Chapter order** is the same rule as today: chapter N opens when chapter N−1's case is cleared (or credited). The boss opens when every chapter case of that realm is cleared. Lock text: "Clear every chapter in this realm first." (replaces "Clear all 6 chapters first."; voice-guardian).
4. **Level map** (`/map/<slug>`) shows one node per chapter plus the boss. Prev/next realm follow the path's outline order. A realm with no art yet shows a flat `neutral` background (see Art).
5. **Dashboard** shows the whole path, not 3 tiles. The Continue card stays. Under it, a "YOUR PATH" list: one row per realm, in path order. Each row: realm name, tier label, state (text + icon), `cleared / total` chapters, and a link to the realm page. Specialist rows carry the "PATH REALM" badge. At 360px each row is one line of name + a second line of state, at least 44px tall.
6. **Certificates**: one per realm the path can open, core or specialist. A specialist realm certificate reads "Canvas Workshop cleared · CREATOR PATH". Math Tower certificate unchanged.
7. **Grown realm** (a core realm gets new chapters, for example creator r1 c7–c9): new chapters appear after c6. A player who cleared the boss before keeps it: realm stays CLEARED and the certificate stays. A player who has not cleared the boss must now clear the new chapters first.
8. **Copy is count-free.** "Each realm is a course: chapters and a boss." Not "6 chapters". The landing "9 realms, one world" becomes "One world, a map for every path" (draft; voice-guardian).
9. **Signed out / visitor:** reads the catalog and lessons of any path, as today. Submit asks to sign in.

## Engine changes (PR 1)

No behaviour change for today's content. All old ids parse and build exactly as before.

### Constants

| Constant (file)                                  | Today                         | After                                                                                                                                                                                                         |
| ------------------------------------------------ | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `REALM_COUNT` (`exercises.ts`)                   | `9`, the grid size            | Renamed `CORE_REALM_COUNT = 9`: the realms every path has (r0–r8). Not the size of a path.                                                                                                                    |
| `CHAPTER_COUNT` (`exercises.ts`)                 | `6`, every realm              | Replaced by `MIN_CHAPTERS = 6` and `MAX_CHAPTERS = 12`. The real count of a realm comes from that track's outline.                                                                                            |
| `REALMS` (`curriculum.ts`)                       | 9 rows, shared                | Each row gains `track: Track \| null` (`null` = core, on every path) and `scene: boolean` (art ready). Rows stay sorted by id with no gap, so `REALMS[id]` still works. New realms are new rows, never edits. |
| `DASHBOARD_REALM_LIMIT` (`curriculum.ts`)        | `3`                           | Removed (PR 2): the dashboard lists the whole path.                                                                                                                                                           |
| `BOSS_NOT_OPEN_TEXT` (`ui-copy.ts`)              | "Clear all 6 chapters first." | "Clear every chapter in this realm first." (voice-guardian)                                                                                                                                                   |
| Count copy (`landing-copy.ts`, `realms-copy.ts`) | "9 realms", "6 chapters"      | Count-free wording (voice-guardian)                                                                                                                                                                           |

### Id grammar (`lib/content/ids.ts`)

- **Still pure, still exact.** The pattern is built per track from `REALMS`: a track's realms are the core rows plus the rows whose `track` is that track. Example: `creator/r9/c1/lesson` parses; `builder/r9/c1/lesson` does not.
- Chapters: `c1`–`c12` (`MAX_CHAPTERS`). Whether a realm really has a c9 is not the grammar's job: the outline and `hasContent` decide (see Open check).
- `r1` and `r10` cannot clash: every segment ends at `/` and the pattern is anchored.
- Math Tower (`f1`–`f8`) and Frontier ids: unchanged.
- `realmExerciseIds` and `trackExerciseIds` take the track's outline (chapter count per realm, realm order). Their callers (`validate.ts`, `docs-watch.ts`, `lib/data/realms.ts` `liveIds`, `getRealmMeta`) load the outline first. The outline loader is already cached.
- `questBackHref`, `parseChapterId`, `buildExerciseId`: no logic change; they accept the wider grammar.

### Outline schema (`lib/types/curriculum.ts`)

`content/<track>/outline.json` = `{ realms: RealmOutline[] }`:

- `realms` order = the map order for this path.
- Every core id 0–8 appears exactly once, and the core ids keep their order (0 before 1 … before 8). Specialist realms can sit anywhere between them.
- A specialist id must have a `REALMS` row whose `track` is this track.
- No id twice.
- Each realm: `{ id, topic, lore, chapters, boss{ task? } }` (same fields as today). `chapters` has `MIN_CHAPTERS`–`MAX_CHAPTERS` items, ids `c1 … cN` in order. Titles ≤ 16 chars (map pin).
- Today's three outlines pass unchanged (9 realms, ids 0–8 in order, 6 chapters each).

**A realm never shrinks.** Removing a chapter would orphan progress and let players earn XP again. `content:check` cannot see history, so this is a review rule (content-reviewer and cto check the outline diff).

### Open check, next case (`lib/grading/open.ts`, `lib/grading/case.ts`)

- `requiredClears(ref, chapterCount)`: chapter N needs chapter N−1's case (unchanged). The boss needs cases c1 … cN of that realm on that track, where N comes from the outline.
- `checkOpen` loads the track's outline (cached) to get N. A ref whose realm is not in that track's outline returns `INVALID_INPUT` (the grammar already blocks most, `hasContent` blocks the rest).
- `decideOpen`: tier from `REALMS[ref.realm].tier`, as today. Specialist realms use the same tier rule.
- `nextCaseId(ref, chapterCount)`: after cN comes the boss.
- Shared-chapter credit: unchanged (`withCreditors`, `applyCredit`).

### Track map, realm pages, level map

- `buildTrackMap` walks `outline.realms` in order and looks up each `REALMS` row by id. It no longer indexes `outline.realms[realm.id]`. `chapterViews` uses all titles (no `slice(0, 6)`).
- `getRealmPage`: for a specialist realm, the track is the realm's owner; `?track=` is ignored. For a core realm, today's `pickTrack` stays.
- `getRealmMeta`: "indexable" checks only the tracks that have this realm.
- `/map/[realm]` prev/next: the previous and next realm in the shown track's outline, not `REALMS[id ± 1]`.
- **Level map nodes:** today's 7 columns `[4, 11, 19, 27, 35, 44, 58]` stay for a 6-chapter realm, so the existing art still lines up. For N chapters ≠ 6, the N + 1 nodes are spread evenly between column 4 and column 58 (12 chapters + boss ≈ every 4.5 columns ≈ 144 screen px, wide enough for a 44px node). One pure helper, tested.
- `realms/[realm]/loading.tsx`: the skeleton shows `MIN_CHAPTERS + 1` rows.

### Art and accent

- `content/CLAUDE.md` says new realm art is **generated fresh, never reused**. So the placeholder is **no image**: when `scene` is false, `RealmScene` draws a flat `neutral` fill (a token), and the realm OG image uses the site default image. Same idea as the Frontier ("no scene art, accent `neutral`").
- `realmAccent(id)`: `realm-N` for 0–8; `neutral` for a specialist realm until a Claude Design pass adds tokens. Code never invents a hex.
- Higgsfield art per realm is its own later PR (level-art spec flow). It flips `scene` to true.

### Certificates (`lib/constants/certificates.ts`)

- `CERT_ACHIEVEMENTS` = core realms × every track + each specialist realm × its owner track, open tiers only. Built from `REALMS` (no outline read). Slug unchanged in shape: `creator-r9`.
- Every existing slug stays the same. The Math Tower entry is unchanged.

### Content check, docs-watch, sitemap, seed

- `validate.ts`: allowed files come from each track's outline (per-realm chapter count). Folder = `realmFolder(id)` (`09-canvas-workshop`). A specialist folder under the wrong track is "unexpected file". The UNEXPECTED message says `c1–c<N from outline>`.
- `docs-watch.ts`: lesson ids from the outline.
- `app/sitemap.ts`: walks every `REALMS` row; live lessons per track from the outline. No other change.
- `scripts/seed.ts`: the "full realm" check uses the outline's chapter count.
- `e2e`: one flow on a 9-chapter realm once PR 3 lands (case c9 → boss opens).

### Tests (PR 1)

- **Regression guard:** for today's three outlines, `trackExerciseIds(track, outline)` equals today's list, id for id, same order.
- Grammar: every old id parses; `creator/r9/...` parses only with a creator-owned row (fixture table); `c13` and `r99` fail.
- Outline schema: fixture outlines for a missing core realm, core realms out of order, a wrong-owner specialist, 5 and 13 chapters (all fail), a 9-chapter realm (passes).
- Open rule: boss of a 9-chapter fixture realm needs c1–c9; next case after c9 is the boss.
- Level map helper: 6 chapters returns today's columns exactly; 12 chapters fits inside 4–58.
- Certificates: today's slug list is unchanged.

## Fairness and integrity check

| Way to fake progress or leak                              | How the design stops it                                                                                                                                                             |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Post `builder/r9/c1/challenge` to farm XP on another path | The grammar is built per track; the id does not parse. Even if it did, no file exists, so `checkOpen` returns `INVALID_INPUT`. No HP change, no XP.                                 |
| Skip to the boss of a grown realm                         | The boss needs every chapter case listed in the outline. The server reads the outline; the browser sends only the id.                                                               |
| Earn chapter XP twice after a realm grows                 | New chapters have new ids (c7+). Old ids are never renamed, so the award-once index (`xp_events_award_once_idx`) still holds.                                                       |
| XP per chapter                                            | Unchanged: lesson, case, quick check and boss amounts stay in `XP_REWARDS`. A path with more chapters has more XP to earn. Accepted: XP measures work done (see Calls).             |
| Certificate without the work                              | Still derived from one boss `progress` row; the boss open check proves its chapters. A boss cleared before the realm grew keeps its certificate (it was earned under the old rule). |
| Shared-chapter credit                                     | Groups are unchanged. A new group that names a specialist chapter goes through the shared-chapters content-reviewer checks first.                                                   |
| Answers leak                                              | No change: correct indexes and explanations stay server-only (`import 'server-only'`). New realms use the same loaders.                                                             |
| Advanced tier                                             | Specialist realms use the same tier rule. An `advanced` specialist realm is visible and locked, like r6–r8.                                                                         |

## Data model

N/A. No table, column, index or migration. Exercise ids are `text`. `progress`, `submissions` and `xp_events` already hold any id. `clearedIds` reads `like '<track>/%'`, which already includes `creator/r9/…`. Not `SCHEMA REVIEW REQUIRED`.

## API contract

No new action or route. Every Server Action still runs `checkOpen`, which now reads the outline for the chapter count. Errors: the existing `INVALID_INPUT`, `NOT_OPEN`, `TIER_LOCKED`. Revalidation: unchanged.

## AI and cost

No new model call. The mentor still answers only from the current lesson's sources. No image, video or audio is generated inside Sigmorai. Cost: zero new model spend. Content authoring is the cost: about 25 files per realm.

## States and transitions

| State                                    | Shows                                                                                            |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Specialist realm, outline only, no files | Realm page open, "No chapters in this realm are ready yet", chapters COMING SOON (today's state) |
| Specialist realm, some chapters live     | Normal open / locked-by-order / done                                                             |
| Grown core realm, new chapters not live  | New chapters COMING SOON; boss locked ("Clear every chapter in this realm first.")               |
| Boss cleared before the realm grew       | Realm CLEARED, certificate kept; new chapters open to play                                       |
| Specialist realm with `?track=<other>`   | The realm's own path; canonical URL without `?track=`                                            |
| Realm without art                        | Flat `neutral` scene, nodes on top; site-default OG image                                        |
| Dashboard, path read fails               | The existing dashboard error boundary                                                            |
| Dashboard, nothing started               | Every row "OPEN" (or locked), Continue card points to r0 c1                                      |
| 360px                                    | Dashboard rows stack (name, then state); level map scrolls sideways (the only sideways scroll)   |

## Creator specialist content (v1)

### Source check (2026-10-07)

I tried to open every proposed URL with WebFetch. **The network egress proxy in this session blocks most vendor hosts** (`developers.openai.com`, `ai.google.dev`, `docs.cloud.google.com`, `developers.figma.com`, `canva.dev`, `developer.adobe.com`, `helpx.adobe.com`, `elevenlabs.io`, `docs.midjourney.com`, `huggingface.co`, `platform.stability.ai`, `modelcontextprotocol.io`, `c2pa.org`, `w3.org`). It allows `platform.claude.com`, `code.claude.com`, `anthropic.com` and `github.com`. So each URL has a status:

- **F**: fetched today with WebFetch; the page says what the row needs.
- **R**: already cited by a merged lesson (it passed content-reviewer before). Not re-fetched today (blocked).
- **S**: found today by web search with this exact URL and title. Not fetched (blocked).
- **X**: not reached. Must be found and checked before a lesson cites it.

**Every content PR re-fetches every URL it cites** (validate-content skill), from a session that can reach the host. No API shape is stated in this spec on purpose.

| Key                      | URL                                                                                                                         | Owner        | Status                                                                                               |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------- |
| `figma-mcp-guide`        | https://github.com/figma/mcp-server-guide                                                                                   | Figma        | F (tools; "write to the canvas (remote server only)"; custom rules; Code Connect; variables)         |
| `figma-mcp`              | https://developers.figma.com/docs/figma-mcp-server/                                                                         | Figma        | R                                                                                                    |
| `figma-mcp-tools`        | https://developers.figma.com/docs/figma-mcp-server/tools-and-prompts/                                                       | Figma        | R                                                                                                    |
| `figma-plugins`          | https://developers.figma.com/docs/plugins/                                                                                  | Figma        | S                                                                                                    |
| `figma-rest`             | https://developers.figma.com/docs/rest-api/                                                                                 | Figma        | S                                                                                                    |
| `figma-variables`        | https://developers.figma.com/docs/rest-api/variables-endpoints                                                              | Figma        | S                                                                                                    |
| `figma-code-connect`     | https://github.com/figma/code-connect                                                                                       | Figma        | F                                                                                                    |
| `canva-mcp`              | https://www.canva.dev/docs/mcp/                                                                                             | Canva        | S                                                                                                    |
| `canva-dev-mcp`          | https://www.canva.dev/docs/apps/dev-mcp-server/                                                                             | Canva        | S                                                                                                    |
| `canva-connect`          | https://www.canva.dev/docs/connect/                                                                                         | Canva        | X                                                                                                    |
| `canva-connect-kit`      | https://github.com/canva-sdks/canva-connect-api-starter-kit                                                                 | Canva        | F (designs, assets, brand templates)                                                                 |
| `canva-apps-kit`         | https://github.com/canva-sdks/canva-apps-sdk-starter-kit                                                                    | Canva        | F                                                                                                    |
| `firefly-api`            | https://developer.adobe.com/firefly-api                                                                                     | Adobe        | S (generate, expand, fill, object composite, custom models)                                          |
| `firefly-custom-models`  | https://helpx.adobe.com/firefly/web/custom-models.html                                                                      | Adobe        | S (seen only as the `id_en` locale copy; check the base URL)                                         |
| `mcp-spec-repo`          | https://github.com/modelcontextprotocol/modelcontextprotocol                                                                | MCP          | F (spec repo; the authorization page was not confirmed)                                              |
| `mcp-intro`              | https://modelcontextprotocol.io/docs/getting-started/intro                                                                  | MCP          | X                                                                                                    |
| `claude-mcp-connector`   | https://platform.claude.com/docs/en/agents-and-tools/mcp-connector                                                          | Anthropic    | F (remote MCP from the API; allowlist/denylist tools; OAuth bearer tokens)                           |
| `claude-vision`          | https://platform.claude.com/docs/en/build-with-claude/vision                                                                | Anthropic    | F (reads images; cannot generate or edit them)                                                       |
| `claude-prompting`       | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices                    | Anthropic    | F                                                                                                    |
| `claude-memory`          | https://code.claude.com/docs/en/memory                                                                                      | Anthropic    | F (CLAUDE.md / AGENTS.md project rules)                                                              |
| `anthropic-aup`          | https://www.anthropic.com/legal/aup                                                                                         | Anthropic    | F (impersonation; synthetic media of political figures)                                              |
| `openai-image`           | https://developers.openai.com/api/docs/guides/image-generation                                                              | OpenAI       | R + S                                                                                                |
| `openai-image-prompting` | https://github.com/openai/openai-cookbook/blob/main/examples/multimodal/image-gen-models-prompting-guide.ipynb              | OpenAI       | F (file exists; body not readable through WebFetch)                                                  |
| `openai-video`           | https://developers.openai.com/api/docs/guides/video-generation                                                              | OpenAI       | R                                                                                                    |
| `sora-guide`             | https://developers.openai.com/cookbook/examples/sora/sora2_prompting_guide                                                  | OpenAI       | R (+ F: notebook present in `openai-cookbook/examples/sora`)                                         |
| `openai-audio`           | https://developers.openai.com/api/docs/guides/audio                                                                         | OpenAI       | R                                                                                                    |
| `openai-tts`             | https://developers.openai.com/api/docs/guides/text-to-speech                                                                | OpenAI       | R                                                                                                    |
| `openai-stt`             | https://developers.openai.com/api/docs/guides/speech-to-text                                                                | OpenAI       | R                                                                                                    |
| `openai-vision`          | https://developers.openai.com/api/docs/guides/images-vision                                                                 | OpenAI       | R                                                                                                    |
| `openai-pricing`         | https://developers.openai.com/api/docs/pricing                                                                              | OpenAI       | R                                                                                                    |
| `openai-usage-policies`  | https://openai.com/policies/usage-policies/                                                                                 | OpenAI       | X (known 403 to the fact-checker, `sources.yaml` note)                                               |
| `gemini-image`           | https://ai.google.dev/gemini-api/docs/image-generation                                                                      | Google       | R                                                                                                    |
| `gemini-veo`             | https://ai.google.dev/gemini-api/docs/veo                                                                                   | Google       | R                                                                                                    |
| `gemini-speech`          | https://ai.google.dev/gemini-api/docs/speech-generation                                                                     | Google       | R                                                                                                    |
| `gemini-image-und`       | https://ai.google.dev/gemini-api/docs/image-understanding                                                                   | Google       | R                                                                                                    |
| `gemini-pricing`         | https://ai.google.dev/gemini-api/docs/pricing                                                                               | Google       | R                                                                                                    |
| `gemini-cookbook`        | https://github.com/google-gemini/cookbook/tree/main/quickstarts                                                             | Google       | F (Get_started_Veo, Get_started_Lyria, Get_started_TTS, Get_Started_Voices, Get_Started_Nano_Banana) |
| `imagen-guide`           | https://docs.cloud.google.com/vertex-ai/generative-ai/docs/image/img-gen-prompt-guide                                       | Google       | S (subject, context, style; lens and lighting)                                                       |
| `veo-guide`              | https://docs.cloud.google.com/vertex-ai/generative-ai/docs/video/video-gen-prompt-guide                                     | Google       | S (subject, context, action, style, camera motion)                                                   |
| `veo-rewriter`           | https://docs.cloud.google.com/vertex-ai/generative-ai/docs/video/turn-the-prompt-rewriter-off                               | Google       | S                                                                                                    |
| `lyria-vertex`           | https://docs.cloud.google.com/vertex-ai/generative-ai/docs/music/generate-music                                             | Google       | S                                                                                                    |
| `google-genai-policy`    | https://policies.google.com/terms/generative-ai/use-policy                                                                  | Google       | R                                                                                                    |
| `runway-models`          | https://docs.dev.runwayml.com/guides/models                                                                                 | Runway       | R                                                                                                    |
| `runway-refs`            | https://docs.dev.runwayml.com/recipes/reference-media                                                                       | Runway       | R                                                                                                    |
| `runway-multishot`       | https://docs.dev.runwayml.com/recipes/multi-shot-video                                                                      | Runway       | R                                                                                                    |
| `runway-product-ad`      | https://docs.dev.runwayml.com/recipes/product-ad                                                                            | Runway       | R                                                                                                    |
| `mj-style-ref`           | https://docs.midjourney.com/docs/style-reference                                                                            | Midjourney   | S                                                                                                    |
| `mj-params`              | Midjourney parameter list (URL not confirmed)                                                                               | Midjourney   | X                                                                                                    |
| `stability-api`          | https://platform.stability.ai/docs/api-reference                                                                            | Stability    | X                                                                                                    |
| `diffusers-repo`         | https://github.com/huggingface/diffusers                                                                                    | Hugging Face | F                                                                                                    |
| `diffusers-docs`         | https://huggingface.co/docs/diffusers                                                                                       | Hugging Face | X                                                                                                    |
| `el-docs`                | https://elevenlabs.io/docs                                                                                                  | ElevenLabs   | S                                                                                                    |
| `el-audio-tags`          | https://elevenlabs.io/docs/help-center/product/core-capabilities/text-to-speech/how-do-audio-tags-work-with-eleven-v3-alpha | ElevenLabs   | S (help-center page; check it counts as docs)                                                        |
| `el-dialogue`            | https://elevenlabs.io/docs/capabilities/text-to-dialogue                                                                    | ElevenLabs   | S                                                                                                    |
| `el-dubbing`             | https://elevenlabs.io/docs/overview/capabilities/dubbing                                                                    | ElevenLabs   | S                                                                                                    |
| `el-sfx`                 | https://elevenlabs.io/docs/capabilities/sound-effects                                                                       | ElevenLabs   | X                                                                                                    |
| `el-voices`              | https://elevenlabs.io/docs/capabilities/voices                                                                              | ElevenLabs   | X                                                                                                    |
| `dtcg-format`            | https://github.com/design-tokens/community-group/tree/main/technical-reports/format                                         | W3C DTCG     | F (Design Tokens Format Module source)                                                               |
| `premiere-extend`        | Adobe Premiere Generative Extend help page (not found)                                                                      | Adobe        | X (only press pages found)                                                                           |

**Registry work.** `figma-developer-docs`, `runway-api-docs`, `anthropic-aup`, `google-genai-prohibited-use`, `openai-docs`, `gemini-docs`, `claude-docs`, `claude-code-docs`, `mcp-docs`, `mcp-spec` already exist in `content/sources.yaml`. New ids are added only when a lesson cites them (content rule): candidates `canva-dev`, `adobe-firefly-api`, `adobe-helpx-firefly`, `vertex-ai-docs`, `gemini-cookbook`, `openai-cookbook-repo`, `figma-github`, `canva-sdks-github`, `elevenlabs-docs`, `midjourney-docs`, `stability-docs`, `diffusers`, `dtcg`.

### Creator path order (lean)

`r0 Bootstrap Village · r1 Prompt Forest (9 ch.) · r11 Pigment Bazaar · r2 Tool Forge · r10 Reel Hollow · r12 Echo Caverns · r3 Context Library · r13 Pattern Atelier · r4 Agent Citadel · r5 MCP Bridgelands · r9 Canvas Workshop · r6 Eval Arena · r7 Swarm Spire · r8 Production Peaks`

Why: craft realms come right after the core realm they build on (image craft after prompting, video and audio after tools, design systems after context, design tools after MCP). Ids follow ship order (r9 ships first); map order is the outline.

Realm names and NPCs below are **drafts** for voice-guardian. Titles ≤ 16 chars, no vendor names in titles or `boss.task` (vendor-neutral rule). Tier: all open (beginner or intermediate).

### Creator r1 Prompt Forest: deepen to 9 chapters (c7–c9 new)

Why: the maintainer says designer prompts are not technical prompts. r1 c1–c6 already cover shot, reference, style, edit, video and review. The new chapters name the visual vocabulary and the difference from text prompting.

| Ch. | Title          | Teaches                                                                                                         | Sources (status)                                                 |
| --- | -------------- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| c7  | Light & colour | Naming light (time of day, direction, quality) and palette in a prompt; what each vendor's guide lists          | `imagen-guide` (S) · `openai-image` (R) · `gemini-image` (R)     |
| c8  | Composition    | Framing, camera angle, lens, aspect ratio, empty space for copy; what the model can and cannot hold             | `imagen-guide` (S) · `gemini-image` (R) · `openai-image` (R)     |
| c9  | Design vs text | Why a design prompt describes what is seen, not steps to follow; prompt rewriters; when text-prompt habits fail | `claude-prompting` (F) · `imagen-guide` (S) · `veo-rewriter` (S) |

Boss: unchanged task. The boss case gets no new question type; its 5 questions may now come from any of the 9 chapters.

### r9 Canvas Workshop: Design tools & MCP (intermediate, 8 chapters)

NPC (draft): Guildmaster Ines. Topic: "Linking an AI assistant to design tools: read, write, export, safely."

| Ch. | Title            | Teaches                                                                                       | Sources (status)                                                                                      |
| --- | ---------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| c1  | Design servers   | What a design-tool MCP server gives an assistant; remote vs desktop server; which tools exist | `figma-mcp-guide` (F) · `canva-mcp` (S) · `mcp-spec-repo` (F)                                         |
| c2  | Read the canvas  | Design context, variables, metadata and screenshots as input; why a screenshot alone misleads | `figma-mcp-tools` (R) · `figma-mcp-guide` (F) · `claude-vision` (F)                                   |
| c3  | Write to canvas  | Tools that create or change design content; beta limits; review before you keep a change      | `figma-mcp-guide` (F) · `figma-plugins` (S) · `canva-connect-kit` (F)                                 |
| c4  | Template fills   | Filling brand templates with copy and images at scale                                         | `canva-connect-kit` (F) · `canva-connect` (X) · `firefly-api` (S) — **second vendor weak, see Risks** |
| c5  | Creative APIs    | Generate, expand, fill and composite as API steps inside a design job                         | `firefly-api` (S) · `openai-image` (R) · `gemini-image` (R)                                           |
| c6  | Plugins & apps   | Plugins and in-editor apps vs MCP servers: who runs where, what each can touch                | `figma-plugins` (S) · `canva-apps-kit` (F) · `canva-dev-mcp` (S)                                      |
| c7  | Export & handoff | Exporting assets and linking components to code for developers                                | `figma-rest` (S) · `figma-code-connect` (F) · `canva-connect-kit` (F)                                 |
| c8  | Scopes & access  | Tokens, OAuth, tool allowlists, seat limits; read-only first                                  | `claude-mcp-connector` (F) · `figma-variables` (S) · `mcp-spec-repo` (F)                              |

Boss task (draft): "Plan how a small studio links its design tools to an assistant, safely."

### r10 Reel Hollow: Motion & video (intermediate, 8 chapters)

NPC (draft): Lanternist Oto. Topic: "Making and editing short video and motion with generation models."

| Ch. | Title            | Teaches                                                                               | Sources (status)                                                                                                         |
| --- | ---------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| c1  | Video models     | Text-to-video vs image-to-video; length, size and model limits per vendor             | `gemini-veo` (R) · `openai-video` (R) · `runway-models` (R)                                                              |
| c2  | Shot language    | Camera motion, framing and pacing words the guides list                               | `veo-guide` (S) · `sora-guide` (R) · `runway-multishot` (R)                                                              |
| c3  | Frames to motion | Start from a still; first and last frame; when the still wins over the text           | `gemini-veo` (R) · `runway-refs` (R) · `openai-video` (R)                                                                |
| c4  | Same character   | Keeping a face, product or style across shots with references                         | `runway-refs` (R) · `gemini-veo` (R) · `sora-guide` (R)                                                                  |
| c5  | Extend & remix   | Extending a clip and remixing one; what each vendor documents                         | `gemini-veo` (R) · `openai-video` (R) · `premiere-extend` (X)                                                            |
| c6  | Motion graphics  | Animating brand stills and logos, loops, product turns with image-to-video            | `runway-product-ad` (R) · `gemini-cookbook` (F) · `gemini-veo` (R) — **no official AI motion-graphics tool doc reached** |
| c7  | Sound on video   | Native audio, dialogue and effects described in the prompt                            | `gemini-veo` (R) · `sora-guide` (R)                                                                                      |
| c8  | Seconds & cost   | Price per second, drafts before finals, a budget per clip (live pricing pages, dated) | `openai-pricing` (R) · `gemini-pricing` (R) · `runway-models` (R)                                                        |

Boss task (draft): "Plan a 15-second product teaser: shots, frames, sound and budget."

### r11 Pigment Bazaar: Image craft per model (beginner, 8 chapters)

NPC (draft): Dyer Sabe. Topic: "The same brief, written for different image models."

| Ch. | Title           | Teaches                                                                                         | Sources (status)                                                                    |
| --- | --------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| c1  | Model dialects  | Why one prompt gives different results on different models; sentence prompts vs keyword prompts | `openai-image` (R) · `imagen-guide` (S) · `gemini-image` (R)                        |
| c2  | Chat editing    | Models you edit in conversation, turn by turn                                                   | `openai-image` (R) · `gemini-image` (R) · `gemini-cookbook` (F)                     |
| c3  | Keyword prompts | Keyword and modifier prompts; what to leave out                                                 | `imagen-guide` (S) · `mj-style-ref` (S) · `stability-api` (X)                       |
| c4  | Parameters      | Size, aspect ratio, quality, seed: settings outside the prompt                                  | `openai-image` (R) · `gemini-image` (R) · `mj-params` (X) · `stability-api` (X)     |
| c5  | Style refs      | Style references and brand-trained models                                                       | `mj-style-ref` (S) · `firefly-custom-models` (S) · `gemini-image` (R)               |
| c6  | Text in images  | Headlines and labels inside the image; checking spelling                                        | `openai-image` (R) · `imagen-guide` (S) · `openai-image-prompting` (F, body unread) |
| c7  | Open models     | Open-weight image models and what running them yourself changes                                 | `diffusers-repo` (F) · `diffusers-docs` (X)                                         |
| c8  | Pick per job    | Choosing a model per asset: quality, text, edits, price, rights                                 | `openai-pricing` (R) · `gemini-pricing` (R) · `firefly-api` (S)                     |

Boss task (draft): "Choose a model and a prompt style for each asset in a launch kit."

### r12 Echo Caverns: Voice & audio (beginner, 8 chapters)

NPC (draft): Bard Lio. Topic: "Speech, voices, music and sound effects from generation models."

| Ch. | Title           | Teaches                                                       | Sources (status)                                                                  |
| --- | --------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| c1  | Audio models    | Text-to-speech, speech-to-text, music and sound-effect models | `openai-audio` (R) · `gemini-speech` (R) · `el-docs` (S)                          |
| c2  | Voice direction | Steering tone, pace and emotion with words and tags           | `openai-tts` (R) · `gemini-speech` (R) · `el-audio-tags` (S)                      |
| c3  | Dialogue        | Two or more speakers in one clip                              | `gemini-speech` (R) · `el-dialogue` (S)                                           |
| c4  | Custom voices   | Designed and cloned voices; consent first                     | `gemini-cookbook` (F, Get_Started_Voices) · `el-voices` (X) · `anthropic-aup` (F) |
| c5  | Music prompts   | Genre, mood, tempo and structure in a music prompt            | `gemini-cookbook` (F, Get_started_Lyria) · `lyria-vertex` (S)                     |
| c6  | Sound effects   | Describing an effect; length; layering under video            | `el-sfx` (X) · `gemini-veo` (R)                                                   |
| c7  | Dub & localise  | Translating a voice-over; checking timing and names           | `el-dubbing` (S) · `openai-stt` (R) · `openai-tts` (R)                            |
| c8  | Voice rights    | Likeness, impersonation, disclosure; what policies forbid     | `anthropic-aup` (F) · `google-genai-policy` (R) · `openai-usage-policies` (X)     |

Boss task (draft): "Plan the voice-over, music and sound for a short explainer in three languages."

### r13 Pattern Atelier: Design systems with AI (intermediate, 7 chapters)

NPC (draft): Weaver Hale. Topic: "Tokens, components and rules that keep AI output on-brand."

| Ch. | Title             | Teaches                                                              | Sources (status)                                                           |
| --- | ----------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| c1  | Design tokens     | What a token is; the shared format                                   | `dtcg-format` (F) · `figma-variables` (S)                                  |
| c2  | Tokens as context | Giving an assistant variables instead of raw colours                 | `figma-mcp-guide` (F) · `claude-prompting` (F)                             |
| c3  | Components & code | Linking design components to code so the assistant reuses them       | `figma-code-connect` (F) · `figma-mcp-guide` (F)                           |
| c4  | Rules files       | Project rules an agent reads every time (design rules, do and don't) | `figma-mcp-guide` (F, "Add custom rules") · `claude-memory` (F)            |
| c5  | Brand models      | Models trained on a brand's style or subject; limits                 | `firefly-custom-models` (S) · `firefly-api` (S) · `gemini-image` (R)       |
| c6  | Audit output      | A vision model checks output against the system; what it misses      | `claude-vision` (F) · `openai-vision` (R) · `gemini-image-und` (R)         |
| c7  | Keep in sync      | Publishing variables, versioning, who owns changes                   | `figma-variables` (S) · `figma-code-connect` (F) · `canva-connect-kit` (F) |

Boss task (draft): "Design the tokens, components and rules an agent reads before it touches a brand."

**Count:** 3 + 8 + 8 + 8 + 8 + 7 = **42 new creator chapters + 5 bosses** (about 130 content files).

## Later: builder and strategist specialist realms (no detail yet)

Same engine, same flow. Each gets its own spec section before any content.

- **Builder:** Coding Agents (instruction files, hooks, subagents for coding agents) · Voice & Realtime (realtime and voice agents) · Open Models (self-hosting and fine-tuning).
- **Strategist:** AI Procurement (vendor terms, data, contracts) · Team Enablement (training and rollout inside a company) · AI Product (shaping and pricing AI features).

## Phases (small PRs, branch from `canary`)

### PR 1 — `feat(content)`: grid per track (engine)

**Goal:** the engine reads realm lists and chapter counts from each track's outline. No new content. Every old id and page behaves the same.

**Files**

- `lib/constants/exercises.ts`, `lib/constants/curriculum.ts` _(modify)_ — constants above; `REALMS` rows get `track: null`, `scene: true`
- `lib/types/curriculum.ts` _(modify)_ — outline schema
- `lib/content/ids.ts`, `lib/content/curriculum.ts` _(modify)_ — grammar, id lists, accent fallback
- `lib/grading/open.ts`, `lib/grading/case.ts`, `lib/grading/track-map.ts` _(modify)_
- `lib/data/realms.ts`, `lib/data/quest.ts`, `app/(app)/map/[realm]/page.tsx`, `app/(app)/realms/[realm]/*` _(modify)_
- `lib/constants/level-map.ts`, `components/map/level-map.tsx`, `components/realms/realm-scene.tsx` _(modify)_
- `lib/constants/certificates.ts`, `lib/content/validate.ts`, `lib/content/docs-watch.ts`, `app/sitemap.ts`, `scripts/seed.ts` _(modify)_
- Copy: `ui-copy.ts`, `landing-copy.ts`, `realms-copy.ts` _(modify)_
- Tests next to each changed pure helper _(new / modify)_
- Docs: `content/CLAUDE.md`, `.claude/context/project.md`, dated lines in `curriculum-design-plan.md`, `creator-path-design-plan.md`, `level-art-design-plan.md` _(modify)_

This is more than 5 files. It is one change (the grid); splitting it would leave the build red in between. The cto review sees it as one PR.

**Verification:** `bun run typecheck`, `lint`, `test`, `content:check`, `build`, `test:e2e`. The regression test proves the id lists are identical. Browser at 360px and desktop: `/realms`, one realm page per track, `/map/<slug>`, dashboard, a certificate page.

**Gates:** devil → voice-guardian (copy) → cto.

**Approval gate:** maintainer checks the old pages look the same.

### PR 2 — `feat(ui)`: dashboard shows the whole path

**Goal:** replace the 3 realm tiles with the "YOUR PATH" list. Remove `DASHBOARD_REALM_LIMIT`.

**Files:** `app/(app)/dashboard/page.tsx` · `components/dashboard/path-list.tsx` _(new, after searching `components/` for a list primitive)_ · `lib/data/realms.ts` (`getDashboard`) · `lib/constants/curriculum.ts` · `lib/constants/realms-copy.ts` (`DASHBOARD_TEXT`) · CSS in `app/styles/components/`.

**Verification:** typecheck, lint, test, build; browser at 360px and desktop; keyboard walk; Lighthouse a11y on `/dashboard`. **Gates:** devil → ui-ux-reviewer → voice-guardian → cto.

### PR 3 — `feat(content)`: creator r1 c7–c9 (grown realm)

**Goal:** the first real use of per-realm chapter count. Proves the boss rule and the 10-node level map.

**Files:** `content/creator/outline.json` · `content/creator/01-prompt-forest/c7…c9/{lesson.mdx, case.json, quick-check.json}` · `content/sources.yaml` (only ids cited) · one e2e step.

**Gates:** devil → content-reviewer (every claim vs the live page) → voice-guardian → cto.

### PR 4–8 — `feat(content)`: one creator specialist realm per PR

Order: **r9 Canvas Workshop → r10 Reel Hollow → r11 Pigment Bazaar → r12 Echo Caverns → r13 Pattern Atelier.**

**Each PR:** one `REALMS` row (`track: 'creator'`, `scene: false`) · the outline entry · every chapter's `lesson.mdx`, `case.json`, `quick-check.json` · `boss/case.json` · `sources.yaml` ids it cites · NPC lore lines.

**Gates per PR:** devil → content-reviewer **on each chapter** → voice-guardian (NPC, lore, titles, boss task) → cto. **Checks:** `content:check`, `test`, `build`; read two lessons end to end at 360px; play one case and the boss on a branch DB.

If one realm PR is too big to review (about 25 files), split it into c1–c4 and c5–cN + boss. The boss waits for all chapters anyway.

### Later PRs

- **Art:** one Higgsfield art PR per new realm (fresh art, level-art spec). Sets `scene: true`.
- **Tokens:** one Claude Design pass adds accent tokens for the new realms (and the creator track colour).
- **Builder, then strategist:** one spec section, then one realm per PR, same gates.

---

## Acceptance criteria

- [ ] PR 1: for today's three outlines, every exercise id list, page and certificate slug is the same as before (regression test).
- [ ] A track outline with 6–12 chapters in a realm passes `content:check`; 5 or 13 fails.
- [ ] A creator specialist realm id does not parse on builder or strategist.
- [ ] The boss of a 9-chapter realm stays locked until c1–c9 cases are cleared; the next case after c9 is the boss.
- [ ] A boss cleared before its realm grew keeps the realm CLEARED and the certificate.
- [ ] `/realms?track=builder` never lists a creator specialist realm; `/realms/canvas-workshop?track=builder` shows the creator path.
- [ ] A realm with no art shows the flat `neutral` scene; no old realm image is reused.
- [ ] The dashboard lists every realm of the path in outline order, with state as text + icon, at 360px with no page scroll.
- [ ] Every specialist realm has a certificate on its owner path; the Math Tower certificate is unchanged.
- [ ] No new hex, no new radius; specialist accents are `neutral` until tokens exist.
- [ ] No chapter title or `boss.task` names a vendor. Every lesson cites at least 2 official vendors where 2 document the concept, every url under a `trustTier: official` entry, every url re-fetched in its PR.
- [ ] XP amounts unchanged (`XP_REWARDS`); no `xp_events` row for an id outside the grammar.
- [ ] Shared-chapter groups unchanged; `content:check` still passes them.
- [ ] No migration file.

## Risks

- **Content volume.** 42 chapters + 5 bosses ≈ 130 files, each checked against live pages. That is about as much as one full track took. Mitigation: one realm per PR, content-reviewer on each chapter, ship order puts the maintainer's top asks first (design tools, motion).
- **Source reach.** This session's network blocks most vendor docs, so most URLs are R or S, not F. Content PRs need a session that can reach `developers.figma.com`, `canva.dev`, `developer.adobe.com`, `elevenlabs.io`, `docs.cloud.google.com` and the rest. Without it, the validate-content step cannot pass.
- **Single-vendor chapters.** "Template fills" (r9 c4), "Sound effects" (r12 c6), "Open models" (r11 c7) and "Motion graphics" (r10 c6) lean on one vendor today. The rule says a third-party vendor is never the only vendor for a concept. Each needs a second official source, or the chapter is merged into a neighbour before content starts.
- **Vendor docs move fast.** Figma's write-to-canvas is beta; Lyria and ElevenLabs music are new. Lessons must date volatile claims, and docs-watch must cover the new pages.
- **Art.** Five realms without scenes look plainer than the core realms. Until Higgsfield art exists, the flat `neutral` scene is the honest placeholder.
- **Grown realms.** Adding chapters to a core realm re-locks the boss for players who were close. Small, but some players will notice.
- **Path imbalance.** Creator will have far more XP to earn than builder or strategist until their realms come. The all-time leaderboard mixes paths.
- **Copy hunt.** Hidden "6" and "9" in copy and tests. PR 1 greps for `CHAPTER_COUNT`, `REALM_COUNT`, "nine", "six" and literal `6`/`9` in copy.

## Out of scope

- Any in-app generation or media upload. Cases still describe media in the text `exhibit`.
- Builder and strategist specialist content (listed only).
- Higgsfield art and new design tokens (later PRs).
- Shared-chapter groups for specialist chapters.
- A per-path leaderboard or XP weighting.
- Renaming any realm, chapter or id. Removing chapters.
- A Scientist path (it will reuse this engine).
- Changing the Math Tower or the Frontier.

## Calls I'm under 95% on

1. **Global realm numbers + an owner on each `REALMS` row.** Lean: yes (r9+ unique across paths, `track: Track | null`). Why: one number still gives one folder, art path and accent, and `REALMS[id]` keeps working. Other option: per-track numbering (`creator/r9` and `builder/r9` differ); downside: the number no longer names one realm, so folder, art, accent and certificate helpers all need the track too.
2. **Exact grammar per track, built from `REALMS`.** Lean: yes. Why: a wrong-path id can never be built or stored. Other option: wide bounds (`r0`–`r99`) and let `hasContent` reject; downside: `buildExerciseId` would accept ids no path has.
3. **Chapter count 6–12, and a realm never shrinks.** Lean: yes. Why: matches the brief ("6–10", "up to 12") and keeps old ids safe. Other option: 3–12 for small specialist realms; downside: a 3-chapter realm feels thin and its boss has too few chapters for 5 questions.
4. **Grown realm boss rule.** Lean: the boss needs every outline chapter; a boss already cleared stays cleared with its certificate. Other option: new chapters are extra and never gate the boss; downside: "cleared" would not mean "did every chapter".
5. **Art placeholder = no image, flat `neutral` fill.** Lean: yes. Why: `content/CLAUDE.md` forbids reusing old realm art, and your brief said "neutral/placeholder". Other option: reuse a core realm's scene; downside: breaks the content rule and makes two realms look the same.
6. **Specialist realms are all open tiers** (beginner or intermediate). Lean: yes. Why: you asked for more content now; an advanced tier would hide it. Other option: put Design Systems in advanced; downside: locked until the paywall exists.
7. **Creator realm list and ship order.** Lean: Canvas Workshop (design tools + MCP) first, then Reel Hollow (motion + video), Pigment Bazaar, Echo Caverns, Pattern Atelier; r1 c7–c9 before all of them. Why: your words were "tools, motion graphics, MCPs" first. Other option: Image Craft first (beginner, easiest to source); downside: your top ask waits.
8. **Map order puts specialist realms next to the core realm they build on** (outline order, ids by ship date). Lean: yes. Other option: all specialist realms after r8; downside: a designer reaches design tools only after production and multi-agent realms.
9. **Dashboard = compact list of every realm.** Lean: yes, replace the tiles. Other option: keep 3 tiles + a "View whole path" link; downside: you asked to see the whole path.
10. **Level map spacing.** Lean: keep today's 7 columns for 6 chapters; spread evenly for other counts. Other option: a wider map for long realms; downside: needs wider art for every realm.
11. **Midjourney and Adobe as sources.** Lean: allowed as official for their own product, never the only vendor (existing rule). Midjourney has no public API, so its docs teach prompt patterns only. Other option: big three only; downside: designers use these tools daily.
12. **XP stays per chapter, so paths have different totals.** Lean: accept. Other option: scale XP per path; downside: breaks "XP per chapter unchanged" and the leaderboard history.
13. **NPCs for specialist realms.** Lean: each gets an NPC and lore, like core realms (names above are drafts). Other option: no NPC, like the Frontier; downside: the realm feels like a side list, not a place on the map.

## Open questions

- Do you accept the realm names and NPC drafts as a starting point for voice-guardian?
- Should the r1 deepening come before Canvas Workshop (lean), or after?
- Can content PRs run in a session whose network reaches the vendor docs hosts listed in Risks?

## Companion plans

- `docs/plans/curriculum-design-plan.md` — realms, tiers, outlines, source rule (gets a dated amendment in PR 1).
- `docs/plans/creator-path-design-plan.md` — the creator path (gets a dated amendment in PR 1).
- `docs/plans/shared-chapters-design-plan.md` — credit between paths (unchanged).
- `docs/plans/level-art-design-plan.md` — art for the new realms (later PRs).
- `docs/plans/certificates-design-plan.md` — one certificate per realm.
- `docs/plans/quest-actions-design-plan.md` — open rule and grading.
