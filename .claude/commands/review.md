---
description: CTO-level review of the current branch against canary. Delegates to the cto subagent.
---

Review the current branch's changes against `canary` and give a structured, opinionated review.

## Procedure

### 1. Confirm base

```bash
git rev-parse --verify canary 2>&1
```

If `canary` is missing locally, use `origin/canary` and say so. On a brand-new repo with no commits yet, review the working tree only.

### 2. Gather change context (in parallel)

- `git status -sb`
- `git diff canary...HEAD`
- `git diff`
- `git diff --staged`
- `git diff --name-only canary...HEAD` plus uncommitted files

If there is nothing to review, say "no changes to review" and stop.

### 3. Spawn the `cto` subagent

Agent tool, `subagent_type: cto`, with:

```
Review the changes on branch <branch> against base branch canary.

Changed files (<count>), grouped by area:
<app/ (routes), app/api, components/, components/scenes (canvas), lib/actions, lib/grading, lib/mentor, lib/xp, db/schema, drizzle/, content/, scripts/, public/, .github, docs>

Diff:
<the diff; truncate per file to ~200 lines if huge; prioritise db/schema + drizzle, app/api, lib/actions, lib/grading, lib/mentor, auth.ts, middleware.ts, scripts/sync-sources.ts>

Apply your checklist:
- Spec alignment (which docs/plans/<feature>-design-plan.md does this touch?)
- ENGINEERING.md architecture rules and DESIGN.md rules (tokens only, zero radius, hard shadows, Atkinson for reading text)
- AGENTS.md "rules that are easy to break"
- Server-only grading and XP: no client-trusted score, every server action re-validates with Zod and auth()
- Correct answers never reach the client before submit
- .claude/rules/ (git-safety, package-manager) and scoped rules
- Build-order scope (ENGINEERING.md → Build order)
```

### 4. Present

Show the review **verbatim**, with a short A2-English summary above it. Don't shrink the review itself; the structure is the point.

### 5. Offer to act

Ask: _"Want help fixing any of these?"_ Work on the items the user picks. Don't auto-fix.

## Don'ts

- Don't commit, push or edit files in this command. It is read-only.
- Don't skip the subagent and review it yourself.
- Don't review against `main` unless asked. Default base is `canary`.
