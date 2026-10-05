# content/: lessons, challenges, cases

> Loads automatically when Claude opens a file under `content/`.

Layout: `content/<track>/<realm>/<chapter>/*.mdx` plus `challenge.json` (builder) or `case.json` (strategist). Sources list: `content/sources.yaml`.

- Frontier chapters: `content/frontier/<YYYY-MM-DD>-<slug>/` with the lesson MDX + `quick-check.json`. No challenge, no outline file, no NPC.
- Blog posts: `content/blog/<YYYY-MM-DD>-<slug>.mdx`, same date-slug and same `sources` as their lesson. Plain product voice.

## Rules

- **Frontmatter is Zod-validated** (`lib/content/schema.ts`): `id, title, minutes, sources[{kind:'docs'|'repo', title, url}], sourceHash`. A file that fails the schema fails the build.
- **Every claim traces to a source in `sources`.** If you can't cite it, cut it. API shapes are checked against the live doc, not memory.
- **Lesson prose is plain technical voice.** Lore lines only in `<DialogBox>` blocks, said by the realm's NPC.
- **`challenge.json`:** starter code must fail the visible tests; the reference solution (kept out of the client) must pass visible + hidden. Hidden tests test behaviour, not formatting.
- **`case.json`:** exactly one correct index per question, an explanation for every option.
- **`quick-check.json`:** the same shape as `case.json`, exactly 3 questions (see `docs/plans/curriculum-design-plan.md`).
- **Never auto-publish.** The sync job opens a PR labelled `new-level`; run the `content-reviewer` agent on it.
