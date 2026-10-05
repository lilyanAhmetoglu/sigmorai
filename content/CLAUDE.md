# content/: lessons, challenges, cases

> Loads automatically when Claude opens a file under `content/`.

Layout: `content/<track>/<realm>/<chapter>/lesson.mdx` (exactly that name; a boss folder is `boss/`) plus `quick-check.json` and `challenge.json` (builder) or `case.json` (strategist). Sources list: `content/sources.yaml`.

- Math Tower floors: `content/math/f<n>/` with `lesson.mdx` + `quick-check.json`.
- Frontier chapters: `content/frontier/<YYYY-MM-DD>-<slug>/` with the lesson MDX + `quick-check.json`. No challenge, no outline file, no NPC.
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
- **`challenge.json`:** starter code must fail the visible tests; the reference solution (kept out of the client) must pass visible + hidden. Hidden tests test behaviour, not formatting.
- **`case.json`:** exactly one correct index per question, an explanation for every option.
- **`quick-check.json`:** the same question shape as `case.json` (`{id, questions[3]}`, no title/scenario), exactly 3 questions (see `docs/plans/curriculum-design-plan.md`).
- **Never auto-publish.** The sync job opens a PR labelled `new-level`; run the `content-reviewer` agent on it.
