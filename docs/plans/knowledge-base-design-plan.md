# Sigmorai — Knowledge base and docs sync

> One database of the latest AI-engineering knowledge (official docs, changelogs, cookbooks, high-star repos). It feeds three things: new levels (as PRs), lesson freshness checks, and the mentor's grounding. Read end-to-end before any code; each phase is gated by explicit approval.

## Status

**STATUS: Ready for devil + db-architect review. Build step: 8 (schema pulled into step 3). Track: both.**

## Amendments

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

| Kind        | How it's fetched                                                          | Examples (seed list, verify URLs in phase 1)                                                                                                                                                                                           |
| ----------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs`      | `llms.txt` / `llms-full.txt` when present, else `sitemap.xml`, then pages | Claude docs (docs.claude.com), Claude Code docs, OpenAI platform docs, MCP spec (modelcontextprotocol.io)                                                                                                                              |
| `changelog` | RSS/Atom or the changelog page                                            | Anthropic release notes, OpenAI changelog, Claude Code `CHANGELOG.md`                                                                                                                                                                  |
| `repo`      | GitHub API: README, `docs/**`, `examples/**`, latest releases             | anthropics/claude-cookbooks, anthropics/claude-code, walkinglabs/learn-harness-engineering, openai/openai-agents-python, modelcontextprotocol/servers, vercel/ai, pydantic/pydantic-ai, langchain-ai/langgraph, huggingface/smolagents |
| `blog`      | RSS of **official engineering blogs only**                                | Anthropic engineering posts, OpenAI cookbook articles                                                                                                                                                                                  |

**Discovery of new repos** (the "large starred repo" part): a weekly GitHub search (`topic:ai-agents OR topic:mcp OR topic:llm-evaluation`, `stars:>5000`, pushed in the last 90 days) writes to `kb_source_candidates`. A human promotes a candidate into `sources.yaml` by PR. Nothing is crawled just because it's popular.

**Not collected:** social media, forums, SEO tutorial sites, paywalled content. Trust is the product; the Hallucinant feeds on unvetted sources.

## Pipeline

```
sources.yaml ─▶ fetch (ETag/If-Modified-Since, rate-limited, robots.txt)
             ─▶ normalise to markdown ─▶ sha256 ─▶ unchanged? stop
             ─▶ kb_documents (new version) ─▶ chunk + embed ─▶ kb_chunks
             ─▶ kb_changes (diff vs previous version)
             ─▶ triage (Claude, structured output): ignore | update-level | new-level
             ─▶ new/update ─▶ draft MDX + challenge.json/case.json ─▶ PR labelled `new-level`
             ─▶ (after merge) level_announcements row ─▶ "NEW LEVEL" banner
```

Also: lessons whose cited document changed get a `stale` flag on the content dashboard, so an outdated lesson is never silently live.

Runs in GitHub Actions (daily cron for docs/changelogs/repos, weekly for discovery), writing to Neon with a dedicated, least-privilege DB role.

## Data model

Draft for **db-architect** review (SCHEMA REVIEW REQUIRED). Neon Postgres + `pgvector`.

- `kb_sources(id, kind, title, url, owner, trust_tier, enabled, fetch_config jsonb, last_checked_at, created_at)`
- `kb_source_candidates(id, repo_full_name unique, stars, topics text[], description, status: pending|promoted|rejected, seen_at)`
- `kb_documents(id, source_id → kb_sources, url, version int, title, content_md, content_hash, etag, last_modified, fetched_at)`. Unique `(url, version)`; partial unique "latest" index.
- `kb_chunks(id, document_id → kb_documents on delete cascade, ord, text, token_count, embedding vector(1024))`. HNSW index on `embedding`.
- `kb_changes(id, document_id, prev_document_id, change_kind: new|changed|removed, diff_summary, triage: pending|ignore|update-level|new-level, triage_reason, pr_url, detected_at)`
- `lesson_sources(lesson_id, document_url, content_hash_at_authoring)`. Links lessons to what they cite; drives `stale`.

`level_announcements` (already in the build prompt) gets `change_id → kb_changes` so a banner traces back to its source change.

None of these tables are user-owned, so the cascade-from-users rule doesn't apply. `mentor_messages` stays user-owned.

## Mentor grounding

Retrieval = vector search over `kb_chunks` **filtered to the documents in the current lesson's `lesson_sources`**. Never the whole KB, so the mentor can't drift outside the lesson. Top-k chunks go into a cached prompt prefix.

## AI and cost

- **Triage + drafting:** Claude via `scripts/sync-sources.ts` (model id in `lib/constants`). Only changed documents are triaged; only `new-level` / `update-level` are drafted. Budget cap per run (e.g. N drafts/day), and the run stops cleanly when it's hit.
- **Embeddings:** lean Voyage AI (Anthropic's recommended embeddings partner), 1024-dim. Only changed documents get re-embedded.
- Daily cost is bounded by the number of _changed_ pages, not the corpus size.

## Fairness and integrity check

No XP or grading. The integrity risk is **truth**: a drafted level that states something the source doesn't. Mitigations: the drafter only gets the source text; the `content-reviewer` agent and a human review every PR; `stale` flags catch drift after merge.

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

**Goal:** the daily Action opens `new-level` PRs with a drafted MDX + challenge/case, plus a `kb_changes` link.

### Phase 4: Discovery + stale flags + NEW LEVEL banner

**Goal:** the weekly candidate queue, stale-lesson flags, and banners after merge.

---

## Acceptance criteria

- [ ] Re-running sync with no upstream change writes nothing and calls no model.
- [ ] A changed doc page produces exactly one `kb_changes` row and at most one PR.
- [ ] Every drafted MDX passes the Zod frontmatter schema and cites only documents in the KB.
- [ ] The mentor cannot retrieve chunks outside the current lesson's sources (test).
- [ ] Nothing is published without a merged PR.

## Out of scope

- Social media, forums, general web crawling.
- Learner-facing search of the whole KB (maybe later).
- Auto-merge of any content.

## Open questions

1. **Embeddings provider:** lean Voyage AI. The alternative, OpenAI `text-embedding-3-small`, works too but adds a second vendor for a single job.
2. **Seed list:** which repos besides the ones above? (Harness repos you care about most.)
3. **Should step 3's schema include the KB tables now** (lean yes, so the seed script can load sources once)?

## Companion plans

- `docs/plans/level-art-design-plan.md`
