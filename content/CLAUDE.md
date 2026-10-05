# content/: lessons, cases, quick checks

> Loads automatically when Claude opens a file under `content/`.

Layout: `content/<track>/<realm>/<chapter>/lesson.mdx` (exactly that name; a boss folder is `boss/`) plus `quick-check.json` and `case.json` (both tracks). Sources list: `content/sources.yaml`.

- Math Tower floors: `content/math/f<n>/` with `lesson.mdx` + `quick-check.json`.
- Frontier chapters: `content/frontier/<YYYY-MM-DD>-<slug>/` with the lesson MDX + `quick-check.json`. No case, no outline file, no NPC.
- Blog posts: `content/blog/<YYYY-MM-DD>-<slug>.mdx`, same date-slug and same `sources` as their lesson. Plain product voice.

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

- **Frontmatter is Zod-validated** (schemas in `lib/types/`): `id, title, minutes, sources[{kind:'docs'|'repo', title, url}], sourceHash`. `sourceHash` is optional until the docs-sync job writes it (step 8). A file that fails the schema fails the build.
- **Every claim traces to a source in `sources`.** If you can't cite it, cut it. API shapes are checked against the live doc, not memory.
- **Lesson prose is plain technical voice.** Lore lines only in `<DialogBox>` blocks, said by the realm's NPC.
- **`case.json` (both tracks):** 3–5 questions; each case question has exactly 4 options, one correct (exam style); an explanation for every option. Optional `exhibit` (string, shown read-only in monospace): a trace, a tool schema, a prompt, a config. The exercise id keeps the segment `challenge` (the graded case); the UI says Case. No code task.
- **Cite more than one vendor where the concept exists at more than one** (Claude, OpenAI, Gemini, open models). A lesson that reads like one vendor's tutorial fails review.
- **Docs first:** build from the official docs; keep only what matters. `sources` lists at least 1 Anthropic page and at least 1 OpenAI page where both document the concept (REQUIRED); Google and MCP spec pages are optional. Every url sits under a `trustTier: official` entry of `content/sources.yaml`. Community repos and community blogs are examples only. Official vendor engineering posts (e.g. `anthropic.com/engineering`, `openai.com/index/harness-engineering`) count as official pages; they are the primary source for harness engineering. A claim with no official page is a blocker.
- **`quick-check.json`:** the same question shape as `case.json` (`{id, questions[3]}`, no title/scenario), exactly 3 questions, 2–6 options each (see `docs/plans/curriculum-design-plan.md`).
- **Never auto-publish.** The sync job opens a PR labelled `new-level`; run the `content-reviewer` agent on it.
