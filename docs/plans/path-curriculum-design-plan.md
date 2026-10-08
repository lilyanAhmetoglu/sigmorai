# Sigmorai — Path curriculum (realms per path)

> Each path gets its own realm list. All paths keep the same 9 core realms. A path can also have its own specialist realms, and a realm can have more than 6 chapters. First user: Creator, with 5 new realms for designers. Read end-to-end before any code; each phase is gated by explicit approval.

## Status

**STATUS: Draft for review (2026-10-07). Build step: cross-cutting. Track: all (creator first, then builder and strategist).**

**SCHEMA:** no schema change. Exercise ids are `text` in `progress`, `submissions` and `xp_events`. Not `SCHEMA REVIEW REQUIRED` (see Data model).

## Amendments

## Amendments locked 2026-10-08 (PR 8 devil pass)

- **r13 Pattern Atelier ships with 6 chapters, not 7.** r9 c1 (variables vs screenshot), r9 c6 (Code Connect, variables REST), r3 c1 (version the kit) and r4 c3 (review loops) already exist; r13 does not repeat them and links back instead. Chapters: c1 Tokens as truth (the DTCG token file: `$value`, `$type`, aliases; one file for Figma, code and the agent) · c2 Modes & themes (variable modes, light/dark, brand A/B, how an agent picks a mode) · c3 Rules files (design do/don't an agent reads every time: Figma MCP custom rules, CLAUDE.md, AGENTS.md) · c4 Reuse first (manifests and registries the agent reads before it invents: Storybook MCP, shadcn MCP/registry, Figma Code Connect integration) · c5 Contrast checks (a model reads token pairs; you verify with the WCAG 1.4.3 number, never the model's word) · c6 Publish & sync (who owns a token change, publishing modes from one file, what the agent must not edit). "Brand models" is dropped (r11 owns it). If c6 is thinner than one lesson after the cuts, fold it into c2 and ship 5 + boss.
- **r13 sits on slot s4, after r3 in the creator outline:** `0, 1, 11, 2, 12, 10, 3, 13, 4, 5, 9, 6, 7, 8`. The trail test passes (r3 → s4 → r4 crosses no island). `INSERTED.creator` → `{ 1: [11], 2: [12, 10], 3: [13], 5: [9] }`.
- **r13 sources are docs-host pages (curl, 2026-10-08).** DTCG: `https://www.designtokens.org/tr/drafts/format/` (the `tr.designtokens.org/format/` URL redirects there; it is the 2025.10 draft and lessons say so) under new id `designtokens-org`. Figma: `developers.figma.com/docs/figma-mcp-server/add-custom-rules/`, `…/code-connect-integration/`, `…/docs/rest-api/variables/` (existing `figma-developer-docs`) and Figma help "Guide to variables" + "Modes for variables" under new id `figma-help` → `https://help.figma.com`. Anthropic: `code.claude.com/docs/en/memory`, Claude vision. OpenAI: `learn.chatgpt.com/docs/agent-configuration/agents-md` (the `developers.openai.com/codex/` URL redirects to this host; cite the final URL under the existing `chatgpt-docs`), images-vision. W3C: `www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html` under new id `w3c-wai`. Storybook (`storybook.js.org/docs/ai`, new `storybook-docs`) and shadcn (`ui.shadcn.com/docs/mcp`, new `shadcn-docs`) document an AI system and are official for their own product, never the only vendor in a lesson. v0's design-systems page is marked legacy: an aside at most, no id unless cited. `m3.material.io` documents no AI system and is not cited. `figma-mcp-guide`, `figma-code-connect`, `dtcg-format` and `canva-connect-kit` (GitHub, 403) are dropped from r13.
- **PR 8 is two PRs.** 8a = `REALMS` row 13 (`pattern-atelier`, `npc: 'Weaver Hale'`, `tier: 'intermediate'`, `track: 'creator'`, `scene: false`), `slotRealms` += `{ slot: 's4', realm: 13 }`, outline entry after r3 with 6 titles and topic "Design systems with AI: tokens, modes, rules, reuse, checks", the three test lines 7a touched (`ids.test.ts` INSERTED, `curriculum.test.ts` creator-only + `realmFolder(13)`, `certificates.test.ts` `creator-r13`), c1–c3 (+ cases, quick checks), new source ids. 8b = c4–c6 + `boss/case.json`. Count line: 3 + 6 + 6 + 6 + 6 + 6 = 33 new creator chapters + 5 bosses.
- **Boss task (draft, voice-guardian):** "Write the token file, modes, rules and reuse list an agent reads before it touches one brand, and the contrast check that proves it" — trim in the 8b pass.
- **Build notes from PR 8a (2026-10-08 curl fetches).** (1) The DTCG `/tr/drafts/format/` page is a preview that says "Do not reference this version as authoritative", while `/tr/2025.10/format/` and `/tr/2025.10/resolver/` are a "Final Community Group Report" the DTCG home page calls the "First stable version". Lessons cite the 2025.10 reports and say "stable community group report, not a W3C Standard", not "draft"; this replaces the drafts URL in the sources bullet above. (2) c2 cites the DTCG Resolver Module 2025.10 for themes (modifiers, contexts, inputs). (3) `figma-help` cites "Overview of variables, collections, and modes", "Modes for variables" (DTCG import/export) and "Extend a variable collection" (Enterprise, multi-brand); "Guide to variables" is a link hub and is not cited. (4) `penpot-docs` → `https://help.penpot.app` joins (design tokens, themes, Penpot MCP) so c1 and c2 are not Figma-only; official for Penpot's own product only. (5) c1–c3 cite no Anthropic or OpenAI page except c3 (CLAUDE.md memory page + Codex AGENTS.md page): neither vendor documents design tokens or modes. (6) No host is added to docs-watch: `help.figma.com`, `www.designtokens.org` and `help.penpot.app` have no `llms.txt` (404).

