---
name: validate-content
description: Validate Sigmorai content and curriculum data — lesson MDX, case.json, quick-check.json, outline.json, lib/constants/curriculum.ts, blog posts. Runs the deterministic schema check (`bun run content:check`), then checks every factual claim in each changed file against the live cited page (WebFetch) and marks it supported / not supported / not found, with the quote and URL. Use whenever content or curriculum files are created or changed, before commit, and on any content PR. The content-reviewer agent follows these steps.
---

# Skill: validate-content

Two layers. The first is cheap and certain. The second costs model tokens and checks truth.

**A wrong fact in a lesson is the worst bug this product can ship.** Learners trust it.

## Which files count

| Path                                              | What it is                    |
| ------------------------------------------------- | ----------------------------- |
| `content/<track>/<realm>/<cN or boss>/lesson.mdx` | lesson (frontmatter + prose)  |
| `content/**/case.json`                            | graded case, every track      |
| `content/**/quick-check.json`                     | quick check                   |
| `content/<track or math>/outline.json`            | curriculum outline            |
| `lib/constants/curriculum.ts`                     | realm names, NPCs, tiers      |
| `content/frontier/<date>-<slug>/`                 | Frontier lesson + quick check |
| `content/blog/<date>-<slug>.mdx`                  | blog post                     |
| `content/sources.yaml`                            | the allowed source list       |

There are no code challenges. A `challenge.json`, hidden tests or starter code anywhere in `content/` is a blocker (no-code pivot, 2026-10-05).

## Step 1: the deterministic check (always)

```bash
bun run content:check
```

It loads every file under `content/` with the app's own Zod loaders (`lib/content/validate.ts`): schemas, ids that match their path, 3–5 case questions with exactly 4 options and one correct, quick checks with 3 questions, outlines, stray or misnamed files, and lesson source URLs under a `trustTier: official` entry of `content/sources.yaml`.

Red → stop. Report the errors. Facts don't matter yet if the file can't load.

## Step 2: list the changed files

```bash
git diff --name-only canary...HEAD; git diff --name-only; git diff --name-only --staged
```

On a PR: `gh pr diff <n> --name-only`. Keep only the paths in the table above. **Check only these files.** Unchanged files are not re-checked (cost).

## Step 3: fact-check each changed file

For each file:

1. **Find the sources.** Lesson: frontmatter `sources`. Case or quick check: the sources named in the scenario, or else the same chapter's `lesson.mdx` sources. Outline or curriculum line: the chapter's lesson sources if any; a topic line with no lesson yet needs no source, but a stated fact still does. No source at all for a factual claim → **blocker: missing source**.
2. **List every factual claim**, one per line. A claim is anything a learner could act on: an API name, a parameter, a field (`input_tokens`), a model id, a default, a limit, a price shape, a behaviour ("the count is an estimate"). In a case, check the scenario, the exhibit, each **correct option** and **every explanation**.
3. **Fetch each cited page** with WebFetch. Ask the fetch prompt for the exact sentence that supports or contradicts the claim, quoted verbatim. Fetch each URL once per run and reuse the text for every claim from it. If a page redirects, follow it once.
4. **Mark each claim:**
   - **supported**: the page says it. Give the quote + URL.
   - **not supported**: the page says something different. Give the contradicting quote + URL. This is a **blocker**.
   - **not found**: the page doesn't mention it. Search the other cited pages first. Still nothing → **blocker** (a claim with no official page).
5. **Check the answer key.** In every case and quick-check question, the option marked `correct` must be the one the source supports, and no wrong option may also be true per the source. A wrong key is a **blocker**.

Never fill a gap from memory. If the page can't be fetched, mark it **not found (unreachable)** and say so.

## Step 4: the rule checks (read, no fetch)

- `sources` has at least 1 Anthropic page and 1 OpenAI page when both document the concept. Missing one is a **blocker**. Google and MCP spec pages are optional.
- **No hype.** No "revolutionary", "supercharge", "10x", "magic", "game-changing" or other marketing praise. State what a thing does.
- **Vendor-neutral prose.** A lesson that reads like one vendor's tutorial, or names one vendor's feature as THE way, is a warning.
- NPC/story lines only inside `<DialogBox>` blocks; everything else is plain technical voice. Unsure → flag for `voice-guardian`.
- Wrong-option explanations say **why** it is wrong, not just "incorrect".
- No trick questions that hinge on wording.
- Ids never change (`content/CLAUDE.md`). A renamed id is a blocker.
- Frontier folder: lesson + quick check only. A `case.json` there is a blocker.
- Blog post: plain product voice, no `<DialogBox>`. It cites via `lesson:` (no `sources` of its own): every claim must be in that lesson and its cited pages.

## Step 5: one short report per file

```
### <path>
VERDICT: ok | fix before merge
| # | Claim | Mark | Evidence |
| 1 | input and output tokens have separate prices | supported | "…quote…" — <url> |
| 2 | token counting is exact | not supported | "…the count should be considered an estimate…" — <url> |
Blockers: <n> · Warnings: <n>
```

**Blockers:** a false fact (not supported), a missing source, a missing Anthropic or OpenAI page when both document the concept, a wrong correct answer, an explanation that contradicts the source, a schema error from step 1. **Warnings:** weak explanations, voice (hype, one-vendor prose).

Report only. Never edit the content. Never merge.

## Cost

Only changed files, each URL fetched once per run. WebFetch caches a page for 15 minutes, so there is no cache across runs: a re-run fetches again.
