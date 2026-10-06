---
description: Push the current branch to origin. Needs its own fresh approval; never auto-pushes after /commit.
---

You are helping the maintainer push the current branch to GitHub.

This needs a **separate explicit approval** from `/commit` (`@.claude/rules/git-safety.md`). Approving a commit does NOT approve a push.

## Procedure

### 1. Inspect push state (in parallel)

- `git status -sb`
- `git rev-parse --abbrev-ref HEAD`
- `git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null`
- `git log --oneline @{u}..HEAD 2>/dev/null || git log --oneline canary..HEAD`
- `git remote -v` (a new repo may have no remote yet; if so, stop and say so)

### 2. Safety checks

- **Not on `main` or `canary`.** If so, refuse. Everything goes through a PR.
- **No uncommitted changes.** If there are, tell the user to `/commit` first.
- **No secret files in the commits.** Check `git diff --name-only @{u}..HEAD 2>/dev/null || git diff --name-only canary..HEAD` against `.env*` (not `.env.example`), `*.pem`, `id_rsa*`, `*credentials*`, `*.key`, `*secret*`.
- **Checks green on this branch:** `bun run typecheck`, `bun run lint`, `bun test`, `bun run build`. If any wasn't run since the last commit, run it now.
- **Mentor or docs-sync drafter touched?** Confirm `bun run eval` is green on this branch (`.claude/rules/scoped/mentor-eval.md`).

### 3. Present the plan

```
Push plan for `<branch>` → origin

Upstream: <tracking branch or "none; will set with -u">
Commits to push (N):
  <SHA> <subject>

Files changing on remote (M):
  - path/to/file

Push? Reply `push` to proceed, or `cancel`.
```

Wait for `push`, `yes push` or `go ahead and push`.

### 4. Push (on approval only)

- No upstream: `git push -u origin <branch>`
- Upstream set: `git push`
- **Never** `--force` or `--force-with-lease` from this command.

### 5. After

- Branch pushed and remote URL
- Existing PR URL (`gh pr view --json url`), if any
- The Vercel preview deploy for the branch appears on the PR once it exists
- Next step: open a PR with `gh pr create --base canary` if none exists. Ask first. Merging follows git-safety.md rule 3 (green, reviewed PRs into canary only).

## Don'ts

- No push without the explicit go-word.
- Never push to `main` or `canary` directly.
- Don't auto-create a PR. Merge only per git-safety.md rule 3.
- Don't push tags from here. semantic-release owns tags.