## Amendments locked 2026-10-07 (PR 7 devil pass)

- **r12 Echo Caverns ships with 6 chapters, not 8.** Creator r0 c1, r2 c4, r3 c4 and r0 c6 already teach speech models, audio formats, transcription basics and the impersonation rules; r12 does not repeat them. Chapters: c1 Voice direction · c2 Dialogue · c3 Design or clone · c4 Music & effects · c5 Captions · c6 Dub & localise. Each lesson links back to the core chapter it builds on. "Voice rights" is folded into c3 as the consent recording the APIs require (Google, OpenAI) and ElevenLabs' own-voice rule, with one link to r0 c6.
- **r12 sits on slot s2, placed before r10 in the creator outline:** `0, 1, 11, 2, 12, 10, 3, 4, 5, 9, 6, 7, 8`. With r12 after r10, the s2 → r3 leg crosses r4's island (the trail test); before r10 every leg is clear. Beginner (r12) before intermediate (r10) also reads better.
- **r12 sources are first-party docs pages:** Gemini API (speech-generation, voice-design, voice-replication, music-generation, lyria-prompt-guide, audio), OpenAI docs (text-to-speech, speech-to-text, custom-voices) and ElevenLabs docs. `gemini-cookbook` (GitHub 403) and `openai-usage-policies` (403) are dropped; OpenAI's custom-voices page states the consent rule. Stability (JS shell), Suno (Notion page) and Udio (no docs) can't be cited. No loudness chapter (EBU R128 is 403; formats are r2 c4). Real-time voice agents are out of scope for a beginner creator realm.
- **ElevenLabs joins the registry** as `elevenlabs-docs` → `https://elevenlabs.io/docs` and `elevenlabs-use-policy` → `https://elevenlabs.io/use-policy` (`trustTier: official`; never the only vendor in a chapter). Google's Cloud TTS custom-voice page is covered by a `google-cloud-docs` base entry only if c3 cites it.
- **PR 7 is two PRs.** 7a = `REALMS` row 12 (`echo-caverns`, `npc: 'Bard Lio'`, `tier: 'beginner'`, `track: 'creator'`, `scene: false`), `slotRealms` += `{ slot: 's2', realm: 12 }`, outline entry after r2 and before r10, `INSERTED.creator` → `{ 1: [11], 2: [12, 10], 5: [9] }`, c1–c3 (+ cases, quick checks). 7b = c4–c6 + `boss/case.json`. Count line: 3 + 6 + 6 + 6 + 6 + 7 = 34 new creator chapters + 5 bosses.
- **Build notes from PR 7a (2026-10-07 fetches).** (1) ElevenLabs now leads with Eleven v4 ("We recommend Eleven v4"); the v3 prompting URL redirects to `/docs/overview/capabilities/text-to-speech/best-practices`, which covers v4 and v3, so lessons say "Eleven v4 (and v3)". (2) The ElevenLabs voice-design URL redirects to `/docs/eleven-creative/voices/voice-design`; lessons cite the final URLs. (3) c3 does not cite Google Cloud TTS, so no `google-cloud-docs` entry is added. (4) OpenAI's TTS page says "11 built-in voices" in its intro and lists 13; c1 uses the list. (5) c1 also cites the OpenAI API reference (create speech) for the `instructions` limit and the `speed` range, under the existing `openai-api-reference` entry.

