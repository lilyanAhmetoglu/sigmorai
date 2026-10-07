# Sigmorai — Knowledge base and docs sync

> One database of the latest AI-engineering knowledge (official docs, changelogs, cookbooks, high-star repos). It feeds three things: new levels (as PRs), lesson freshness checks, and the mentor's grounding. Read end-to-end before any code; each phase is gated by explicit approval.

## Status

**STATUS: Approved for SIG-23 (amendment 2026-10-06: docs-watch + knowledge-sync routine; no new tables). Build step: 8. Track: both.**

## Amendments

## Amendments locked 2026-10-07

The knowledge-sync skill (`.claude/skills/knowledge-sync/SKILL.md`) is **run by hand** by the maintainer. There is **no scheduled routine** and no unattended mode; the 2026-10-06 "routine" wording is dropped. Commit and push follow `git-safety.md` as usual; a human still merges every knowledge-sync PR (the 2026-10-06 rule stands). The skill has `disable-model-invocation: true`, so only the maintainer's `/knowledge-sync` runs it. docs-watch (the GitHub Action on `main`) only opens issues.

## Amendments locked 2026-10-06 (SIG-23: docs-watch + knowledge-sync routine)

Devil-reviewed plan for SIG-23. Layered on top; everything below stays for history. **This block replaces the whole Pipeline, Data model, Mentor grounding, AI and cost, Licensing and Phases sections.** Why: the old pipeline needed a DB role, embeddings, a model key and a triage prompt to answer one question, "did a page a lesson cites change?". A hash in git answers it for free; a Claude Code routine with a human-merged PR does the drafting.

**Two parts replace the pipeline.**

| Part              | What                                                                                                                                                                                                                                                                                                                                                        |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. docs-watch     | `.github/workflows/docs-watch.yml`, daily `17 6 * * *` + manual. Runs `bun run docs:watch` (`scripts/docs-watch.ts`, logic in `lib/content/docs-watch.ts`, bun-tested). Fetches, normalises, sha256-hashes, compares. No DB, no model, no API key, no network calls except the GETs. Always exits 0: a failed fetch is a log row and keeps the stored hash. |
| 2. knowledge-sync | A skill **run by hand** (`.claude/skills/knowledge-sync/SKILL.md`, Part 2; no scheduled routine, see Amendments 2026-10-07) reads the open `docs-changed` issue, checks each citing lesson against the live page, and opens `new-level` PRs into `canary`. It drafts; a human merges.                                                                       |

**Fetch set.** Every page any track, Math Tower or Frontier lesson cites, plus one index per enabled source in `sources.yaml`:

- `docs` on platform.claude.com, developers.openai.com, code.claude.com → `<base>/llms.txt`. Other `docs` → the base page.
- `changelog` → the page as Markdown. Two new official sources: `claude-release-notes` and `openai-changelog`.
- `blog` (anthropic.com/engineering) → the page's main text.
- `repo` → `releases.atom` (entry ids + update times); the raw `README.md` when there are no releases.
- Pages on platform.claude.com, developers.openai.com, code.claude.com and modelcontextprotocol.io are fetched as `<page>.md`, and on ai.google.dev as `<page>.md.txt` (no banners in the hash); on a 404 the page itself (a moved page).
- Normalise: Markdown/plain → trimmed. HTML → first `<article>`, else `<main>`; tags stripped, whitespace collapsed (regex, no parser package). A URL with no stored hash (first run, new citation) is recorded, never reported.

**State in git, not a DB.** `hashes.json` = `{ pages: { [url]: { hash, checkedAt, changedAt } }, pending: [{ url, sourceId, changedAt, lessons }], issue }` on the orphan branch **`docs-watch`** (never merged; carries a `vercel.json` with deployments off). Only the workflow pushes there, with the built-in token.

**One issue.** One open issue labelled `docs-changed` lists every pending page: URL, source id, changed date, citing lesson ids. URLs and ids only, never page text (a page is untrusted). **Closing the issue = handled**: the next run clears `pending` and opens a fresh issue on the next change.

