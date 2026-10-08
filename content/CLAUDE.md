# content/: lessons, cases, quick checks

> Loads automatically when Claude opens a file under `content/`.

Layout: `content/<track>/<realm>/<chapter>/lesson.mdx` (exactly that name; a boss folder is `boss/`) plus `quick-check.json` and `case.json` (every track). Sources list: `content/sources.yaml`.

- Math Tower floors: `content/math/f<n>/` with `lesson.mdx` + `quick-check.json`.
- Frontier chapters: `content/frontier/<YYYY-MM-DD>-<slug>/` with the lesson MDX + `quick-check.json`. No case, no outline file, no NPC.
- Blog posts: `content/blog/<YYYY-MM-DD>-<slug>.mdx`. The date and slug come from the file name; the page is `/blog/<slug>`, so a slug is used once. Frontmatter is `title, description, lesson` (a live `…/lesson` id). No `sources`: a post cites via `lesson:`, and its page lists that lesson's sources. Body: plain Markdown, plain product voice, no `<DialogBox>`. Answer the title's question on the page in about 1,000 words or less, with a worked example and a checklist, and end with one line that points to the lesson. Every claim must be in the linked lesson or a page it cites. Never reuse the lesson's graded case scenario. **Every new post needs its own cover** (`cover: /blog/covers/<slug>.webp` in the frontmatter, file in `public/blog/covers/`): one new one-shot pixel-art image generated for that post (brand palette, 16:9, no text), saved as WebP under 300 KB. Never reuse another post's cover and never build one from the realm layers (`content:check` fails on a missing, shared or misnamed cover). The same goes for any new realm art: generate it fresh, don't reuse old images. `cover` is required and must be `/blog/covers/<slug>.webp`.

## Exercise ids

Every exercise has one id. Helpers: `lib/content/ids.ts` (`buildExerciseId`, `parseExerciseId`); Zod: `ExerciseIdSchema` in `lib/types`.

| Area             | Id                                                     |
| ---------------- | ------------------------------------------------------ |
| Realm chapter    | `builder/r0/c1/lesson` · `challenge` · `quick-check`   |
| Realm boss       | `strategist/r3/boss/challenge`                         |
| Math Tower floor | `math/f1/lesson` · `quick-check`                       |
| Frontier level   | `frontier/2026-10-05-some-slug/lesson` · `quick-check` |

Realms and chapters:

- `r0`–`r8` are the core realms. Every path has them.
- A specialist realm (`r9` and up) belongs to one path. Its `REALMS` row in `lib/constants/curriculum.ts` has `track: '<owner>'`.
- Its id parses only on that path: `creator/r9/…`, never `builder/r9/…`.
- Realm numbers are global. Never reuse or renumber one.
- A path's `outline.json` is its realm list and map order: every core realm once, in order, plus all of its own specialist realms and no others.
- Chapters run `c1`–`cN`. N is that realm's chapter count in the path's outline (6 to 12). A chapter past 6 needs all three files.
- A realm never shrinks: removing a chapter orphans progress.
- A new specialist realm ships with `scene: false` (a flat `neutral` scene) until its own art PR.
- Floors are `f1`–`f8`. Slugs are lowercase kebab-case.

**Ids are forever.** They are stored in `progress`, `submissions` and `xp_events`. Renaming one loses players' progress and lets them earn the XP again. Fix a title, never an id.

## Rules

