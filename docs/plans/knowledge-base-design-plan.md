# Sigmorai — Knowledge base and docs sync

> One database of the latest AI-engineering knowledge (official docs, changelogs, cookbooks, high-star repos). It feeds three things: new levels (as PRs), lesson freshness checks, and the mentor's grounding. Read end-to-end before any code; each phase is gated by explicit approval.

## Status

**STATUS: Ready for devil + db-architect review (frontier + blog amendment added 2026-10-05). Build step: 8 (schema pulled into step 3). Track: both.**

## Amendments

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

| Kind        | How it's fetched                                                          | Examples (seed list, verify URLs in phase 1)                                                                                                                                                                                                                    |
| ----------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs`      | `llms.txt` / `llms-full.txt` when present, else `sitemap.xml`, then pages | Claude docs (docs.claude.com), Claude Code docs, OpenAI platform docs, MCP spec (modelcontextprotocol.io). **Added 2026-10-05, verify URL in phase 1:** Google Gemini API docs, Mistral docs, Hugging Face docs, LangChain / LangGraph docs, Vercel AI SDK docs |
| `changelog` | RSS/Atom or the changelog page                                            | Anthropic release notes, OpenAI changelog, Claude Code `CHANGELOG.md`                                                                                                                                                                                           |
| `repo`      | GitHub API: README, `docs/**`, `examples/**`, latest releases             | anthropics/claude-cookbooks, anthropics/claude-code, walkinglabs/learn-harness-engineering, openai/openai-agents-python, modelcontextprotocol/servers, vercel/ai, pydantic/pydantic-ai, langchain-ai/langgraph, huggingface/smolagents                          |
| `blog`      | RSS of **official engineering blogs only**                                | Anthropic engineering posts, OpenAI cookbook articles                                                                                                                                                                                                           |

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
| `frontier-chapter` | A new topic with no main-realm slot                        | a Frontier chapter (lesson + quick check, builder challenge optional) + its `outline.json` entry; blog post  |

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
**Drafts:** `update-level` → the stale lesson files. `fill-stub` → the main-realm chapter folder + blog post. `frontier-chapter` → the Frontier chapter folder + its `content/frontier/outline.json` entry + blog post.
**Verification:** bun tests for the triage Zod schema; drafted files pass the lesson, quick-check, Frontier outline and blog Zod schemas; a run with budget 1 stops after one draft.
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
4. **Frontier chapter folder** _(2026-10-05)_. Lean: `content/frontier/<slug>/` (lesson MDX + `quick-check.json`, optional `challenge.json`). Why: a slug is stable; a number would shift as the list grows. Other option: date-prefixed folders; downside: the date is already in the outline.
5. **One PR per change, not one per run** _(2026-10-05)_. Lean: per change. Why: a human can merge one and reject another. Other option: a daily batch PR; downside: one bad draft blocks the rest.

## Companion plans

- `docs/plans/curriculum-design-plan.md` (The Frontier realm rules, `FRONTIER` constants)
- `docs/plans/level-art-design-plan.md`