**Routine rules (Part 2).**

- Branch from `origin/canary` (the repo default branch is `main`). PRs target `canary`, labelled `new-level`.
- The PR body carries the `validate-content` steps 2–5 result (each claim: supported / not supported / not found, with quote + URL).
- At most **2 PRs per run**; **none when 5 or more `new-level` PRs are open**. Never merges, never closes an issue or a PR.
- At most **1 Frontier chapter + its blog post per run**, in its own PR, never mixed with lesson fixes.
- Environment: Custom network = the defaults + `developers.openai.com`, `ai.google.dev`, `modelcontextprotocol.io`. Setup script `bun install --frozen-lockfile`. No connectors. No secrets.

**Dead (dropped, not deferred):** `kb_documents`, `kb_chunks`, `kb_changes`, `kb_source_candidates`, `lesson_sources`, embeddings and pgvector (Voyage), model triage and its enum, weekly star discovery, `fetch_config` licence rules, the least-privilege DB role, the content-dashboard `stale` flag, and lesson-frontmatter `sourceHash` (removed from `LessonFrontmatterSchema`).

**Kept but unread:** `kb_sources` stays in the schema and in `bun run seed`; nothing reads it. Dropping it is a later cleanup with **db-architect**.

**Deferred:** `level_announcements` and the NEW LEVEL banner (a later ticket).

**`.github/workflows/content-review.yml` is deleted.** It needed an Anthropic key that will not exist. The routine runs the same fact-check (validate-content steps 2–5) on what it drafts, and `content-reviewer` still runs on every content PR through `/commit` and `/review`.

**Build order.** Step 8 before step 7 (mentor) is fine: nothing here depends on the mentor. The mentor's grounding is now "the current lesson's cited pages", decided in step 7.

**Acceptance (replaces the list at the bottom).**

- [ ] `bun run docs:watch` run twice in a row against the live sites reports 0 changes the second time.
- [ ] A changed page appears once in `pending` and once in the issue, with every citing lesson id; a second change to it keeps one row.
- [ ] A fetch error never changes the stored hash and never fails the job.
- [ ] Closing the issue clears `pending` on the next run.
- [ ] The workflow pushes only to `docs-watch`; never to `canary` or `main`.
- [ ] The issue body holds URLs, source ids, dates and lesson ids only.
- [ ] Routine PRs: into `canary`, labelled `new-level`, at most 2 per run, none at 5+ open, never merged by the routine.

## Amendments locked 2026-10-06 (blog pages, SIG-22)

Devil-reviewed plan for SIG-22. Layered on top; the Blog table below stays for history. No DB change.

| Topic         | Decision                                                                                                                                                                                                                                           | Replaces                                        |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Frontmatter   | `title, description, lesson` (`BlogFrontmatterSchema`; `lesson` is a `…/lesson` id). The date and slug come from the file name. The page is `/blog/<slug>`, so a slug is used once.                                                                | —                                               |
| Sources       | A post has no `sources` field. It cites via `lesson:`; the post page lists that lesson's sources. Why: one list, no drift between lesson and post.                                                                                                 | "same date-slug and same sources as the lesson" |
| Body          | Plain Markdown, plain product voice. **No `<DialogBox>`** in a post: the renderer and `content:check` allow no components.                                                                                                                         | —                                               |
| Validation    | `bun run content:check` validates every post: schema, MDX body with no components, the linked lesson has a file, no duplicate slug.                                                                                                                | posts skipped by the validator                  |
| Pages         | In the `(marketing)` group, prerendered at build time: `/blog` (list), `/blog/<slug>` (`generateStaticParams`, `dynamicParams = false`). RSS 2.0 at `/blog/feed.xml` from a pure builder (`lib/content/feed.ts`, no feed package), `force-static`. | "Static, public, indexed. RSS feed + sitemap"   |
| Not in SIG-22 | No tags (revisit past ~10 posts). Sitemap, OG images and robots move to SIG-24 / SIG-34; SIG-22 exports `listBlogPosts()` for them (done in SIG-24).                                                                                               | sitemap entries in this ticket                  |
| Entry point   | A BLOG link in the site footer only (footer nav label "Legal" → "Footer").                                                                                                                                                                         | —                                               |
| Seed          | One hand-written seed post for a merged realm-01 lesson (`builder/r1/c1/lesson`).                                                                                                                                                                  | —                                               |

