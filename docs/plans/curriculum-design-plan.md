# Sigmorai — Curriculum

> What Sigmorai teaches, in what order, for whom, and what is open or locked. It fixes the realm map, the Math Tower floors, the beginner path, the tier lock and the first content cut. Read end-to-end before any code; each phase is gated by explicit approval.

## Status

**STATUS: Approved 2026-10-05, devil pass applied. Build step: cross-cutting (data in step 3, lock in step 5, Math Tower in step 6). Track: both.**

## Amendments

## Amendments locked 2026-10-08 (lesson template)

- **Every chapter lesson uses one fixed teaching template:** Goal → The problem → The idea → Worked example → Common mistakes → Try it → Recap. Why: the maintainer rated the lessons "messy, blog-like, no examples" (Claude's score 5/10: facts 8, structure 4, examples 4, practice 5, engagement 3). The pilot `builder/r1/c2` passed content-reviewer (0 blockers) and voice-guardian, and the maintainer approved it ("it is better").
- The exact section and voice rules live in `content/CLAUDE.md` ("Lesson template"). Rollout: one PR per realm and path, each through content-reviewer and voice-guardian; ids, sources, cases and quick checks keep their meaning, so no learner progress is lost.

## Amendments locked 2026-10-07 (dashboard path list, per-path PR 2)

- **Supersedes "up to `DASHBOARD_REALM_LIMIT` (3) active realms"** (2026-10-05 block below). `/dashboard` now lists every realm of the player's path in "YOUR PATH" (`components/realms/path-list.tsx`, shared with `/map`), with a "View on world map" link to `/map`. `DASHBOARD_REALM_LIMIT` is deleted. See `docs/plans/path-curriculum-design-plan.md` → PR 2.

## Amendments locked 2026-10-07 (SIG-29: the Frontier is playable)

- **Route `/frontier`** (`app/(app)/frontier`, public like `/math`): a newest-first list of chapters (title, date, `minutes`, state). With no chapter it shows one plain empty-state panel ("No chapters yet. We add a chapter when official docs publish something new.") and nothing else. No scene art, no NPC, accent `neutral`, site-default OG image.
- **Design:** derived from the Math Tower screens (isMath); the design file has no Frontier screen.
- **Open rule: every Frontier chapter is open.** No order, no tier. `decideOpen` returns ok for a Frontier ref whose file exists. Replaces "Frontier ids return `INVALID_INPUT`" (quest-actions §Open check, Math Tower amendment 2026-10-06).
- **XP: the existing lesson (+10) and quick-check (+5) rewards, once per user.** Frontier ids have no track, so progress and XP are **shared across paths** (same as the tower). This replaces "Frontier progress is written under the active track" (devil pass 2026-10-05): the shipped id grammar wins.
- **Quest pages reuse the realm views:** tag `THE FRONTIER · <YYYY-MM-DD> · LESSON | QUICK CHECK`, no DialogBox. Lesson Continue → the chapter's quick check. Quick-check Continue → `/frontier`. Back link → `/frontier`.
- **Entry points: no header slot** (header amendment 2026-10-07 stands). A dashboard FRONTIER panel like the Math Tower panel: the newest uncleared chapter with an Open button, else one sentence; a "View the Frontier" link in every state. A "Side realms" link row on `/realms` (Math Tower, The Frontier). Replaces "nav item + dashboard shortcut".
- **SEO:** `/frontier` and every Frontier lesson join the sitemap. Quick checks never do.
- **`content:check` for `content/frontier/<YYYY-MM-DD>-<slug>/`:** folder name must parse; the folder holds exactly `lesson.mdx` + `quick-check.json` (both required); lesson frontmatter `id` = `frontier/<folder>/lesson`, sources official; lesson body compiles with **no components** (no `<DialogBox>`); quick check = 3 questions, giveaway rules. The existing checks already do the rest.
- **No sample chapter.** The code ships with the empty state; the first chapter comes from a hand-run `/knowledge-sync` PR (KB amendment 2026-10-07). Tests use fixtures.
- **No certificate, no stat, no schema change.** `level_announcements` stays deferred (KB 2026-10-06).
- **Dead:** the `unavailable` quest page kind and its copy; the `frontier-chapter` triage outcome; "sync job" means the hand-run knowledge-sync skill.

## Amendments locked 2026-10-07 (header)

- **Blog takes the Math Tower's header slot** (maintainer: the header holds meaningful items and must include Blog). The Math Tower is no longer a nav item. It stays reachable from the dashboard Math Tower panel (a "View the tower" link in every state) and keeps its `/math` routes and certificate. Later it becomes a chapter of the Scientist path. This replaces "a nav item + a dashboard shortcut" for the tower below; the Frontier's nav slot is decided when the Frontier ships.

## Amendments locked 2026-10-08 (one header)

- **One `SiteHeader` on every page** (maintainer): the (app) and (marketing) layouts and the site 404. Same logo, same nav in the same order (`aria-current` on the current section), and a right side that changes only with auth state: Sign in + Start free (plain links to `/sign-in` and `/sign-up`) for a visitor, the HUD for a player. Below `sm` a visitor's Sign in moves into the Menu panel, so the header is one row at 360px. On `/sign-in` and `/sign-up` the link to the current page is left out.
- **Removed:** the landing nav (`LandingNav`) and `MarketingHeader`. Before this, public pages drew their own header (logo only, or logo + CTA); they duplicated it. The landing hero copy sits in the header's column (`max-w-app`, same inset).
- **Sign-in and sign-up live in `(marketing)`** (same URLs), so they get the shared header and footer.
- **Public pages stay static and read the HUD on the client:** `PublicHud` reads Clerk in the browser and, for a player, calls **`GET /api/hud`** (`private, no-store`; signed out = `{ status: 'signed-out' }` with no DB query; a generic 500). The response is parsed with `HudStateSchema` (`lib/types/hud.ts`); a bad body or a 10s timeout is the HUD error view with Retry. While Clerk loads, the visitor buttons are hidden only when Clerk's cookie says a player is likely signed in, and for at most 3s.

## Amendments locked 2026-10-06 (bosses)

- **A boss is a `case.json`, same schema as a chapter case.** `CaseSchema`, `loadCase`, the quest page, `submitCase`, the open check and the map already handle `<track>/r<N>/boss/challenge`. No new format, no code. Supersedes "Out of scope: boss format" and the "Stub: … bosses" row (2026-10-05).
- **Boss shape:** 5 questions (the case max), one longer exhibit with labelled parts (`BRIEF:`, `TRACE:`, `BUDGET:` …), each question on a different chapter of the realm. Pass is already every question right.
- **The id stays `<track>/r<N>/boss/challenge`.** Ids are forever.
- **A boss opens after all 6 chapter cases of that realm.** Clearing it marks the realm cleared (7/7) and pays +500. It does not gate the next realm (realms open by tier).
  > **Amended 2026-10-07:** "all 6" is now every chapter in that track's outline (6 to 12). See `path-curriculum-design-plan.md` → "Amendments locked 2026-10-07 (devil pass, maintainer "go with your lean")".
- **XP +500** (`XP_REWARDS.boss`), normal HP rule (3 failed tries per UTC day). Replay after a clear is free practice.
- **No schema change.**
- **UI:** the quest case page, the castle map node and the "Boss battle" row. No boss scene, no NPC intro.
- **Boss title = the outline `boss.task` line, verbatim.**
- **Content order:** realm 0 bosses on all three tracks first, then builder r1–r5, then strategist r1–r5. Realms 6–8 and creator r1–r8 wait for their chapters.
- **Existing players:** nothing is migrated or revoked. The boss node turns open when the file lands.

## Amendments locked 2026-10-06 (Creator path)

- **A third track, Creator, is added** (`docs/plans/creator-path-design-plan.md`). Supersedes "Three audiences, still two tracks. No third track." (2026-10-05) and the brief's "Two paths" (`docs/build-prompt.md:32`). Why: designers use different models and tools; neither path spoke to them. A fourth track (Scientist) is planned.

## Amendments locked 2026-10-06 (SIG-39, analytics + AI search readiness)

- **Analytics are Vercel Web Analytics and Speed Insights**, in `app/layout.tsx` (`@vercel/analytics/next`, `@vercel/speed-insights/next`). Cookieless, so there is no consent banner. No custom events.
- **CSP:** on a deployment both scripts load from the site itself (`/_vercel/…` or a per-build path) and send to it, so `'self'` covers them. Only `next dev` adds `https://va.vercel-scripts.com` to `script-src` (the debug scripts). The landing page stays static (○).
- **Privacy page** gets a "Visit statistics" section (what Vercel records, no cookies, the 24-hour visitor hash) and a new cookies line. Facts and sources sit in the header of `lib/constants/legal-copy.ts`. Needs a voice-guardian pass.
- **`/llms.txt`** (`app/llms.txt/route.ts` → `lib/content/llms.ts`) is static Markdown in the llmstxt.org shape: name, summary, then links to `/realms`, `/math`, `/blog` and each post, with `/leaderboard`, the sitemap, the RSS feed and `/privacy` under "Optional". Every line comes from existing page meta.
- **Robots: AI search yes, training no** (maintainer, 2026-10-06). `AI_SEARCH_AGENTS` (OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User) get the same allow and disallow list as `*`, so AI search can cite lessons. `AI_TRAINING_AGENTS` (GPTBot, ClaudeBot, CCBot, Google-Extended, Applebot-Extended) are disallowed from `/`. Both lists live in `lib/constants/site.ts`. Google-Extended and Applebot-Extended are control tokens, not crawlers; the user-fetch agents may ignore robots.txt, per their vendors.
- **JSON-LD** (`lib/content/json-ld.ts`, `components/json-ld.tsx`): WebSite + Organization on `/`, BlogPosting on each post. No Course schema, no logo or image yet.
- **Waits on the maintainer:** (1) Vercel → project → Analytics and Speed Insights → Enable, then redeploy (until then the scripts 404). (2) Google Search Console: add a Domain property for `sigmorai.com`, put the TXT record it gives in DNS, verify, then submit `https://sigmorai.com/sitemap.xml`. No meta verification tag in the code. (3) After Enable + redeploy, check DevTools on sigmorai.com: no CSP violations, 2xx on `/<path>/view` and `/vitals`, and no cookie from either script. If Speed Insights loads from `va.vercel-scripts.com`, add it to the production `script-src`.

## Amendments locked 2026-10-06 (SIG-24, SEO + accessibility pass)

- **Per-page metadata is already done** (realm pages, lessons, blog, catalog). No change here.
- **Case and quick-check pages are `noindex`.** The quest page's non-lesson metadata returns `robots: { index: false }`.
- **Sitemap (`app/sitemap.ts`, built by `lib/content/sitemap.ts`)** is static and lists, as absolute URLs on `SITE_URL`: `/`, `/realms`, `/math`, `/blog`, `/privacy`; every indexable realm page (`getRealmMeta(slug).indexable`); every live lesson on both tracks and every live Math Tower floor lesson; every blog post (`lastModified` = post date). Not listed: `/map/*`, cases, quick checks, private pages. The leaderboard joins when it ships. Supersedes the §SEO and accessibility sitemap line and closes the three "sitemap: later ticket" notes (this spec, quest-actions, knowledge-base).
- **Robots (`app/robots.ts`)** allows `/`, disallows `/dashboard`, `/profile`, `/onboarding`, `/api/`, and points to `/sitemap.xml`. No per-environment branch: Vercel sends `X-Robots-Tag: noindex` on preview deployments (but not on a custom domain assigned to a preview branch).
- **The proxy matcher skips `.txt` and `.xml`**, so the crawler files (robots, sitemap, llms.txt, RSS feed) never run Clerk middleware.
- **After the leaderboard merged (#47):** the sitemap also lists `/leaderboard` (all-time view only, no range param), and robots also disallows Clerk's `/sign-in` and `/sign-up`. Supersedes "the leaderboard joins when it ships" above.
- **Not in this ticket:** structured data, OG image, `llms.txt`, analytics (SIG-34, SIG-39), a title-template refactor.
- **The SIG-34 share image lives in `app/(marketing)/opengraph-image.tsx`, not `app/`.** At the root, the landing page's own `openGraph` object replaces it and `og:image` is lost; a file in the page's own segment wins. The route group adds a suffix to the URL (`/opengraph-image-<hash>`).
- **One static share image for all public pages** (landing, blog, privacy, realms), made at build time. Twitter falls back to it; the landing card is `summary_large_image`.
- **Per-post (blog) and per-realm share images are deferred** to a later ticket.
- **The accessibility pass is a verify step:** Lighthouse (accessibility + SEO) on the main public routes and a keyboard walk at 360px; real findings fixed in the same branch. No Playwright/axe test and no CI job (SIG-26 owns that). Fixed: realm Start/Continue links carry the realm name in screen-reader text (`RealmActionLabel`); the landing Sign in ghost button gets a solid ink fill (it was 3.6:1 on the sky); the skip link is 44px tall.

## Amendments locked 2026-10-06 (Math Tower playable, step 6)

- **A floor is cleared by its quick check.** Floor 1 is open. Floor N opens when `math/f(N−1)/quick-check` has a `progress` row. The lesson alone does not open the next floor.
- **No tier gate and no realm gate** for the Math Tower. Every floor is free on both paths. The Frontier still returns `INVALID_INPUT` from the open check.
- **New lock text:** `floorNotOpenText(n)` = "Clear floor n first." (`lib/constants/ui-copy.ts`, next to `notOpenText`).
- **No new quest page kind.** A floor lesson and quick check use the realm views with: tag "MATH TOWER · FLOOR n · LESSON | QUICK CHECK", accent `math`, NPC `MATH_TOWER.npc`. Lesson Continue → the floor's quick check. Quick-check Continue → the next floor's lesson if it has content, else `/math`. Back link → `/math`, labelled "Back to tower".
- **`/math` is public.** It shows 8 floor cards. A floor with no content files shows COMING SOON and is not a link. Visitors see a sign-in note.
- **XP once across paths needs no code.** Math ids have no track, so `xp_events_award_once_idx` and the `progress` primary key already award a floor once per user.
- **No schema change.**
- **The §Content files outline field list is superseded** by the 2026-10-05 amendment: a floor is `{ n, covers, formulas[{ math, text }] }`.
- **Not in this ticket:** the Frontier list page and open rule, a Math level map, the dashboard Math panel and MATH FLOORS stat, any Oru DialogBox line.
- **The design's FLOORS order and its Oru line outside a DialogBox are stale.** `MATH_FLOORS` and the two-voice rule win.
- **Later (dashboard follow-up): the dashboard Math panel and MATH FLOORS stat ship.** The MATH TOWER panel shows the first open floor ("FLOOR n", one sentence "<name> is open.", a Climb button to its playable step). When every live floor is cleared, or the next floor is not built, it shows one sentence and a "View the tower" link to `/math`. MATH FLOORS = cleared live floors / live floors, hidden while no floor has content. Plain product voice, no Oru line. This supersedes the "Not in this ticket" line above and the dashboard's earlier "Not built yet" note for these two items.

## Amendments locked 2026-10-06 (SIG-36, path switch)

- **The switch lives on `/profile`** ("YOUR PATH" panel), not in the HUD. The HUD track stays a read-only Badge.
- **The design reference plans a HUD TrackToggle** (`design/BUILD_PROMPT_NEXTJS_BUN.md:29`). The profile panel replaces it for now.
- **One Server Action, `switchTrack`** (`lib/actions/switch-track.ts`), updates `users.track` only. The user id comes from the session; the form sends one track.
- **No schema change.** Progress is already per track through the exercise id (`db/CLAUDE.md` invariant 4), so the old path's progress stays and shows again on a switch back.
- **XP, level and streak are one ledger**, shared by both paths. Math Tower (and Frontier) progress is shared too: those ids have no track.
- **No confirm box, no rate limit.** A switch loses nothing and grants nothing. Saving the same path is a no-op success.
- **When the leaderboard is built (step 6):** it shows the player's current path next to their total level. Its 60 s cache may show the old path for up to a minute.
- **Onboarding copy changed:** "You can't change your path yet" → "You can change your path later on your profile."

## Amendments locked 2026-10-05 (PR 4: builder outline rewrite)

- **Builder titles are vendor-neutral and no-code.** Replaces the builder column of §Realm map. Changed: r0c4 Streaming → Multimodal input · r1c3 XML tags → Structure the prompt · r1c5 JSON output → Structured output · r1c6 Prefill → Grounded answers · r2c1 Messages recap → Why tools · r2c2/c3 → Define a tool / Results & errors (c2 was Tool results, c3 was Define a tool) · r2c6 Tool search → Prompt injection · r4c3 Agent SDKs → The harness · r5c2 Your first server → Servers & tools · r5c6 Auth → Auth & trust · r6c6 Tracing → Evals in CI · r7c1 Orchestrators → Agent graphs · r8c4 Security → Secrets & data · r8c5 Scaling → Latency & scaling. Why: each old title named one vendor's feature or a coding task.
- **Coverage homes:** multimedia r0c4 (+ strategist r1c5 "Images & voice", replacing "Prompt templates", which r1c6 already covers) · prompt injection r2c6 · harness engineering r4 c1–c3 (loop, stop conditions, the harness) · graphs r7c1 · secrets r8c4 · latency/scalability r8c5 · streaming folds into r0c5 and r8c5. Closes the "decided in the outline PR" line of the no-code amendment.
- **All nine builder `boss.task` lines are scenario-shaped** ("Design / Plan / Configure X for Y"), graded by a case.
- **Per-chapter topic lines stay in this spec, not in `outline.json`.** The chapter schema stays `{ id, title }`.
- **Titles are safe to rename; ids are not.** Exercise ids are positional ("Ids are forever"); the r2 c2/c3 title swap is fine only because r2 has no content yet.
- **Maintainer to-do:** re-export `design/` with the new titles and drop "pass it by writing code" from the landing copy. Add `openai.com/index`, the Codex docs base and a Gemini docs base to `content/sources.yaml` before r4 content.
- **Lesson guards (content-reviewer):** r0c4 must say audio input differs by vendor and cite only vendors whose docs support it. r7c1 "graphs" cites OpenAI Agent Builder (nodes, edges) and Anthropic orchestrator-workers; a graph framework repo may be a secondary source. Titles stay ≤ 16 chars so they fit a map pin (voice-guardian).

## Amendments locked 2026-10-05 (dashboard + realm pages, SIG-14)

- **`/dashboard`** (signed in; the proxy redirects signed-out visitors) shows the next open step, up to `DASHBOARD_REALM_LIMIT` (3) active realms, and a stats panel (day streak, levels cleared). Onboarding now lands here (`AFTER_ONBOARDING_HREF`).
- **"Next step"** prefers realms in progress, then open realms, in map order. Lesson → case → quick check inside a chapter.
- **`/realms` and `/realms/[realm]` are public.** `?track=builder|strategist` shows either track; the default is the player's track, or strategist for visitors. Unknown slugs return a real 404.
- **Step states** come from the same `decideOpen` the Server Actions use. A step with no content file is "Coming soon" and is not a link. Advanced realms are visible but locked, with no unlock goal yet (paywall later).
- **After a pass**, and on the quest back link, the player returns to the realm page, not the profile.
- Not built yet: daily quest, Math Tower panel, tier filter, "View on map", "Built from" sources.
- Lesson rendering and the Lesson done button: see quest-actions-design-plan.md → SIG-11 block. §SEO sitemap: later ticket.

## Amendments locked 2026-10-05 (no-code pivot, vendor-neutral)

- **Nobody writes code.** Builder ("tech") teaches how to design and run AI systems; strategist ("business") teaches how to use and leverage AI and harnesses at work. Both end every chapter and boss in a graded scenario case. Replaces: §Context row 1 ("code challenge, tests"), §Audiences "Needs code? Yes, basic" (now No for all), §Code execution (now N/A), §Content files "challenge" wording, §MVP cut "(lesson + challenge/case + quick check)" → "(lesson + case + quick check)", the realm-02 `get_weather` tool-challenge demo (dropped). Also supersedes the Phase 1 lines "Challenges are graded offline…" and "Realm 02 keeps the get_weather tool challenge".
- **A case has 3–5 questions; each case question has exactly 4 options, one correct (exam style). Quick checks keep 2–6 options.**
- **The architect-style guide's domains map onto existing realms:** agentic architecture → r4, r7; harness / coding-agent configuration (instruction files, hooks, permissions, subagents) → r4; prompts & structured output → r1; tool design & MCP → r2, r5; context management & reliability → r3, r6, r8. Security, scalability, multimedia and harness engineering (loops, graphs) get their places in the outline PR.
- **Track ids stay `builder` / `strategist`.** Copy may say "tech" / "business" (voice-guardian pass, not a rename).
- **Vendor-neutral.** No chapter title or `boss.task` names one vendor's feature; a concept that exists at more than one vendor cites at least two vendors; vendor docs remain valid sources. The Claude architect-style certification is a depth/style reference only.
- **Docs first.** Lessons are built from the official Anthropic and OpenAI docs first, then other official sources.
- **Source rule.** Each lesson's `sources` lists at least 1 Anthropic page and at least 1 OpenAI page where both document the concept (REQUIRED); Google and MCP spec pages are optional ("when they add something"). Every url must sit under a `trustTier: official` entry of `content/sources.yaml`. Community repos and community blogs (e.g. learn-harness-engineering) are examples only. Official vendor engineering posts (e.g. `anthropic.com/engineering`, `openai.com/index/harness-engineering`) count as official pages; they are the primary source for harness engineering. A claim with no official page is a blocker.
- **Full coverage.** The map must cover RAG, embeddings/vectors, math (Math Tower), security, scalability, multimedia and harness engineering (loops, graphs). Where each lives is decided in the outline PR (PR 4), with the maintainer.
- **Builder chapter titles and `boss.task` lines are rewritten in PR 4** (voice-guardian + maintainer approve). Known vendor-specific titles: realm 1 "XML tags", "Prefill"; realm 2 "Tool search"; realm 0 topic "your first API call". All nine `boss.task` lines are code-shaped today.
- **Builder realm 0 is no longer "first API call".** Topic: "How a model reads and answers: tokens, messages, system prompts, limits, cost."
- **§Candidate sources per realm** adds Gemini API docs, Hugging Face / open-model docs and one framework doc as candidates ("to verify").

## Amendments locked 2026-10-05 (Phase 1 build)

The Phase 1 build and its CTO review changed these parts. The maintainer approved them.

- **Outline and frontmatter schemas live in `lib/types/`,** per AGENTS.md ("every shared type and Zod schema"). `lib/content/schema.ts` is dropped. Amended in the same branch: `content/CLAUDE.md`.
- **The accent helper returns the `data-accent` value** (`realmAccent(3)` → `realm-3`). `accents.css` maps it to `--realm-3`. Why: components already pick a tint with `data-accent`.
- **`CHAPTERS_PER_REALM` is the existing `CHAPTER_COUNT`.** No second constant.
  > **Amended 2026-10-07:** `CHAPTER_COUNT` is replaced by `MIN_CHAPTERS = 6` and `MAX_CHAPTERS = 12`; a realm's real count comes from its track's outline. See `path-curriculum-design-plan.md` → "Amendments locked 2026-10-07 (devil pass, maintainer "go with your lean")".
- **A Math outline floor is `{ n, covers, formulas: [{ math, text }] }`.** No `title` (the name is in `MATH_FLOORS`) and no single `formulaText`. Why: floor 1 has two formulas, and each needs its own plain-words line.
- **The Math Tower has a constant row** (`MATH_TOWER`: name, NPC) and one art path (`MATH_ART` = `/levels/math`).

## Amendments locked 2026-10-05 (devil pass on the Frontier)

The `devil` reviewed PR #7. The team approved its full list (the maintainer delegated product calls). Each line replaces the matching part of the "frontier" block below. Sync-side detail: `knowledge-base-design-plan.md` → same-named block.

- **The Frontier has no tier. All its chapters are open.** This replaces the per-chapter tier. So the body line "tier is a realm property, never a chapter property" stays true.
- **`FRONTIER = { slug: 'frontier', name: 'The Frontier' }`.** No `defaultTier`. The accent reuses the `neutral` token (no new colour).
- **No NPC and no DialogBox** in Frontier lessons. Plain product voice only.
- **No outline file.** A chapter is a folder, `content/frontier/<YYYY-MM-DD>-<slug>/` (lesson MDX + `quick-check.json`, no challenge). Title and sources come from frontmatter.
- **The Frontier page is a newest-first list**, not a side-scrolling level. No `/map/frontier`, no level art. It is a nav item + a dashboard shortcut, like the Math Tower, and ships in **step 6** with `/math`.
- **Frontier progress is written under the active track.**
- **db-architect is needed at step 3** (`level_announcements` must point at a Frontier chapter). This replaces "not needed" in §Content files.

## Amendments locked 2026-10-05 (frontier)

Maintainer decision. Full detail in `knowledge-base-design-plan.md` → "Amendments locked 2026-10-05 (frontier + blog)".

- **New side realm: The Frontier** (working name; `voice-guardian` checks it). The sync job adds its chapters by PR. It is the only part of the map that grows. Why: the 9 × 6 main map is fixed, so new topics from the docs had no home.
- **One exception to "tier is a realm property":** a Frontier chapter carries its own tier in `content/frontier/outline.json`. Default open; `advanced` only when triage marks it. Why: the Frontier mixes topics of every level.
- **`fill-stub`** lets the sync job draft a "Coming soon" chapter of a main realm. It never adds a main-realm chapter; the 9 × 6 count stays.
  > **Amended 2026-10-07:** the 9 × 6 count no longer stays: a realm can have 6 to 12 chapters (outline). `fill-stub` still never adds a chapter. See `path-curriculum-design-plan.md` → "Amendments locked 2026-10-07 (devil pass, maintainer "go with your lean")".
- **Blog:** owned by the KB spec now (no separate blog job). This spec still only depends on it.

## Amendments locked 2026-10-05 (devil pass)

The `devil` reviewed the first draft. The team approved its full list (the maintainer delegated product calls). Each line replaces the matching part of the first draft or of `design/`.

- **All open-tier realms are open from day one.** Chapters inside a realm open in order. This overrides the design's realm-by-realm lock. Why: the product is free, and a builder should reach agents without clearing "Tokens" first.
- **Outlines are 3 JSON files**, not 19 YAML files: `content/builder/outline.json`, `content/strategist/outline.json`, `content/math/outline.json`. Why: no YAML parser to add, one Zod schema, one file to read per track.
- **Realm id is a number, 0–8.** One helper builds the content folder (`0N-<slug>`), the art path (`public/levels/realm-0N`) and the accent token (`--realm-N`). There is no `art` field. Why: three strings from one number can't drift.
- **Boss name is the design's "Boss · <Realm>".** The first draft's one-liners become an optional `boss.task` in the outline.
- **Math floors have no tier.** They open in order. Floor 1 keeps both formulas: dot product and cosine (a·b ⁄ ‖a‖‖b‖).
- **Stub chapters have no route.** A realm page is indexed only when at least one of its chapters is live. Why: no thin pages, no dead links.
- **`xp` leaves lesson frontmatter.** XP amounts live only in `lib/constants`. Amended in the same branch: `content/CLAUDE.md` (no `xp`) and `.claude/rules/scoped/grading.md` (amounts in `lib/constants`, not `lib/xp/`).
- **Quick check = the `case.json` shape, 3 questions,** with its own XP reason.
- **Challenges are graded offline.** No live model call runs inside the sandbox. Why: cost, speed and repeatable grades.
- **`TIER_LOCKED` is defined in the step-5 actions spec,** not here. This spec only says when it must fire.
- **Auth is Clerk now** (`users.id` = the Clerk user id). Lesson and realm routes are public routes in Clerk's middleware. Signing in is needed only to submit and earn XP.
- **Sprint scope = the 3 outlines + P0** (realm 00, both tracks). P1–P3 come after the sprint. NIST, OWASP and mml-book are out of the MVP source list.
- **Phase 1 adds `lib/constants/curriculum.ts` to the existing `lib/constants` barrel** (it exists on `feat/ui-primitives`). Phase 1 is data only.
- **Maintainer to-do:** re-export the design in Claude Design with the new Math floors and the open-realm rule.

## Amendments locked 2026-10-05

Maintainer direction (dictated 2026-10-05), layered on the founding brief and `design/`. Each line says what changed and why.

- **Sigmorai is free and open, end to end.** It covers LLM basics, prompting, tokens, embeddings, RAG, tool use, agents, harness engineering, evals and production. Beginner and intermediate tiers are free now.
- **Advanced tier: visible but locked.** Realms 06, 07 and 08 (both tracks) are `advanced`. Learners see their pages and chapter lists, but cannot open lessons or earn XP there. A paywall comes later; this spec designs **only the lock**, no payment. New: the brief had no lock.
- **Tier names come from the design, not from the dictation.** The maintainer said "easy / mid / advanced". `design/` already uses BEGINNER / INTERMEDIATE / ADVANCED (realms catalog filter, realms 00–02 / 03–05 / 06–08). Same meaning, so we keep the design labels. One set of names, not two.
- **Three audiences, still two tracks.** No third track. A total beginner (for example a translation graduate who wants AI for daily work) starts on **strategist realm 00**. Why: strategist 00–01 is already "AI literacy" + "prompting for everyday work", with no code. A shared "start from zero" realm 00 was considered and dropped: the design already has two different realm-00 chapter lists, and builders would sit through non-code lessons.
- **First content is realm 00, not realm 02.** The brief's seed said "realm 02 fully authored". Now realm 00 on both tracks is written first, because every learner starts there. Realm 02 stays a later priority (it keeps the design's `get_weather` tool challenge as a demo).
- **Math Tower floors change (amends the design's mock data).** The maintainer asked for statistics, which the design's 8 floors miss. "Cosine similarity" (design floor 8) moves into floor 1, which frees a slot for **Statistics**. Floors are reordered easy → mid. The design export needs the same edit in Claude Design (code never edits `design/`).
- **Realm and lesson pages are public and indexable** (SEO + accessibility). Reading a lesson needs no account. Signing in is needed only to submit, grade and earn XP.
- **Content folder slug for realm 02 is `02-tool-forge`**, not the design's `02-tool-forge-caverns`. The realm name is "Tool Forge" everywhere else (art, brief, design labels).
- **A blog is wanted.** A scheduled job pulls sources, clusters them and drafts posts as a PR (never auto-published). It belongs in `knowledge-base-design-plan.md`, not here. This spec only depends on it.

---

## Context

Already locked, and kept:

| Fact                                                                              | Where                                                                          |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Two tracks: `builder` (code challenge, tests) and `strategist` (graded case)      | `docs/build-prompt.md` → Product model                                         |
| 9 realms per track (00–08) + Math Tower (8 floors), 6 chapters + 1 boss per realm | `docs/build-prompt.md`, `design/README.md`                                     |
| A chapter = lesson + challenge (or case) + quick check                            | `docs/build-prompt.md`                                                         |
| Realm names, NPC guides, per-track chapter titles, Math floors, tier labels       | `design/ui_kits/webapp/Sigmorai App.dc.html` (`REALMS`, `BIZ`, `FLOORS`, `LV`) |
| Content is files: `content/<track>/<realm>/<chapter>/*.mdx`, Zod frontmatter      | `content/CLAUDE.md`                                                            |
| Every lesson cites sources; content is never auto-published                       | `.claude/context/project.md`                                                   |
| Source registry, sync job, mentor grounding                                       | `docs/plans/knowledge-base-design-plan.md`                                     |
| Level art per realm: `public/levels/realm-00` … `realm-08`, `public/levels/math`  | `docs/plans/level-art-design-plan.md`                                          |

On `canary`, `content/` holds only `CLAUDE.md`. `lib/constants` (barrel) exists on `feat/ui-primitives`. `content/sources.yaml` does not exist yet.

## Purpose

People want one free, game-style place to learn AI from zero to production. Today the plan has realms and chapter titles, but no rule for who starts where, what is open, or what gets written first. This spec fixes that, so content authors and the seed script build the same map.

## Audiences → tracks

| Audience                                  | Track        | Starts at                         | Needs code? |
| ----------------------------------------- | ------------ | --------------------------------- | ----------- |
| Total beginner (uses AI in daily work)    | `strategist` | Strategist realm 00, chapter 1    | No          |
| Business people (workflows, decisions)    | `strategist` | Strategist realm 00 (or any open) | No          |
| Tech people (builders, the main audience) | `builder`    | Builder realm 00 (or any open)    | Yes, basic  |

A beginner can switch to builder later from the HUD toggle. Progress is per track (already locked), so nothing is lost.

## Constants (`lib/constants/curriculum.ts`, exported from the barrel)

No realm id, tier or track name is typed as a loose string anywhere else. Pages, loaders, seed and actions import these.

| Constant             | Value                                                                                                           |
| -------------------- | --------------------------------------------------------------------------------------------------------------- |
| `TRACKS`             | `['builder', 'strategist']`                                                                                     |
| `TIERS`              | `['beginner', 'intermediate', 'advanced']` (UI labels BEGINNER / INTERMEDIATE / ADVANCED)                       |
| `OPEN_TIERS`         | `['beginner', 'intermediate']`                                                                                  |
| `REALMS`             | 9 rows: `{ id, slug, name, npc, tier }` (table below). Shared by both tracks.                                   |
| `MATH_FLOORS`        | 8 rows: `{ n, slug, name }` (table below). No tier.                                                             |
| `CHAPTERS_PER_REALM` | `6` (matches the 6 flags in `design/assets/levels/layout.json`; node 7 is the boss)                             |
| `FRONTIER`           | `{ slug: 'frontier', name: 'The Frontier' }`. Working name. No tier, no chapter count; accent reuses `neutral`. |

> **Amended 2026-10-07 (path curriculum, PR 1b):** each `REALMS` row also has `track` (`null` = a core realm, on every path; a track = a specialist realm, on that path only) and `scene` (has level art). The 9 rows above are the core realms. A path's realm list is its outline: the core realms in order plus its own specialist realms (r9 and up, numbers global). There is no `REALM_COUNT` any more. See `path-curriculum-design-plan.md` → "Amendments locked 2026-10-07 (devil pass, maintainer "go with your lean")".

> **Amended 2026-10-07:** `CHAPTERS_PER_REALM` (`CHAPTER_COUNT`) is replaced by `MIN_CHAPTERS = 6` / `MAX_CHAPTERS = 12`. A 6-chapter realm keeps the design's node columns; other counts are spread evenly. See `path-curriculum-design-plan.md` → "Amendments locked 2026-10-07 (devil pass, maintainer "go with your lean")".

`id` is a number, `0`–`8`. One helper turns it into the content folder (`00-bootstrap-village`), the art path (`public/levels/realm-00`) and the accent token (`--realm-0`). Nothing else builds these strings.

## Realm map

Realm names, NPCs and chapter titles are copied from `design/`. Each boss is named "Boss · <Realm>" (design). The `boss.task` column is an optional one-line task; it goes past `voice-guardian`.

| id  | Realm (slug)                              | NPC               | Tier            | Topic (builder / strategist)                                        | Builder chapters (6)                                                                         | Strategist chapters (6)                                                                                   | `boss.task` (builder / strategist)                                                              |
| --- | ----------------------------------------- | ----------------- | --------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| 0   | Bootstrap Village (`bootstrap-village`)   | Elder Maren       | beginner        | LLM basics, first API call / AI literacy: limits, cost, risk        | Tokens · Messages · System prompt · Streaming · Models & limits · Costs                      | What an LLM is · Strengths & limits · Hallucinations · Tokens = cost · Choosing a model · Data & privacy  | A chat script that streams and reports its token cost / Pick a model and a first use for a team |
| 1   | Prompt Forest (`prompt-forest`)           | Ranger Iso        | beginner        | Prompt engineering, structured output / Prompting for everyday work | Be specific · Examples · XML tags · Chain of thought · JSON output · Prefill                 | Write a brief · Give examples · Ask for structure · Review outputs · Prompt templates · Team playbooks    | A prompt that returns valid JSON every time / A team prompt playbook                            |
| 2   | Tool Forge (`tool-forge`)                 | Smith Korren      | beginner        | Tool use, function calling / Use-case discovery                     | Messages recap · Tool results · Define a tool · The tool loop · Parallel calls · Tool search | Map the workflow · Spot repetition · Score a use case · Build vs buy · The business case · Pilot scope    | A two-tool assistant that finishes the loop / Choose and scope a pilot                          |
| 3   | Context Library (`context-library`)       | Archivist Vela    | intermediate    | Embeddings, RAG, caching, context engineering / Knowledge & data    | Embeddings · Chunking · Retrieval · Prompt caching · Long context · Compaction               | Why context matters · Knowledge bases · Data readiness · Access & permissions · Freshness · Citations     | A RAG answerer that cites its chunks / A data-readiness plan                                    |
| 4   | Agent Citadel (`agent-citadel`)           | Warden Tess       | intermediate    | Agent loops and **harness engineering** / Agents at work            | The loop · Stop conditions · Agent SDKs · Subagents · Memory · Permissions                   | What agents do · Autonomy levels · Human in the loop · No-code agents · Agent permissions · Failure modes | A small agent harness with a stop rule and permissions / Set an agent's autonomy level          |
| 5   | MCP Bridgelands (`mcp-bridgelands`)       | Bridgekeeper Nal  | intermediate    | MCP servers and clients / Integrations                              | MCP basics · Your first server · Resources · Prompts · Remote servers · Auth                 | Integration basics · MCP in plain words · Vendor landscape · Security review · Total cost · Lock-in       | An MCP server with one tool and one resource / An integration decision                          |
| 6   | Eval Arena (`eval-arena`)                 | Judge Arra        | **advanced**    | Evals, graders, guardrails / Measuring value                        | Test sets · Model graders · Regression · Guardrails · Red-teaming · Tracing                  | Define success · Quality evals · KPIs that matter · ROI models · A/B pilots · Reporting up                | An eval suite that catches a regression / A pilot scorecard                                     |
| 7   | Swarm Spire (`swarm-spire`)               | The Conductor     | **advanced**    | Multi-agent orchestration / Org design and change                   | Orchestrators · Handoffs · Shared state · Parallel agents · Conflict · Cost control          | Team structures · Redesign workflows · Roles & skills · Change management · Adoption · Incentives         | An orchestrator with two workers and a budget / A workflow redesign                             |
| 8   | Production Peaks (`production-peaks`)     | Summit Guide Pell | **advanced**    | Deploy, observe, secure, scale / Governance and rollout             | Rate limits · Batching · Observability · Security · Scaling · Launch                         | AI policy · Risk tiers · Compliance · Incident response · Rollout plan · The AI roadmap                   | A service that survives rate limits and logs traces / A rollout plan                            |
| —   | The Frontier (`frontier`), **side realm** | none              | none (all open) | New tools and changes found by the sync job / same                  | Made by the sync job, newest first, no fixed count                                           | Same chapters (lesson + quick check)                                                                      | No boss                                                                                         |

**Frontier rules:**

- A chapter = one lesson + one quick check (3 questions, `case.json` shape) + its cited sources. No challenge. Folder: `content/frontier/<YYYY-MM-DD>-<slug>/`.
- Shared by both tracks; progress goes under the active track. A newest-first list page (nav item + dashboard shortcut, like the Math Tower), no map. Chapters don't lock each other.
- Only a merged sync PR adds a chapter. No NPC, no DialogBox.

**Where each topic lives** (the maintainer's list → realm): LLM basics, tokens → 0 · prompting → 1 · tool use → 2 · embeddings, vectors, RAG → 3 (+ Math floor 1) · agents, harness engineering → 4 · MCP → 5 · evals → 6 · multi-agent → 7 · production → 8.

**Advanced = exactly realms 6, 7, 8: all 6 chapters + boss, both tracks.** No single chapter inside realms 0–5 is advanced. Tier is a realm property, never a chapter property.

## Math Tower floors

NPC: Numerist Oru. One tower, shared by both tracks. No tier: all floors are easy to mid and free. Floors open in order.

| n   | Floor (slug)                        | Covers                                                   | Formula                           |
| --- | ----------------------------------- | -------------------------------------------------------- | --------------------------------- |
| 1   | Vectors & similarity (`vectors`)    | vectors, dot product, cosine similarity (merged floor 8) | a·b = Σ aᵢbᵢ **and** a·b ⁄ ‖a‖‖b‖ |
| 2   | Probability (`probability`)         | events, distributions, next-token prediction             | P(xₜ \| x₍<ₜ₎)                    |
| 3   | Statistics (`statistics`) — **new** | mean, variance, sampling, "is this eval result real?"    | x̄ = Σ xᵢ ⁄ n                      |
| 4   | Matrices (`matrices`)               | matrix multiply, a layer as y = Wx + b                   | y = Wx + b                        |
| 5   | Softmax & temperature (`softmax`)   | logits to probabilities, what temperature changes        | eᶻⁱ/T ⁄ Σ eᶻʲ/T                   |
| 6   | Gradients (`gradients`)             | slope, derivative, gradient descent                      | θ ← θ − η∇L                       |
| 7   | Cross-entropy (`cross-entropy`)     | loss, why LLMs train on it                               | −Σ y log ŷ                        |
| 8   | Attention (`attention`)             | queries, keys, values; the math of a transformer layer   | softmax(QKᵀ/√d)V                  |

Every formula needs a plain-words text version next to it (screen readers read "Σ aᵢbᵢ" badly).

## Beginner path (zero knowledge)

1. A visitor lands on a public lesson or the landing page. They can **read** strategist realm 0, chapter 1 ("What an LLM is") with no account.
2. At sign-up or first onboarding, the track picker (already in the design) shows one helper line under Strategist: _new to AI, or don't write code? Start here._ (Copy goes past `voice-guardian`.)
3. Dashboard "Continue learning" points to **strategist 0 → chapter 1**.
4. They clear strategist 0 (what AI is, limits, hallucinations, cost, privacy), then 1 (writing briefs, checking outputs). That is enough for daily work.
5. After realm 1 they can go on to realms 2–5, or switch to builder from the HUD.

All open-tier realms are open from day one. Inside a realm, chapters open one by one (a `progress` row for the previous chapter's challenge). So a builder can start at realm 4.

_Note 2026-10-05: `progress` has no `status` column (it is one row per cleared exercise). The open rule is set in `quest-actions-design-plan.md`._

## Lock rules (advanced tier)

| Rule                      | Detail                                                                                                                                                                                           |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Where tier lives          | `REALMS[].tier` in `lib/constants`. **Not** in lesson frontmatter: one realm-level value can't drift across 12 lesson files (6 per track).                                                       |
| What "open" means         | `tier ∈ OPEN_TIERS`. One pure helper in `lib/` decides it; `bun test` covers it.                                                                                                                 |
| What a locked realm shows | Realm page: name, NPC, topic, 6 chapter titles, boss name, "Built from" sources, an **ADVANCED · LOCKED** badge (text + icon, not colour only).                                                  |
| What it never sends       | Lesson body, challenge starter, case questions, quick check. The content loader returns an outline only for locked realms.                                                                       |
| Server checks             | Every read in `lib/data`, every action in `lib/actions` and `/api/run` re-checks the tier. Locked → the locked error (`TIER_LOCKED`, defined in the step-5 actions spec), no runner call, no XP. |
| Two kinds of "locked"     | Chapter lock = "clear the previous chapter". Tier lock = "advanced, coming later". UI copy must make the two different.                                                                          |
| Later paywall             | Swaps the helper's input for a per-user entitlement. Needs a schema change then (db-architect). Not now.                                                                                         |
| Honest note               | If the GitHub repo is public, advanced MDX is readable there. The lock is a product gate, not a secret. Hidden tests stay server-only either way.                                                |

## Content files this adds

| File                                                              | Fields (one Zod schema per kind, in `lib/content/schema.ts`)                                       | Why                                                                           |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `content/builder/outline.json`, `content/strategist/outline.json` | `realms[9]{ id (0–8, must match `REALMS`), topic, lore, chapters[6]{ id, title }, boss{ task? } }` | Chapter titles and lore differ per track; they exist before lessons do.       |
| `content/math/outline.json`                                       | `floors[8]{ n, title, covers, formulas[], formulaText }`                                           | Same, for the tower.                                                          |
| `content/<track>/<realm>/<chapter>/quick-check.json`              | Same shape as `case.json`: exactly 3 questions, one correct index each, an explanation per option  | Quick check needs a graded format; reusing the case shape adds no new schema. |

- **Lesson frontmatter loses `xp`** and gains nothing. XP amounts live only in `lib/constants`. Track, realm and chapter come from the path; tier comes from the realm.
- **Quick check has its own XP reason** in `xp_events` (amount in `lib/constants`, set by the step-5 spec).
- **Chapter status is derived:** a chapter folder with a lesson MDX is live. No folder = "Coming soon", with no route.
- A `bun test` reads the outlines from disk and parses them with Zod. It fails if a track has ≠ 9 realms, a realm has ≠ 6 chapters, an id is unknown, or a chapter folder is not in its outline.
  > **Amended 2026-10-07 (path curriculum, PR 1b):** "≠ 9 realms" is now: every core realm exactly once and in order, plus only that track's own specialist realms, no realm twice. See `path-curriculum-design-plan.md` → "Amendments locked 2026-10-07 (devil pass, maintainer "go with your lean")".
  > **Amended 2026-10-07:** a realm may have 6 to 12 chapters; fewer than 6 or more than 12 fails. See `path-curriculum-design-plan.md` → "Amendments locked 2026-10-07 (devil pass, maintainer "go with your lean")".
- **`devil` review: done (this pass). `db-architect`: needed at step 3** — `level_announcements` must point at a Frontier chapter (devil pass on the Frontier). It is needed again when the paywall adds entitlements.

## MVP content cut (48h sprint)

| Priority     | What gets real lessons                                                                                                    | Count                                                                                                      |
| ------------ | ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Sprint       | The 3 outline files                                                                                                       | 3 files                                                                                                    |
| Sprint (P0)  | Realm 0, **both tracks**: 6 chapters each (lesson + challenge/case + quick check)                                         | 12 chapters                                                                                                |
| After sprint | P1 realm 1 · P2 realm 2 (builder keeps the design's `get_weather` challenge) + Math floor 1 · P3 realm 3, all both tracks | 36 chapters + 1 floor                                                                                      |
| Stub         | Everything else: in the outline only, shows "Coming soon", no route                                                       | Realms 4–8, bosses, floors 2–8 (bosses superseded 2026-10-06, see "Amendments locked 2026-10-06 (bosses)") |

Bosses ship after their realm's 6 chapters. The outlines ship in the sprint, so the full map and catalog exist from day one. Each priority is one content PR, checked by `content-reviewer` and `voice-guardian`.

## Candidate sources per realm (all **to verify**)

Not checked yet. Each URL must be opened and confirmed in `content/sources.yaml` review before a lesson cites it. No API shape is stated here on purpose.

| Realm | Official docs (to verify)                                                                                                                                | Repos / other (to verify)                                                                                              |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| 0     | docs.claude.com (intro, models overview, pricing, Messages API, streaming, reduce hallucinations); platform.openai.com/docs (text generation, tokenizer) | anthropics/claude-cookbooks                                                                                            |
| 1     | docs.claude.com prompt-engineering overview; platform.openai.com/docs prompt engineering, structured outputs                                             | anthropics/prompt-eng-interactive-tutorial                                                                             |
| 2     | docs.claude.com tool-use overview; platform.openai.com/docs function calling                                                                             | anthropics/claude-cookbooks (tool use)                                                                                 |
| 3     | docs.claude.com embeddings, prompt caching, context windows; docs.voyageai.com; anthropic.com/engineering (contextual retrieval, context engineering)    | —                                                                                                                      |
| 4     | docs.claude.com Agent SDK; openai.github.io/openai-agents-python; anthropic.com/engineering (building effective agents)                                  | **walkinglabs/learn-harness-engineering**, anthropics/claude-code, openai/openai-agents-python, huggingface/smolagents |
| 5     | modelcontextprotocol.io (spec + docs); docs.claude.com MCP                                                                                               | modelcontextprotocol/servers, modelcontextprotocol/typescript-sdk                                                      |
| 6     | docs.claude.com (define success, develop tests); platform.openai.com/docs evals                                                                          | openai/evals, promptfoo/promptfoo                                                                                      |
| 7     | anthropic.com/engineering (multi-agent research system); OpenAI Agents SDK handoffs                                                                      | langchain-ai/langgraph, openai/openai-agents-python                                                                    |
| 8     | docs.claude.com rate limits, batch processing; OpenTelemetry GenAI semantic conventions                                                                  | vercel/ai                                                                                                              |
| Math  | d2l.ai                                                                                                                                                   | karpathy/nn-zero-to-hero, d2l-ai/d2l-en                                                                                |

**Out of the MVP source list:** NIST AI RMF, OWASP Top 10 for LLM apps, mml-book. They are not vendor docs; revisit with realm 8 and the later Math floors.

## SEO and accessibility

- Realm and lesson routes are **public routes in Clerk's middleware**. They render on the server with no sign-in. Each has a unique title and description from the outline, and a canonical URL.
- A realm page is indexed only when at least one of its chapters is live. Stub chapters have no route, so no thin pages. The sitemap lists only live lessons and indexed realm pages.
- Advanced realm pages are `noindex` until they have a live chapter (same rule).
- Lessons use real headings, alt text for diagrams, and a text version for every formula. All rules in `DESIGN.md` still apply (Atkinson for reading text, 44px targets, 360px reflow).

## Fairness and integrity check

- Tier is checked on the server for every read, action and run. The browser never decides "open".
- Locked realms send no lesson, case or test data, so no XP can be earned there. The leaderboard stays comparable.
- Quick-check correct indexes stay server-only, like `case.json`.
- Nothing here changes grading rules or XP amounts.

## Data model

N/A. No schema change. Auth is Clerk (`users.id` = Clerk user id); this spec only reads that id.

## API contract

No new action. Existing actions and `/api/run` gain one tier check. The error code (`TIER_LOCKED`) is defined in the step-5 actions spec.

## AI and cost

N/A here. The blog and docs-sync drafting are in `knowledge-base-design-plan.md`. Locked realms cost nothing (no runner, no mentor).

## Code execution

Builder challenges in open realms use the existing runner. **Grading is offline:** no live model call runs inside the sandbox. A challenge that "calls a model" (for example the realm-0 streaming boss) is graded against recorded responses or a stub client, so a grade is cheap, fast and the same every time.

## States and transitions

| State                         | Shows                                                                         |
| ----------------------------- | ----------------------------------------------------------------------------- |
| Chapter live, open            | Enter                                                                         |
| Chapter live, locked by order | "Clear chapter N first"                                                       |
| Chapter stub                  | "Coming soon", no Enter button, no link                                       |
| Realm advanced                | ADVANCED · LOCKED badge on catalog + realm page; Enter disabled with a reason |
| Math floor, locked by order   | "Clear floor N first"                                                         |
| Signed out                    | Lessons readable; submit/check buttons ask to sign in                         |

## Phases

### Phase 1 — Curriculum data

**Goal:** data only. The full map exists as constants + outlines, and a test proves they agree.

**Files**

- `lib/constants/curriculum.ts` _(new, exported from the existing `lib/constants` barrel)_ — `TRACKS`, `TIERS`, `OPEN_TIERS`, `REALMS`, `MATH_FLOORS`, `CHAPTERS_PER_REALM`, the id → folder/art/accent helper, the tier helper
- `lib/content/schema.ts` _(new)_ — outline schemas
- `content/builder/outline.json`, `content/strategist/outline.json`, `content/math/outline.json` _(new)_
- A `bun test` file next to the schema _(new)_ — reads the outlines from disk, parses with Zod

**Verification:** `bun test`; `bun run typecheck`; `bun run build`.

**Approval gate:** maintainer approves the outlines (`voice-guardian` on lore + `boss.task`).

### Phase 2 — P0 content (realm 0, both tracks)

**Goal:** 12 real chapters with sources, challenges/cases and quick checks.

**Verification:** `content-reviewer` + `voice-guardian`; frontmatter passes Zod.

**Approval gate:** maintainer reads two lessons end to end.

### After the sprint — P1–P3 content and Math floor 1

Same flow, one PR per priority.

The lock itself is enforced when `lib/data`, `lib/actions` and `/api/run` are built (step 3 and step 5); their specs must point here.

---

## Acceptance criteria

- [ ] No realm id, tier or track string literal in `app/**` or `lib/**`, except `lib/constants/**` and `*.test.ts` (grep).
- [ ] The 3 outlines parse in `bun test`; a broken one fails the test.
- [ ] Realms 6–8 show ADVANCED · LOCKED; their lessons, cases and tests never reach the browser (test on the loader's output).
- [ ] An action or `/api/run` call for a locked realm returns the locked error and writes no `xp_events` row.
- [ ] A signed-out visitor can read strategist 0 chapter 1.
- [ ] Stub chapters show "Coming soon" and have no route (404).
- [ ] A realm page with no live chapter is `noindex`.
- [ ] Locked and stub states use text or an icon, not colour alone.

## Out of scope

- Payment, pricing, entitlements (only the lock).
- The blog and the sync job (`knowledge-base-design-plan.md`).
- Lesson writing beyond P0; boss format (superseded 2026-10-06: see "Amendments locked 2026-10-06 (bosses)"); exact public URL shapes (route specs).
- The `TIER_LOCKED` code and the quick-check XP amount (step-5 actions spec).

## Maintainer to-dos

- Re-export the design in Claude Design with the new Math floors (Statistics added, cosine in floor 1) and the open-realm rule.
- In the same re-export, add a Frontier nav item (newest-first list page) and a blog page.

## Open questions — Calls I'm under 95% on

1. **Beginner on strategist, no shared realm 0.** Lean: strategist 0. Why: it is already no-code AI literacy, and it keeps two clean tracks. Other option: a shared realm 0 for both tracks; downside: breaks the design's two chapter lists and slows builders.
2. **Advanced = realms 6–8 (evals, multi-agent, production).** Lean: follow the design's labels. Other option: keep evals (6) free because "evals" is in the maintainer's core list; downside: moves the line the design drew and leaves only 2 locked realms.

Settled by the devil pass: tier on the realm, Math floors, open realms, stub indexing, boss names, frontmatter `xp`.

## Companion plans

- `docs/plans/knowledge-base-design-plan.md` — sources, sync job, mentor grounding, and (to add) the blog job.
- `docs/plans/level-art-design-plan.md` — `public/levels/realm-0N` art per realm.
