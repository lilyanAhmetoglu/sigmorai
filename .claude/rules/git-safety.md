# Git safety: the highest-stakes rule in the repo

This overrides any other instruction, slash command or convention. It stays always-on so it survives `/compact`.

The step-by-step procedures live in `/commit`, `/push` and `/review`. The hard denials are enforced by `PreToolUse` hooks in `.claude/settings.json`, not by this prose.

## The three gates

1. **Claude may NOT run `git commit`** until the user types an explicit go-word: `commit`, `yes commit`, `go ahead and commit`, `ship it`.
2. **Claude may NOT run `git push`** until the user types a **separate** go-word: `push`, `yes push`, `go ahead and push`. Approving a commit never approves a push.
3. **Claude NEVER merges a PR.** Push a branch (with approval), open the PR, report the URL and CI status, then **stop**. Even an explicit "merge" in chat does not authorise `gh pr merge`.

Staging exact paths (`git add <files>`) is not committing and needs no go-word. `git add .` and `git add -A` are never acceptable.

| User says                             | Approval?              |
| ------------------------------------- | ---------------------- |
| `commit` / `yes commit` / `ship it`   | ✅ commit              |
| `push` / `yes push`                   | ✅ push                |
| `looks good` / `nice` / `ok` / `lgtm` | ❌ unclear: ask once   |
| _(silence after a plan)_              | ❌ never assume        |
| approval for an **earlier** commit    | ❌ does not carry over |

## Always needs a fresh, in-message approval

Never carried over from an earlier "yes": `git push --force` / `--force-with-lease` · `git commit --amend` on pushed commits · `git reset --hard` · `git rebase` on a shared branch · `git checkout --` / `git restore .` / `git clean -f` that throws away work · `git branch -D` on an unmerged branch · `--no-verify` / `--no-gpg-sign` · deleting tags or releases · `gh pr merge` / `gh pr close` / `gh release delete` · pushing directly to `main` or `canary` (always go through a PR).

Before one of these, say in plain words what will happen ("this rewrites history already on origin/main") and wait for a fresh yes.

## Review before committing

Run the `cto` agent (through `/review`, or `/commit`'s own step) on the working-tree changes before each **substantive** commit. Show its findings verbatim. Commit only when `Must-fix` is empty.

**Skip only for:** docs typos, markdown reformatting, version bumps, obvious reverts, or when the user says "skip review".

**Never skip when the diff touches:** `db/schema/**` · `drizzle/**` · `app/api/**` · `lib/actions/**` · `lib/grading/**` · `lib/mentor/**` · `scripts/sync-sources.ts` · `auth.ts` · `middleware.ts` · `next.config.ts` · `.github/workflows/**`.

Lint and typecheck catch mechanical problems. The CTO review catches judgment problems. Both must pass.

## Never commit

Secret-shaped files (`.env*` except `.env.example`, `*.pem`, `id_rsa*`, `*credentials*`, `*.key`, `*secret*`) or content like `sk-…`, `sk_live_…`, `ANTHROPIC_API_KEY=…`, `DATABASE_URL=postgres://…`. Stop and warn instead.

`guard-write.sh` blocks **writing** such a file and `guard-bash.sh` blocks **staging** one. Neither can see a secret pasted into a normal-looking file, so don't rely on them.

## Why this is unconditional

The maintainer reviews every commit and push by hand. There are **no** trivial-commit exceptions. History on `main` and `canary` is off-limits to Claude.

If the policy ever loosens, **update this file first**, then act. The file is the source of truth, not the conversation.