## Amendments locked 2026-10-05 (content validator)

Layered on top; nothing below is rewritten except the docs-host name in the source-kinds table.

- **`bun run content:check`** validates every file under `content/` with the app's own Zod loaders (`lib/content/validate.ts`): schemas, ids vs paths, stray files, and every lesson source URL under a `trustTier: official` entry of `sources.yaml`. It runs in the `content-check.sh` hook after Claude edits content or the curriculum, and in the CI `check` job. Free: no model, no network.
- **Facts are checked by `content-reviewer`** following `.claude/skills/validate-content/SKILL.md`: each claim marked supported / not supported / not found against the live cited page. `/commit` and `/review` run it when the diff touches `content/**` or `lib/constants/curriculum.ts`.
- **`.github/workflows/content-review.yml`** runs the same fact-check on PRs that touch content or the curriculum and posts one PR comment. It **costs money** (Anthropic API tokens), so it is **off by default**: it runs only when the repo variable `CONTENT_REVIEW_ENABLED=true` and the secret `ANTHROPIC_API_KEY` are set. Capped at **$3 per run** (`--max-budget-usd 3`) and 40 turns; only changed files; never edits, approves or merges.
- **One Claude docs host:** `platform.claude.com/docs` (what live pages use). The source-kinds table below now says so (it said `docs.claude.com`).
- **`sources.yaml` gains official entries** for Claude Code docs, Anthropic engineering posts, the OpenAI cookbook and the MCP spec. `openai.com/index` is not added: it returns 403 to automated fetches, so no claim from it can be verified.

## Amendments locked 2026-10-05 (no-code pivot, vendor-neutral)