- **Frontmatter is Zod-validated** (schemas in `lib/types/`): `id, title, minutes, sources[{kind:'docs'|'repo'|'blog', title, url}]` (`blog` = an official vendor engineering post only). No `sourceHash`: page hashes live on the `docs-watch` branch (SIG-23). Blog posts: `title, description, lesson, cover` (`BlogFrontmatterSchema`). A file that fails the schema fails the build.
- **Every claim traces to a source in `sources`.** If you can't cite it, cut it. API shapes are checked against the live doc, not memory.
- **Lesson prose is plain technical voice.** Lore lines only in `<DialogBox>` blocks, said by the realm's NPC.
- **Lesson template (every chapter lesson, maintainer 2026-10-08).** Sections in this order, as `##`: **Goal** ("After this lesson you can:" + 2–3 concrete skills) · **The problem** (a short realistic scenario the lesson solves) · **The idea** (the concept in plain words, sources as short inline links, not "X says / Y says" in every line; one small comparison allowed, no RPG flavour; a tiny text diagram in a code block only if it helps) · **Worked example** (step by step, before → after, full prompt or setup in code blocks, mark the hard case, say why it is better) · **Common mistakes** (2–3 traps, one-line fix each) · **Try it** (opens with "Not graded."; a small exercise, then `### Answer`) · **Recap** (3 key points). Rules: attribute to "the <vendor> docs", never to the model ("the Claude docs say", not "Claude says"); keep one short verbatim quote for every number, default or always/never claim; Common mistakes and Try it teach the pattern without restating the chapter's case scenario or option text; no hand-written "Next:" line (the quest page shows the next step); `minutes` stays honest (usually 8–12). Pilot: `builder/r1/c2`. Strategist and creator lessons keep their own path voice inside the same sections.
- **Lesson body rules** (the page renders it with `lib/content/mdx.tsx`): start at `##` (the page shows the title as the h1; no `# ` heading); the only component is `<DialogBox>…</DialogBox>` (no `speaker`: it is always the realm's NPC); no `import` / `export`; no `{…}` expressions (show code in a code span or block); no `<script>`, `<style>` or `<iframe>`. `bun run content:check` compiles every body and fails on any of these.
- **`case.json` (every track):** 3–5 questions; each case question has exactly 4 options, one correct (exam style); an explanation for every option. Optional `exhibit` (string, shown read-only in monospace): a trace, a tool schema, a prompt, a config. The exercise id keeps the segment `challenge` (the graded case); the UI says Case. No code task.
- **Options in a question must be a similar length.** `bun run content:check` fails when the correct option is clearly the longest (more than 15% and 8+ characters over the next one).
- **Options in a question share the same sentence shape.** `bun run content:check` fails when only the correct option ends with a period or has two sentences.
- **Boss case** (`<track>/<realm>/boss/case.json`, id `<track>/r<N>/boss/challenge`): same schema and rules as a chapter case, but exactly 5 questions and one longer `exhibit` with labelled parts (`BRIEF:`, `TRACE:`, `BUDGET:` …). The title is the outline `boss.task` line, verbatim. Each question tests a different chapter of the realm, using only facts those chapters already cite. Pass is every question right.
- **Cite more than one vendor where the concept exists at more than one** (Claude, OpenAI, Gemini, open models). A lesson that reads like one vendor's tutorial fails review.
- **Docs first:** build from the official docs; keep only what matters. `sources` lists at least 2 official vendors where 2 document the concept, and Anthropic + OpenAI when both document it (REQUIRED); Google and MCP spec pages are optional. Third-party vendors (Adobe, Stability, ElevenLabs, Runway) are official for their own product, never the only vendor for a concept. Add a source id to `sources.yaml` only when a lesson cites it. Every url sits under a `trustTier: official` entry of `content/sources.yaml`. Community repos and community blogs are examples only. Official vendor engineering posts (e.g. pages under `anthropic.com/engineering` or `openai.com/index`) count as official pages; they are the primary source for harness engineering. A claim with no official page is a blocker.
- **`quick-check.json`:** the same question shape as `case.json` (`{id, questions[3]}`, no title/scenario), exactly 3 questions, 2–6 options each (see `docs/plans/curriculum-design-plan.md`).
- **Shared chapters** (`shared-chapters.json`: `same` pairs credit both ways, `covers` credits `deep` → the light one only; `content:check` checks the shape): before you add a pair, `content-reviewer` checks that (1) the two lessons teach the same facts, (2) each credited case can be answered from the crediting lesson, and (3) the realm boss question for that chapter on each credited track uses only facts the crediting lesson also teaches; if (3) fails, the pair is not shared. Remove a pair only to fix a wrong one, and say so in the PR (spec: `docs/plans/shared-chapters-design-plan.md`).
- **Never auto-publish.** The knowledge-sync routine opens a PR labelled `new-level`; run the `content-reviewer` agent on it.
- **Validate every change.** `bun run content:check` (schemas, runs in a hook and CI) and the `validate-content` skill (facts vs the cited pages). `/commit` and `/review` run `content-reviewer` when content or the curriculum changes.
