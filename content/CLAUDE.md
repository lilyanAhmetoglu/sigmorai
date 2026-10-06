# content/: lessons, cases, quick checks

> Loads automatically when Claude opens a file under `content/`.

Layout: `content/<track>/<realm>/<chapter>/lesson.mdx` (exactly that name; a boss folder is `boss/`) plus `quick-check.json` and `case.json` (every track). Sources list: `content/sources.yaml`.

- Math Tower floors: `content/math/f<n>/` with `lesson.mdx` + `quick-check.json`.
- Frontier chapters: `content/frontier/<YYYY-MM-DD>-<slug>/` with the lesson MDX + `quick-check.json`. No case, no outline file, no NPC.
- Blog posts: `content/blog/<YYYY-MM-DD>-<slug>.mdx`. The date and slug come from the file name; the page is `/blog/<slug>`, so a slug is used once. Frontmatter is `title, description, lesson` (a live `…/lesson` id). No `sources`: a post cites via `lesson:`, and its page lists that lesson's sources. Body: plain Markdown, plain product voice, **no `<DialogBox>`** (no lore on the blog). Short: a summary + why it matters. Every claim must be in the linked lesson.

## Exercise ids

Every exercise has one id. Helpers: `lib/content/ids.ts` (`buildExerciseId`, `parseExerciseId`); Zod: `ExerciseIdSchema` in `lib/types`.

| Area             | Id                                                     |
| ---------------- | ------------------------------------------------------ |
| Realm chapter    | `builder/r0/c1/lesson` · `challenge` · `quick-check`   |
| Realm boss       | `strategist/r3/boss/challenge`                         |
| Math Tower floor | `math/f1/lesson` · `quick-check`                       |
| Frontier level   | `frontier/2026-10-05-some-slug/lesson` · `quick-check` |

Realms `r0`–`r8`, chapters `c1`–`c6`, floors `f1`–`f8` (counts in `lib/constants/exercises.ts`). Slugs are lowercase kebab-case.

**Ids are forever.** They are stored in `progress`, `submissions` and `xp_events`. Renaming one loses players' progress and lets them earn the XP again. Fix a title, never an id.

## Rules

- **Frontmatter is Zod-validated** (schemas in `lib/types/`): `id, title, minutes, sources[{kind:'docs'|'repo'|'blog', title, url}]` (`blog` = an official vendor engineering post only). No `sourceHash`: page hashes live on the `docs-watch` branch (SIG-23). Blog posts: `title, description, lesson` (`BlogFrontmatterSchema`). A file that fails the schema fails the build.
- **Every claim traces to a source in `sources`.** If you can't cite it, cut it. API shapes are checked against the live doc, not memory.
- **Lesson prose is plain technical voice.** Lore lines only in `<DialogBox>` blocks, said by the realm's NPC.
- **Lesson body rules** (the page renders it with `lib/content/mdx.tsx`): start at `##` (the page shows the title as the h1; no `# ` heading); the only component is `<DialogBox>…</DialogBox>` (no `speaker`: it is always the realm's NPC); no `import` / `export`; no `{…}` expressions (show code in a code span or block); no `<script>`, `<style>` or `<iframe>`. `bun run content:check` compiles every body and fails on any of these.
- **`case.json` (every track):** 3–5 questions; each case question has exactly 4 options, one correct (exam style); an explanation for every option. Optional `exhibit` (string, shown read-only in monospace): a trace, a tool schema, a prompt, a config. The exercise id keeps the segment `challenge` (the graded case); the UI says Case. No code task.
- **Cite more than one vendor where the concept exists at more than one** (Claude, OpenAI, Gemini, open models). A lesson that reads like one vendor's tutorial fails review.
- **Docs first:** build from the official docs; keep only what matters. `sources` lists at least 2 official vendors where 2 document the concept, and Anthropic + OpenAI when both document it (REQUIRED); Google and MCP spec pages are optional. Third-party vendors (Adobe, Stability, ElevenLabs, Runway) are official for their own product, never the only vendor for a concept. Add a source id to `sources.yaml` only when a lesson cites it. Every url sits under a `trustTier: official` entry of `content/sources.yaml`. Community repos and community blogs are examples only. Official vendor engineering posts (e.g. pages under `anthropic.com/engineering` or `openai.com/index`) count as official pages; they are the primary source for harness engineering. A claim with no official page is a blocker.
- **`quick-check.json`:** the same question shape as `case.json` (`{id, questions[3]}`, no title/scenario), exactly 3 questions, 2–6 options each (see `docs/plans/curriculum-design-plan.md`).
- **Never auto-publish.** The knowledge-sync routine opens a PR labelled `new-level`; run the `content-reviewer` agent on it.
- **Validate every change.** `bun run content:check` (schemas, runs in a hook and CI) and the `validate-content` skill (facts vs the cited pages). `/commit` and `/review` run `content-reviewer` when content or the curriculum changes.
