---
description: Diff the working tree against canary, run the CTO review, draft conventional commits per coherent change, get approval, then apply. Never pushes.
---

You are helping the maintainer create one or more **conventional commits** for the current working-tree changes.

Base branch is `canary`. Never auto-commit. Present the plan and wait for explicit approval per `@.claude/rules/git-safety.md`.

## Procedure

### 1. Inspect the diff

Run in parallel:

- `git fetch --quiet 2>/dev/null || true`
- `git status -sb`
- `git diff`
- `git diff --staged`
- `git diff canary...HEAD 2>/dev/null` (committed but not yet on canary; skip if there is no `canary` yet)

If the tree is clean and nothing is unmerged, say so and stop.

### 2. Run the checks and the review first

Before drafting, make sure these are green (run them if they weren't run since the last edit):

- `bun run typecheck`
- `bun run lint`
- `bun test`
- `bun run build`

A red check → STOP and show the error. Don't commit around it.

For substantive commits (anything beyond docs typos, formatting, version bumps, reverts), spawn the `cto` subagent on the changes **before** drafting the plan.

- Agent tool, `subagent_type: cto`
- Show its findings verbatim, with a short A2 summary first
- `Must-fix` not empty → STOP. Ask: fix first, or override?
- `Must-fix` empty (or the user overrides) → step 3

If the diff touches NPC/story copy, the mentor system prompt (`lib/mentor/**`, `prompts/**`) or generated lesson content (`content/**`), also spawn `voice-guardian` and treat its `must-change` like `Must-fix`.

If the diff touches the mentor or the docs-sync drafter (`.claude/rules/scoped/mentor-eval.md`), confirm `bun run eval` was green on this branch. If not, say so before committing.

Skip review only for genuinely trivial changes, or when the user says "skip review". **Never skip** when the diff touches: `db/schema/**` · `drizzle/**` · `app/api/**` · `lib/actions/**` · `lib/grading/**` · `lib/runner/**` · `lib/mentor/**` · `scripts/sync-sources.ts` · `auth.ts` · `middleware.ts` · `.github/workflows/**` · `next.config.ts`.

### 3. Group changes by intent

One conventional commit per coherent piece of work.

- A route plus its components and server action for one feature → one `feat(<scope>):`
- A Drizzle schema change plus its generated migration → its own commit (easy to revert)
- Grading / runner / XP logic → its own commit (easy to bisect scoring bugs)
- Mentor prompt changes → their own commit (easy to bisect behaviour)
- New or changed lesson content (`content/**`) → its own `feat(content):` commit
- Sprite, level SVG or art changes → their own commit
- Doc or spec updates → separate `docs:` commit
- Formatting or typo drive-bys → separate `chore:` / `style:`
- A preparatory refactor → separate `refactor:` before the `feat:`

If a refactor is tangled into a feature, warn and ask whether to combine or split.

### 4. Draft commits

Conventional Commits, enforced by commitlint (`commitlint.config.js`):

- **Types**: `feat | fix | chore | docs | refactor | perf | test | build | ci | style`
- **Scopes (enforced)**: `ui`, `map`, `quest`, `mentor`, `content`, `sync`, `auth`, `db`, `xp`, `math`, `ci`, `deps`, `harness`
- **Subject**: imperative, lowercase, no trailing period, ≤72 chars
- **Body**: the WHY when it isn't obvious. Reference specs (`per quest-design-plan.md amendment 2026-10-04`).
- **Breaking**: `feat!:` or a `BREAKING CHANGE:` footer. semantic-release turns this into a major version.

End-of-body reminders when relevant:

- `db/schema/**` or `drizzle/**` → `→ apply: bun run db:migrate` (CI also migrates Neon on merge to main)
- A new env var → `→ set it in Vercel (preview + production) and document it in .env.example`
- `content/**` → `→ run bun run seed locally to see it; announcements land after merge`

### 5. Present the plan

```
Plan: N commits on `<branch>` (against canary)

[1/N] <conventional subject>
  Body:
    <wrapped body>
  Files (M):
    - path/to/file
  Reminder after commit: <none | db:migrate | Vercel env var | seed>

Apply these commits? Reply `commit` to proceed, `edit N` to revise commit N, or `cancel`.
```

Wait for the explicit go-word (`commit`, `yes commit`, `go ahead`, `ship it`). "looks good" is not approval. Ask once.

### 6. Apply (on approval only)

For each commit, in order:

- Stage exactly its files: `git add <file1> <file2>`. **Never** `git add .` or `-A`.
- Refuse to stage `.env*` (except `.env.example`), `*.pem`, `id_rsa*`, `*credentials*`, `*.key`, `*secret*`, or files containing key-shaped strings. Halt and warn.
- Commit with a HEREDOC:

  ```bash
  git commit -m "$(cat <<'EOF'
  <subject>

  <body>

  <the Co-Authored-By / Claude-Session trailer the harness gives you>
  EOF
  )"
  ```

  Use the trailer lines exactly as the harness supplies them. Don't hardcode a model name here.

- If husky (lint-staged or commitlint) fails: show the exact error, fix the cause, re-stage, make a NEW commit. Never `--amend`, never `--no-verify`.

Then `git status` to confirm a clean tree.

### 7. After the commits

- N commits, new `HEAD` SHA
- Reminders the user must act on
- Next step: `/push` (needs its own approval)