- **The drafter never writes a `challenge.json`.** `fill-stub` output is lesson + `case.json` + `quick-check.json` + blog post, on both tracks. The "Builder fill-stub opens as a draft PR until a human runs the challenge" row is dropped. `update-level` may touch the case, never a challenge.
- **Source list is vendor-neutral by rule.** `docs` and `blog` kinds must include at least Anthropic, OpenAI, Google and one open-model/community source before P0 content merges.
- **`case.json` may carry an optional `exhibit`** (a trace, a tool schema, a prompt, a config) that the drafter can fill.
- **Docs first.** (a) The drafter writes lesson claims only from `trustTier: official` pages: `docs`, `changelog`, and official vendor engineering posts (`blog` kind on the vendor's own domain, e.g. `anthropic.com/engineering`, `openai.com/index`), which are the primary source for harness engineering. Community `repo` and community `blog` pages feed examples and Frontier triage, never a claim. A repo change alone never drafts a lesson. `LESSON_SOURCE_KINDS` gains `blog` (official only) in PR 2. (b) Repos promoted by star discovery get `trustTier: community` and can never be a lesson's only source. (c) The store holds "official docs and changelogs first", not "latest tricks, tutorials". (d) The drafter prompt gets the chapter's mapped doc pages (both vendors) as its only grounding; the PR body lists them so the validator can diff claims vs pages.
- **The product's own model stays Claude** (mentor, triage, drafting). Vendor-neutral is about what we teach, not what we run.

## Amendments locked 2026-10-05 (devil pass on the Frontier)

The `devil` reviewed PR #7. The team approved its full list (the maintainer delegated product calls). Each line replaces the matching part of the "frontier + blog" block below.

| Topic             | Decision                                                                                                                                                                                                                                                                                                 |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontier files    | A chapter is a folder: `content/frontier/<YYYY-MM-DD>-<slug>/` with the lesson MDX + `quick-check.json`. **No `outline.json`.** Title and sources come from the lesson frontmatter. **No builder challenge** in the drafter's output. Why: the folder list is the outline, so there is nothing to drift. |
| One name          | The same `<YYYY-MM-DD>-<slug>` names the chapter folder, the blog file and the PR branch.                                                                                                                                                                                                                |
| Flood guards      | Changed pages are grouped **per source per run**: one triage call per source. **5 or more open `new-level` PRs → draft nothing**; changes stay `pending`. Triage has its own cap (separate from the draft budget). The triage prompt lists the existing Frontier folders and the stub chapter titles.    |
| Spend log         | Tokens + model id go into the job summary and into each PR body.                                                                                                                                                                                                                                         |
| Builder fill-stub | A builder `fill-stub` PR opens as a **GitHub draft PR** until a human runs the challenge.                                                                                                                                                                                                                |
| Blog              | Posts are **dated snapshots**; only lessons go stale. `/blog` reuses the lesson MDX renderer. Sitemap = Next's `app/sitemap.ts`. RSS = a small route handler. Blog pages ship in **step 8**.                                                                                                             |
| Schema            | **No new table.** At step 3, **db-architect** reviews `kb_changes.triage` as `text` + a Zod enum, and `level_announcements` pointing at a Frontier chapter.                                                                                                                                              |

## Amendments locked 2026-10-05 (frontier + blog)

Maintainer decision, 2026-10-05. Layered on top; the older lines below stay for history.

**Why:** the sync job must be able to add new chapters. The main map is fixed (9 realms × 6 chapters), so a sync-made level had no place to go. The blog was also missing here.

| #   | Decision                                                                                                                                                                                                                                                                                                                    | Replaces                                                                                                   |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 1   | **New side realm "The Frontier"** (working name; `voice-guardian` checks it). Next to the Math Tower. The sync job writes its chapters. It grows over time, newest first. No boss, no fixed count. Rules: `curriculum-design-plan.md` → Realm map.                                                                          | "new-level" with no home on the map                                                                        |
| 2   | **Triage outcomes:** `ignore` · `update-level` (a live lesson is stale) · `fill-stub` (the topic fits a "Coming soon" chapter in a main realm; draft that chapter there) · `frontier-chapter` (new topic; new Frontier chapter). Every non-ignore outcome drafts files and opens a PR labelled `new-level`. A human merges. | `ignore \| update-level \| new-level`                                                                      |
| 3   | **Blog:** every `fill-stub` and `frontier-chapter` PR also drafts one short post, `content/blog/<date>-<slug>.mdx`, with the same sources, in the same PR. Static MDX pages: `/blog`, RSS, sitemap, indexed. A post is a file, not a DB row.                                                                                | The curriculum spec's "a job clusters sources and drafts posts" (no separate blog job; it rides on the PR) |
| 4   | **More vendors in the seed list:** Google Gemini API docs, Mistral docs, Hugging Face docs, LangChain/LangGraph docs, Vercel AI SDK docs. All "verify URL in phase 1". Discovery stays candidates-only (stars > 5000); a human promotes by PR.                                                                              | Seed docs = Anthropic, OpenAI, MCP only                                                                    |
| 5   | **Cost guard stays:** draft budget N per run, clean stop when hit. Drafting model id from `lib/constants`. A `fill-stub` or `frontier-chapter` draft counts as **one** draft (lesson + quick check + post together).                                                                                                        | —                                                                                                          |
| 6   | **SCHEMA REVIEW REQUIRED: db-architect.** `kb_changes.triage` becomes `pending \| ignore \| update-level \| fill-stub \| frontier-chapter`. `new-level` leaves the enum (it is still the **PR label**). **No new table:** Frontier chapters and blog posts are files in `content/`.                                         | `kb_changes.triage` enum                                                                                   |

## Amendments locked 2026-10-04

- **Embeddings: Voyage AI** (1024-dim) on Neon `pgvector`. Decided by the maintainer.
- **Seed repos add `walkinglabs/learn-harness-engineering`**, a harness-engineering curriculum, to the `repo` sources.
- **KB tables ship with step 3's schema**, so `bun run seed` loads `content/sources.yaml` into `kb_sources` from day one. The fetch, triage and PR jobs still land in step 8.
- **Status: approved in direction. Still needs the `devil` and `db-architect` reviews before any migration.**

---

## Context

The build prompt's docs-sync job (`docs/build-prompt.md` → Content pipeline) hashes pages and drafts levels, but keeps no memory between runs except `sourceHash` in frontmatter. The maintainer wants more than that: a **real store of the latest tricks, tutorials and docs** from Anthropic, OpenAI and large GitHub repos (agent harnesses, MCP servers, eval tools). The store becomes the source of truth for "what's new" and "what changed", and the mentor reads only from it.

Hard rules that bind this spec: content is never auto-published (`.claude/context/project.md`); every lesson claim traces to a source (`content/CLAUDE.md`); the mentor is grounded only in the current lesson's sources (`.claude/rules/scoped/mentor-eval.md`).

## Purpose

Learners get levels that track the real, current state of AI engineering, not a snapshot from launch. The maintainer gets a daily, reviewable queue of "this changed / this is new" with drafted levels attached, instead of reading five changelogs by hand.

## Sources (what we collect)

Registry lives in `content/sources.yaml` (git-reviewed), mirrored into `kb_sources` by the sync job.

| Kind        | How it's fetched                                                          | Examples (seed list, verify URLs in phase 1)                                                                                                                                                                                                                                                    |
| ----------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs`      | `llms.txt` / `llms-full.txt` when present, else `sitemap.xml`, then pages | Claude docs (platform.claude.com/docs), Claude Code docs (code.claude.com/docs), OpenAI platform docs, MCP spec (modelcontextprotocol.io). **Added 2026-10-05, verify URL in phase 1:** Google Gemini API docs, Mistral docs, Hugging Face docs, LangChain / LangGraph docs, Vercel AI SDK docs |
| `changelog` | RSS/Atom or the changelog page                                            | Anthropic release notes, OpenAI changelog, Claude Code `CHANGELOG.md`                                                                                                                                                                                                                           |
| `repo`      | GitHub API: README, `docs/**`, `examples/**`, latest releases             | anthropics/claude-cookbooks, anthropics/claude-code, walkinglabs/learn-harness-engineering, openai/openai-agents-python, modelcontextprotocol/servers, vercel/ai, pydantic/pydantic-ai, langchain-ai/langgraph, huggingface/smolagents                                                          |
| `blog`      | RSS of **official engineering blogs only**                                | Anthropic engineering posts, OpenAI cookbook articles                                                                                                                                                                                                                                           |

**Discovery of new repos** (the "large starred repo" part): a weekly GitHub search (`topic:ai-agents OR topic:mcp OR topic:llm-evaluation`, `stars:>5000`, pushed in the last 90 days) writes to `kb_source_candidates`. A human promotes a candidate into `sources.yaml` by PR. Nothing is crawled just because it's popular.

**Not collected:** social media, forums, SEO tutorial sites, paywalled content. Trust is the product; the Hallucinant feeds on unvetted sources.

## Pipeline

```
sources.yaml ─▶ fetch (ETag/If-Modified-Since, rate-limited, robots.txt)
             ─▶ normalise to markdown ─▶ sha256 ─▶ unchanged? stop
             ─▶ kb_documents (new version) ─▶ chunk + embed ─▶ kb_chunks
             ─▶ kb_changes (diff vs previous version)
             ─▶ triage (Claude, structured output, Zod-parsed)
                  ignore            ─▶ stop
                  update-level      ─▶ redraft the stale lesson in place
                  fill-stub         ─▶ draft a "Coming soon" main-realm chapter + blog post
                  frontier-chapter  ─▶ draft a new Frontier chapter + blog post
             ─▶ draft budget hit? stop cleanly
             ─▶ one PR labelled `new-level` per change (never auto-merged)
             ─▶ (after merge) level_announcements row ─▶ "NEW LEVEL" banner
```

| Outcome            | When                                                       | Files the PR drafts                                                                                          |
| ------------------ | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `ignore`           | Typo, layout, nothing a learner needs                      | none                                                                                                         |
| `update-level`     | A live lesson cites the changed doc and is now wrong       | the existing lesson MDX (+ its challenge/case/quick check if needed)                                         |
| `fill-stub`        | The topic matches a stub chapter in a main realm's outline | `content/<track>/<realm>/<chapter>/` lesson + case/challenge + quick check; `content/blog/<date>-<slug>.mdx` |
| `frontier-chapter` | A new topic with no main-realm slot                        | `content/frontier/<YYYY-MM-DD>-<slug>/` lesson + `quick-check.json` (no challenge); blog post (devil pass)   |

Triage only picks `fill-stub` for a chapter title already in an outline. It never adds a main-realm chapter.

Also: lessons whose cited document changed get a `stale` flag on the content dashboard, so an outdated lesson is never silently live.

Runs in GitHub Actions (daily cron for docs/changelogs/repos, weekly for discovery), writing to Neon with a dedicated, least-privilege DB role.

## Data model

Draft for **db-architect** review (SCHEMA REVIEW REQUIRED). Neon Postgres + `pgvector`.

- `kb_sources(id, kind, title, url, owner, trust_tier, enabled, fetch_config jsonb, last_checked_at, created_at)`
- `kb_source_candidates(id, repo_full_name unique, stars, topics text[], description, status: pending|promoted|rejected, seen_at)`
- `kb_documents(id, source_id → kb_sources, url, version int, title, content_md, content_hash, etag, last_modified, fetched_at)`. Unique `(url, version)`; partial unique "latest" index.
- `kb_chunks(id, document_id → kb_documents on delete cascade, ord, text, token_count, embedding vector(1024))`. HNSW index on `embedding`.
- `kb_changes(id, document_id, prev_document_id, change_kind: new|changed|removed, diff_summary, triage: pending|ignore|update-level|fill-stub|frontier-chapter, triage_reason, pr_url, detected_at)`. Enum amended 2026-10-05 (was `…|new-level`); **SCHEMA REVIEW REQUIRED: db-architect**.
- `lesson_sources(lesson_id, document_url, content_hash_at_authoring)`. Links lessons to what they cite; drives `stale`.

`level_announcements` (already in the build prompt) gets `change_id → kb_changes` so a banner traces back to its source change.

None of these tables are user-owned, so the cascade-from-users rule doesn't apply. `mentor_messages` stays user-owned.

## Mentor grounding

Retrieval = vector search over `kb_chunks` **filtered to the documents in the current lesson's `lesson_sources`**. Never the whole KB, so the mentor can't drift outside the lesson. Top-k chunks go into a cached prompt prefix.

## AI and cost

- **Triage + drafting:** Claude via `scripts/sync-sources.ts` (model id in `lib/constants`). Only changed documents are triaged; only `update-level`, `fill-stub` and `frontier-chapter` are drafted (one draft = lesson + quick check + blog post). Budget cap per run (e.g. N drafts/day), and the run stops cleanly when it's hit.
- **Embeddings:** lean Voyage AI (Anthropic's recommended embeddings partner), 1024-dim. Only changed documents get re-embedded.
- Daily cost is bounded by the number of _changed_ pages, not the corpus size.

## Fairness and integrity check

No XP or grading. The integrity risk is **truth**: a drafted level that states something the source doesn't. Mitigations: the drafter only gets the source text; the `content-reviewer` agent and a human review every PR; `stale` flags catch drift after merge.

## Blog (added 2026-10-05)

| Item    | Rule                                                                                                                 |
| ------- | -------------------------------------------------------------------------------------------------------------------- |
| File    | `content/blog/<YYYY-MM-DD>-<slug>.mdx`. A file, not a DB row.                                                        |
| Made by | The same PR as its `fill-stub` or `frontier-chapter` draft. No separate blog job.                                    |
| Sources | The same `sources` as the lesson. Lesson and post cite the same document.                                            |
| Pages   | `/blog` (list) and `/blog/<slug>`. Static, public, indexed. RSS feed + sitemap entries.                              |
| Voice   | Plain technical product voice. No NPC lore (lore lives only in DialogBoxes). Short: a summary + a link to the level. |
| Review  | `content-reviewer` + `voice-guardian` + a human, same as the lesson. Never auto-published.                           |

## Licensing

We store documents for retrieval and change detection, not for republishing. Lessons paraphrase, cite and link. Each source's licence is recorded in `fetch_config`; anything with a restrictive licence is set to `link-only` (hash + metadata, no stored body).

## Phases

### Phase 1: Registry + fetch + store (no AI)

**Goal:** `bun run sync --dry-run` fetches every source, normalises it, hashes it and prints new/changed/unchanged.
**Files:** `content/sources.yaml`, `lib/kb/fetchers/*` (llms.txt, sitemap, github, rss), `db/schema/kb.ts`, migration, `scripts/sync-sources.ts`.
**Verification:** bun tests for normalise + hash stability; a dry run against the seed list.
**Approval gate:** the seed list and the schema are approved (db-architect).

### Phase 2: Chunks + embeddings + mentor retrieval API

**Goal:** `lib/kb/retrieve(lessonId, query)` returns grounded chunks.

### Phase 3: Triage + drafting + PRs

**Goal:** the daily Action triages each change into the four outcomes and opens one `new-level` PR per non-ignore change, with a `kb_changes` link. _(Amended 2026-10-05.)_
**Drafts:** `update-level` → the stale lesson files. `fill-stub` → the main-realm chapter folder + blog post. `frontier-chapter` → `content/frontier/<YYYY-MM-DD>-<slug>/` (lesson + `quick-check.json`, no challenge) + blog post. _(Devil pass: no outline file.)_
**Verification:** bun tests for the triage Zod schema; drafted files pass the lesson, quick-check and blog Zod schemas; a test checks each Frontier folder name matches `<YYYY-MM-DD>-<slug>` and holds a lesson MDX + `quick-check.json`; a run with budget 1 stops after one draft; with 5 open `new-level` PRs a run drafts nothing.
**Approval gate:** db-architect on the triage enum; `voice-guardian` on the drafting prompt and the Frontier name.

### Phase 4: Discovery + stale flags + NEW LEVEL banner

**Goal:** the weekly candidate queue, stale-lesson flags, and banners after merge. _(Amended 2026-10-05.)_ A banner fires for merged `fill-stub` and `frontier-chapter` PRs. A merged blog post shows on `/blog`, in RSS and in the sitemap on the next deploy (static pages, no job). Discovery still only writes candidates; a human promotes by PR.

---

## Acceptance criteria

- [ ] Re-running sync with no upstream change writes nothing and calls no model.
- [ ] A changed doc page produces exactly one `kb_changes` row and at most one PR.
- [ ] Every drafted MDX passes the Zod frontmatter schema and cites only documents in the KB.
- [ ] The mentor cannot retrieve chunks outside the current lesson's sources (test).
- [ ] Nothing is published without a merged PR.
- [ ] Every `fill-stub` / `frontier-chapter` PR contains a blog post that cites the same sources as its lesson.
- [ ] `fill-stub` only targets a chapter already in an outline; it never adds a main-realm chapter.

## Out of scope

- Social media, forums, general web crawling.
- Learner-facing search of the whole KB (maybe later).
- Auto-merge of any content.

## Open questions

1. **Embeddings provider:** lean Voyage AI. The alternative, OpenAI `text-embedding-3-small`, works too but adds a second vendor for a single job.
2. **Seed list:** which repos besides the ones above? (Harness repos you care about most.)
3. **Should step 3's schema include the KB tables now** (lean yes, so the seed script can load sources once)?
4. ~~**Frontier chapter folder**~~ Settled by the devil pass: `content/frontier/<YYYY-MM-DD>-<slug>/`, no outline file.
5. **One PR per change, not one per run** _(2026-10-05)_. Lean: per change. Why: a human can merge one and reject another. Other option: a daily batch PR; downside: one bad draft blocks the rest.

## Companion plans

- `docs/plans/curriculum-design-plan.md` (The Frontier realm rules, `FRONTIER` constants)
- `docs/plans/level-art-design-plan.md`