## Amendments locked 2026-10-07 (PR 6 devil pass)

- **r11 Pigment Bazaar ships with 6 chapters, not 8.** r1 c1/c3/c4/c7/c9, r2 c1/c2 and r0 c1/c4/c5 already teach prompt dialects, chat editing, the order form (size, quality, background), text-in-image caveats and model choice; r11 does not repeat them. Chapters: c1 Model dialects · c2 Hex & palettes · c3 Text & layout · c4 Seeds & steps · c5 Styles & tuning · c6 Open weights. Each lesson links back to the core chapter it builds on. "Pick per job" lives in the boss, not in a chapter.
- **Midjourney and Stability are dropped from r11.** `docs.midjourney.com` is 403 and `www.midjourney.com/docs` is an empty JS shell; `platform.stability.ai/docs` is a JS shell with no text. Neither can pass a fresh fetch. Imagen is shut down (Google's page says so); the Vertex guide stays a dated word list only.
- **New image vendors join the registry when cited:** `bfl-docs` (docs.bfl.ai), `ideogram-docs` (docs.ideogram.ai), `ideogram-api-docs` (developer.ideogram.ai), `recraft-docs` (www.recraft.ai/docs), `huggingface-diffusers-docs` (huggingface.co/docs/diffusers). Adobe custom models cite `developer.adobe.com/firefly-services/docs/firefly-api/guides/concepts/custom-models/` (helpx is 403). Each is official for its own product and never the only vendor in a lesson.
- **"Open models" uses two vendors:** Hugging Face diffusers docs + BFL FLUX.2 [klein] docs. Risk closed.
- **r11 owns "style from references vs a trained model".** r13 c5 "Brand models" is narrowed or dropped at the PR 8 devil pass; it must not re-teach custom models.
- **r11 sits on slot s1** (`slotRealms` += `{ slot: 's1', realm: 11 }`), after r1 in the creator outline: `0, 1, 11, 2, 10, 3, 4, 5, 9, 6, 7, 8`. s2 and s4 are kept for r12 and r13 (this replaces the PR 5 slot sentence: r10 is on s10, r11 on s1, s2 → r12, s4 → r13). `ids.test.ts` INSERTED gains `1: [11]`.
- **PR 6 is two PRs.** 6a = `REALMS` row 11 (`pigment-bazaar`, `track: 'creator'`, `tier: 'beginner'`, `scene: false`), slot row, outline entry with 6 titles, c1–c3 (+ cases, quick checks), new source ids. 6b = c4–c6 + `boss/case.json`.
- **Count line** becomes 3 + 6 + 6 + 6 + 8 + 7 = 36 new creator chapters + 5 bosses.

## Amendments locked 2026-10-07 (PR 5 devil pass)

- **r10 Reel Hollow ships with 6 chapters, not 8.** Creator r0 c4/c5, r1 c5/c8, r2 c6 and r3 c5 already teach video limits, video prompt parts, first frame, sound in the prompt, same-character references and cost per second; r10 does not repeat them. Chapters: c1 Camera moves · c2 Keyframes · c3 Longer cuts · c4 Edit a clip · c5 Loops & stills · c6 Reframe & deliver. Each lesson links back to the core chapter it builds on. Cost appears only in the boss `BUDGET:` part, using r0 c5's method.
- **OpenAI video sources are dropped.** The Sora 2 models and Videos API were shut down on 2026-09-24 (the page says so; r0 c4 already teaches it). `openai-video` and `sora-guide` are not cited in r10. Google is the only big-three video vendor; every r10 chapter cites Google (Veo, or the Vertex guide with its dated note) plus Runway and/or Luma.
- **Luma joins the source registry** as `luma-docs` → `https://docs.agents.lumalabs.ai` (`trustTier: official`, Luma's own product). Cite only that host. `premiere-extend` stays unreachable (helpx 403) and is dropped.
- **"Motion graphics" is not taught through Lottie, Rive, After Effects or Figma Smart Animate.** Those pages document no AI system. c5 "Loops & stills" teaches animated brand stills, logos and product turns with image-to-video (Luma loop, Runway Product Ad, Veo image-to-video).
- **r10 sits on slot s2** (`WORLD_MAP.slotRealms` += `{ slot: 's2', realm: 10 }`), after r2 in the creator outline: `0, 1, 2, 10, 3, 4, 5, 9, 6, 7, 8`. s10, s1 and s4 are kept for r12, r11 and r13.
- **PR 5 is two PRs.** 5a = `REALMS` row 10 (`reel-hollow`, `track: 'creator'`, `tier: 'intermediate'`, `scene: false`), slot row, outline entry with 6 titles, c1–c3 (+ cases, quick checks), sources cited. 5b = c4–c6 + `boss/case.json`. Tests that list specialist realms are generalised over `REALMS` in 5a, so PRs 6–8 touch no test.
- **Count line** becomes 3 + 6 + 6 + 8 + 8 + 7 = 38 new creator chapters + 5 bosses (r11–r13 still get their own devil pass).
- **Build notes from PR 5a (2026-10-07 fetches).** (1) The c6 outline title is "Reframe & export": "Reframe & deliver" is 17 characters, over the 16-character map-pin limit; the id stays `c6`. (2) The outline topic is "Video with AI: camera, keyframes, longer cuts, edits, delivery" (63 characters). (3) The Vertex video prompt guide URL now redirects to the same guide in Google's Gemini Enterprise Agent Platform docs, written for Veo and Gemini Omni Flash; that page no longer shows a "no longer being updated" note, so lessons date it (October 2026) and say it moved, not that it is frozen. (4) Luma's docs today are the "Luma Agents" API with one video model (`ray-3.2`); no camera "concepts" list exists there, so c1 cites Luma's prompt advice and examples only. Luma keyframes are 1–64 (not ≤ 16). (5) On Runway, Gen-4.5 image-to-video takes a first frame only (`position: first`); first + last frames are on other models (Veo 3.1 on Runway: a last frame needs a first frame). c2 teaches it as "check per model".
- **Review fixes on 5a (content-reviewer, voice-guardian, cto).** (1) r10 moved to s10 after cto review: the s2 → r3 leg crossed r4's island; s2 is kept for r12. A test in `lib/constants/world-map.test.ts` now fails when any trail leg of a committed outline crosses a core realm's island. (2) Each new specialist realm adds one `INSERTED` line in `lib/content/ids.test.ts` (the hand-written regression list); this replaces "PRs 6–8 touch no test" for that one line. (3) One term, "approved still": the boss task becomes "Plan a 15-second product teaser from one approved still: keyframes, extensions, one edit and every delivery format".
- **PR 5b build note:** Google video edits are Gemini Omni Flash (Gemini API omni page + the Gemini Enterprise Agent Platform edit-videos page); new source `gemini-enterprise-agent-platform-docs`; `vertex-ai-docs` stays because 5 lessons still cite the old vertex prompt-guide URLs.

## Amendments locked 2026-10-07 (PR 4 devil pass)

- **r9 Canvas Workshop ships with 6 chapters, not 8.** Creator r5 c1/c2/c5 already teach what MCP is, Figma read vs write tools, tool allowlists and OAuth/keys; r9 does not repeat them. Chapters: c1 Canvas to code (design context, metadata, screenshots and why a screenshot alone misleads) · c2 Write to canvas (create/modify tools, beta limits, review before keeping) · c3 Template fills (Canva autofill + Adobe InDesign data merge + Canva MCP brand templates) · c4 Creative APIs (expand, fill, composite inside a layout job: Firefly, OpenAI image edit, Gemini image edit) · c5 Plugins & apps (plugins and in-editor apps vs MCP servers; Canva Developers SDK names) · c6 Export & handoff (export, Code Connect, variables; Enterprise-only endpoints named as such). Each lesson links back to r5 where it builds on it.
- **r9 sources are docs-host pages, never GitHub repos.** In the build box `github.com` is 403 for curl; `developers.figma.com`, `canva.dev`, `developer.adobe.com`, `modelcontextprotocol.io` and the big-three docs return 200 via curl. Fetch with curl, not WebFetch. Canva URLs are `/docs/apps/mcp/` and `/docs/apps/rest-apis/`.
- **PR 4 is two PRs.** 4a = REALMS row 9 (`canvas-workshop`, `track: 'creator'`, `tier: 'intermediate'`, `scene: false`), `slotRealms` row r9 → s5, PATH REALM badge (PathList + RealmCard, `PathRealm.specialist`), outline entry with 6 titles, lessons c1–c3 (+ cases and quick checks), `sources.yaml` ids cited. 4b = c4–c6 + `boss/case.json`. Both pass `content:check` alone (chapters ≤ MIN_CHAPTERS may be COMING SOON).
- **The world-map hero picks a clear side per place** (separate `fix(map)` PR) before 4b.
- **No other engine change.** Certificates, TrackSwitch hiding, OG fallback, blog topic, sitemap, accent and seed are already owner-aware on canary.
- **Review pass on 4a (content-reviewer, voice-guardian, cto, ui-ux-reviewer):** three chapter titles change so they name what the chapter teaches, not one vendor's feature: c2 "Write to canvas" → "Edit the canvas", c4 "Creative APIs" → "Expand & fill", c5 "Plugins & apps" → "Plugins vs MCP". Ids stay.
- **Badge reads "<PATH> ONLY" (voice + UI review), not "PATH REALM",** in the track accent colour; `PathRealm` carries `track` instead of `specialist`.

## Amendments locked 2026-10-07 (PR 3 devil pass)

- **PR 3 is content-only.** Grown-realm CLEARED rule, open rule and 10-node map shipped in PR 1a; PR 3 adds no code. The "one e2e step" becomes one unit test on the real creator outline (realm 1 = 9 chapters, 10 map nodes).
- **Fetch with curl, not WebFetch.** WebFetch still blocks some vendor hosts; curl via the agent proxy reaches them. Content PRs fetch sources with curl.
- **`veo-rewriter` is dropped** (URL redirects to a page with no rewriter content). "Prompt rewriters" is an aside in c9 citing OpenAI `revised_prompt` only; not a chapter pillar.
- **`imagen-guide` may be cited** for its vocabulary tables, with a dated note (Google marks Vertex docs "no longer being updated"). Citing it needs one new official entry in `content/sources.yaml` for `https://docs.cloud.google.com/vertex-ai/generative-ai/docs`. Lessons cite URLs; "only ids cited" means "add a base-URL entry only for a host a lesson cites".
- **c7–c9 teach what c1–c6 do not.** c1 already covers the shot checklist, negative space and text-in-image; c3 covers palette. c7–c9 reference those and go deeper. c8 is renamed "Framing & format". Boss case stays unchanged.
- **Correction: one code fix shipped in PR 3.** `nextStepId` (lib/data/quest.ts) now reads the realm's chapter count from the outline; without it Continue after c6 pointed at the locked boss.

## Amendments locked 2026-10-07 (devil pass, PR 2)

- **PR 2 adds no component and no CSS.** The dashboard renders `components/realms/path-list.tsx` with the shipped `.path-list` styles. `components/dashboard/realm-tile.tsx`, `.tile-grid`, `DASHBOARD_REALM_LIMIT`, `Dashboard.active`, `DASHBOARD_TEXT.realmsHeading` and `noActiveRealms` are deleted. `activeRealms` stays (it picks `next` in `buildTrackMap`). `.realm-tile*` CSS stays (the landing uses it).
- **Rows link to the realm page** (`realmHref`), as on the old tiles. A pure `pathRealms(map, hrefFor)` in `lib/grading/world-map.ts`, extracted from `worldView`, builds the rows for both pages.
- **No tier label on rows.** The PATH REALM badge waits for PR 4 (first specialist realm) and goes on `PathList`, so the map and the dashboard both get it.
- **Section head = heading `WORLD_MAP_TEXT.pathHeading` ("YOUR PATH") + one link "View on world map" → `/map`.** "Browse all" stays only in the Continue card's empty state. Current-row tag = `WORLD_MAP_TEXT.youAreHere`.
- **`dashboard/loading.tsx` shows row placeholders**, not three tiles.
- **Gates: devil → cto.** The list and its copy were reviewed in #137; axe on `/dashboard` already runs in e2e.
- `curriculum-design-plan.md` gets a dated line superseding "up to `DASHBOARD_REALM_LIMIT` (3) active realms"; the world-map spec's acceptance line about the dashboard link is ticked.

## Amendments locked 2026-10-07 (world map, SIG-59)

- **The "Your path" list is `components/realms/path-list.tsx`**, built by the world map PR 1 (`docs/plans/world-map-design-plan.md`). PR 2 here reuses it on the dashboard instead of a new `components/dashboard/path-list.tsx`, and adds a "View on world map" link to `/map`. One list, two pages.
- **A specialist realm needs a world-map slot when it ships:** one `{ slot, realm }` row in `WORLD_MAP.slotRealms` (`lib/constants/world-map.ts`). A test fails if a `REALMS` row has neither a core place nor a slot.

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

| Ch. | Title            | Teaches                                                                                                                                                                          | Sources (status)                                                                                                                                       |
| --- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| c7  | Light & colour   | Light words by part (quality, direction, setup, time of day) and colour words the guides show; a light change vs a colour change in multi-turn edits. Palette basics stay in c3. | `imagen-guide` (F, curl) · `gemini-image` (F, curl) · OpenAI image prompting guide (F, curl)                                                           |
| c8  | Framing & format | Camera distance, position and lens/focal length; aspect ratio per use and each vendor's limits; the composition-control caveat. Negative space stays in c1 (one line).           | `imagen-guide` (F, curl) · `gemini-image` (F, curl) · `openai-image` (F, curl) · OpenAI image prompting guide (F, curl)                                |
| c9  | Image vs text    | A text prompt (explicit, structured, examples) next to an image prompt (describe what is seen; negatives differ by vendor); aside: OpenAI `revised_prompt`                       | `claude-prompting` (F, curl) · `gemini-image` (F, curl) · `openai-image` (F, curl) · OpenAI image prompting guide (F, curl) · `imagen-guide` (F, curl) |

OpenAI image prompting guide: `https://developers.openai.com/api/docs/guides/image-prompting` (under the existing `openai-docs` entry).

Boss: unchanged task. The boss case gets no new question type; its 5 questions may now come from any of the 9 chapters.

### r9 Canvas Workshop: Design tools & MCP (intermediate, 6 chapters)

6 chapters, not 8: see "Amendments locked 2026-10-07 (PR 4 devil pass)". The old c1 "Design servers" and c8 "Scopes & access" repeat creator r5 c1/c2/c5 and were dropped. Status F (curl) = fetched with curl on 2026-10-07 and every quoted line grepped in the saved text.

NPC: Guildmaster Ines. Topic: "Design tools with AI: read, write, fill templates, hand off". Builds on r5 (map order: r5 → r9 → r6).

| Ch. | Title            | Teaches                                                                                                                                                                               | Sources (status)                                                                                                                                                                                          |
| --- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| c1  | Canvas to code   | Design context, metadata, variables and screenshots as input; why a screenshot alone misleads; file structure; small selections                                                       | Figma MCP tools-and-prompts, mcp-vs-agent, structure-figma-file, avoid-large-frames, trigger-specific-tools · Canva MCP `get-design-content` · Claude vision · OpenAI images-vision (all F, curl) — PR 4a |
| c2  | Edit the canvas  | Figma `use_figma` (Plugin API, Full seat, remote only, current limitations) and `upload_assets` · Canva editing transactions (start, perform, commit, cancel) · review before keeping | Figma write-to-canvas, tools-and-prompts · Canva MCP editing tools, access, best practices, design edit handoff · Claude MCP connector · OpenAI MCP servers (all F, curl) — PR 4a                         |
| c3  | Template fills   | Generate vs template vs fill; named fields; Canva autofill (REST + MCP) and Adobe InDesign Data Merge; plan limits, silent empties, defaults, media, fonts                            | Canva REST autofill guide · Canva MCP `autofill-design`, `get-brand-template-dataset`, `search-brand-templates`, best practices, handoff · Adobe InDesign API, Data Merge guide (all F, curl) — PR 4a     |
| c4  | Expand & fill    | Expand, fill, composite inside a layout job                                                                                                                                           | Firefly · OpenAI image edit · Gemini image edit — PR 4b                                                                                                                                                   |
| c5  | Plugins vs MCP   | Plugins and in-editor apps vs MCP servers; Canva Developers SDK names                                                                                                                 | Figma plugins · Canva Developers SDK — PR 4b                                                                                                                                                              |
| c6  | Export & handoff | Export, Code Connect, variables; Enterprise-only endpoints named as such                                                                                                              | Figma REST / Code Connect · Canva export — PR 4b                                                                                                                                                          |

Boss task: "Plan a studio workflow from a design file to filled templates and a developer handoff" (PR 4b). The draft task was dropped: it was close to r5's boss.

### r10 Reel Hollow: Motion & video (intermediate, 6 chapters)

6 chapters, not 8: see "Amendments locked 2026-10-07 (PR 5 devil pass)". The old c1 "Video models", c3 "Frames to motion" (first frame), c4 "Same character", c7 "Sound on video" and c8 "Seconds & cost" repeat creator r0 c4/c5, r1 c5 and r3 c5 and were dropped; OpenAI video sources were dropped (API shut down 2026-09-24). Status F (curl) = fetched with curl on 2026-10-07 and every quoted line grepped in the saved text.

NPC (draft): Lanternist Oto. Topic: "Video with AI: camera, keyframes, longer cuts, edits, delivery". Builds on r2 (map order: r2 → r10 → r3).

| Ch. | Title            | Teaches                                                                                                                                                                                                             | Sources (status)                                                                                                                                                                                          |
| --- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| c1  | Camera moves     | Motion words only: static, pan, tilt, dolly, truck, pedestal, zoom (vs dolly), crane, aerial, handheld, whip pan, arc; rack focus and dolly zoom; camera move vs subject move. r1 c5/c8 hold framing and lens words | Vertex video prompt guide (dated note: now in the Gemini Enterprise Agent Platform docs) · Veo prompt guide · Luma video generation (prompt advice) · Runway Product Ad, Multi-Shot (all F, curl) — PR 5a |
| c2  | Keyframes        | First frame only, first + last (interpolation), multi-keyframe beats (what holds, what changes); frame index = seconds × 24; validation rules per vendor; one line back to r1 c5                                    | Veo first and last frames, `lastFrame` · Luma start/end frames, keyframes (1–64), validation rules · Runway API reference (`position: first`/`last` per model) (all F, curl) — PR 5a                      |
| c3  | Longer cuts      | Extend forward and backward, chain by last frame, cut on action, continuity checks at the seam; r0 c4 holds the limits                                                                                              | Veo "Extending Veo videos" and "Prompting for extension" · Luma extend / backward extend · Runway Multi-Shot recipe, API reference (`mode: extend`) (all F, curl) — PR 5a                                 |
| c4  | Edit a clip      | Edit an existing clip (restyle, refine, keyframed edits)                                                                                                                                                            | Luma video editing · Omni Flash edit · Runway video-to-video — PR 5b                                                                                                                                      |
| c5  | Loops & stills   | Animated brand stills, logos and product turns with image-to-video                                                                                                                                                  | Luma loop · Runway Product Ad · Veo / Omni image-to-video — PR 5b                                                                                                                                         |
| c6  | Reframe & export | Reframing to new aspect ratios, delivery formats                                                                                                                                                                    | Luma reframing · Runway professional outputs · Veo — PR 5b                                                                                                                                                |

Boss task: "Plan a 15-second product teaser from one hero still: keyframes, extensions, one edit and every delivery format" (PR 5b). Cost appears only in the boss `BUDGET:` part (r0 c5 method). Review note (5a): the task now says "one approved still", not "one hero still" (see the PR 5 amendment).

### r11 Pigment Bazaar: Image craft per model (beginner, 6 chapters)

6 chapters, not 8: see "Amendments locked 2026-10-07 (PR 6 devil pass)". The old c2 "Chat editing", c3 "Keyword prompts", c4 "Parameters", c6 "Text in images" and c8 "Pick per job" repeat creator r0 c1/c4/c5, r1 c1/c3/c4/c7/c9 and r2 c1/c2, or lean on Midjourney and Stability pages that cannot be fetched. Status F (curl) = fetched with curl on 2026-10-07 and every quoted line grepped in the saved text.

NPC (draft): Dyer Sabe. Topic: "Image craft per model: colours, text, seeds, styles, open weights". Builds on r1 (map order: r1 → r11 → r2).

| Ch. | Title           | Teaches                                                                                                                                                                                                                         | Sources (status)                                                                                                                                                                                                  |
| --- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| c1  | Model dialects  | One brief on five models: prose, positive scene description, FLUX positives and inputs by position, Ideogram plain language or JSON, Recraft raster vs SVG; prompt rewriters per model. r1 c9 holds the text-vs-image table     | OpenAI image prompting · Gemini image generation · BFL prompting basics, technical parameters · Ideogram prompting basics, image settings · Recraft models, V4 prompting, enhance prompt (all F, curl) — PR 6a    |
| c2  | Hex & palettes  | Hex codes tied to objects in the prompt; Ideogram `color_palette` (image and per element) and the 3.0 palette setting; Recraft `controls.colors` (RGB, weights); check the colour. r1 c7 holds the OpenAI/Gemini colour words   | BFL hex colour prompting · Ideogram JSON prompting, models, image settings · Recraft endpoints, colour palettes (all F, curl) — PR 6a                                                                             |
| c3  | Text & layout   | Quote the words, place them, describe the type, spell letter by letter; Ideogram JSON `text`/`desc`/`bbox`; FLUX layout boxes; Recraft `text_layout` (V3 only); typography-tuned FLUX.2 [flex]. r0 c1 and r1 c1 hold the caveat | OpenAI image prompting · Gemini image generation · Ideogram text in images, JSON prompting · BFL layout prompts, bounding boxes, typography, FLUX.2 [flex] · Recraft endpoints, adding text (all F, curl) — PR 6a |
| c4  | Seeds & steps   | Seeds and inference steps: which models have them, what repeats and what does not                                                                                                                                               | Ideogram image settings · BFL · Hugging Face diffusers — PR 6b                                                                                                                                                    |
| c5  | Styles & tuning | Style from references vs a trained model                                                                                                                                                                                        | Recraft styles · Ideogram custom models · Adobe Firefly custom models · BFL FLUX.2 [klein] training — PR 6b                                                                                                       |
| c6  | Open weights    | Open-weight image models and what running them yourself changes                                                                                                                                                                 | Hugging Face diffusers docs · BFL FLUX.2 [klein] — PR 6b                                                                                                                                                          |

Boss task: "Write one launch brief as prompts and settings for four different image models, and mark which outputs need a human check" (PR 6b; no trailing period, it is the boss title verbatim)

### r12 Echo Caverns: Voice & audio (beginner, 6 chapters)

6 chapters, not 8: see "Amendments locked 2026-10-07 (PR 7 devil pass)". The old c1 "Audio models" repeats creator r0 c1, r2 c4 and r3 c4; c8 "Voice rights" is folded into c3 (consent recording, own-voice rule, one link to r0 c6). Status F (curl) = fetched with curl on 2026-10-07 and every quoted line grepped in the saved text.

NPC (draft): Bard Lio. Topic: "Audio with AI: voice direction, consent, music, captions, dubs". Builds on r2 (map order: r2 → r12 → r10).

| Ch. | Title           | Teaches                                                                                                                                                                                                                                                                                                                                             | Sources (status)                                                                                                                                                                                      |
| --- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| c1  | Voice direction | Where direction goes so it is not read aloud: OpenAI `instructions` (not on `tts-1`/`tts-1-hd`), Gemini `speech_metadata.style` + angle-bracket tags, ElevenLabs v4/v3 audio tags; speed ranges; capitals for stress; start plain; pick the voice first; AI disclosure. Formats stay in r2 c4                                                       | OpenAI text-to-speech, API reference (create speech) · Gemini speech generation · ElevenLabs text-to-speech, best practices (v4/v3 prompting), voices (all F, curl) — PR 7a                           |
| c2  | Dialogue        | Two or more speakers in one clip: Gemini `speakers` (2 prebuilt voices per request; custom voices turn by turn), ElevenLabs Text to Dialogue (no speaker limit, ≤ 2,000 characters per request), OpenAI one voice per request; labelled turns, disfluencies, cut-offs, backchannels; sound-effect tags differ; takes and seeds                      | Gemini speech generation · ElevenLabs text-to-dialogue · OpenAI text-to-speech (all F, curl) — PR 7a                                                                                                  |
| c3  | Design or clone | Design from words (Gemini voice design, ElevenLabs Voice Design) vs a replica of a real voice (Gemini voice replication, OpenAI custom voices, ElevenLabs instant and professional cloning); consent recordings and exact phrases; own-voice-only PVC; a passed check is not permission; ElevenLabs use policy; TTL. Rights link to r0 c6 and r3 c6 | Gemini voice design, voice replication · OpenAI custom voices, text-to-speech · ElevenLabs voice design, voices, instant and professional cloning, cloning concepts, use policy (all F, curl) — PR 7a |
| c4  | Music & effects | Music and sound-effect prompts                                                                                                                                                                                                                                                                                                                      | Gemini music generation, Lyria prompt guide · ElevenLabs music, sound effects — PR 7b                                                                                                                 |
| c5  | Captions        | Transcripts, timestamps and subtitle files                                                                                                                                                                                                                                                                                                          | OpenAI speech-to-text · Gemini audio · ElevenLabs speech-to-text — PR 7b                                                                                                                              |
| c6  | Dub & localise  | Translating a voice-over; checking timing and names                                                                                                                                                                                                                                                                                                 | ElevenLabs dubbing · OpenAI speech-to-text, text-to-speech · Gemini speech generation — PR 7b                                                                                                         |

Boss task: "Plan the voice, music and captions for a 60-second explainer in three languages: one consented voice, one music bed, subtitle files and a dub check" (PR 7b; no trailing period, it is the boss title verbatim)

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

**Count:** 3 + 6 + 6 + 6 + 6 + 7 = **34 new creator chapters + 5 bosses** (r13 still gets its own devil pass).

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
