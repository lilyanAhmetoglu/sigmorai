# Hooks

Deterministic guardrails. A rule in markdown is a **request**; a hook is a **guarantee**. It fires whether Claude remembers or not, and costs no context.

## What's wired

| Hook                                 | Event                                 | Enforces                                                           |
| ------------------------------------ | ------------------------------------- | ------------------------------------------------------------------ |
| `guard-bash.sh`                      | `PreToolUse(Bash)`                    | git/gh safety and Bun-only (`git-safety.md`, `package-manager.md`) |
| `guard-write.sh`                     | `PreToolUse(Edit\|Write\|MultiEdit)`  | generated files, lockfiles, secret leaks                           |
| prettier (inline in `settings.json`) | `PostToolUse(Edit\|Write\|MultiEdit)` | formats every file Claude touches                                  |
| `lint-file.sh`                       | `PostToolUse(Edit\|Write\|MultiEdit)` | ESLints the one file Claude just touched (async)                   |
| `content-check.sh`                   | `PostToolUse(Edit\|Write\|MultiEdit)` | `bun run content:check` after a content or curriculum edit (async) |

### `guard-bash.sh` denies

`gh pr merge` / `gh pr close` / `gh release delete` · `git push --force` / `-f` · `git reset --hard` · `git clean -f` · `git commit --amend` · `--no-verify` / `--no-gpg-sign` · `git add .` / `-A` · staging a secret-shaped path (`.env*` except `.env.example`, `*.pem`, `*.key`, `*credentials*`, `*secret*`) · direct push to `main` or `canary` in any form (`HEAD:main`, `+main`) · `npm` / `pnpm` / `yarn` / `npx` (no exceptions in this repo).

A segment must **start** with the binary to count, and heredoc bodies are dropped as data. So a commit message that names a blocked command is fine, while `echo hi && git add .` still trips.

### `guard-write.sh` denies

Writes to generated `.next/`, `next-env.d.ts` or `drizzle/meta/` · `bun.lock` (run `bun install`) and foreign lockfiles · secret-shaped paths (`.env.example` allowed) · live-looking keys (`sk-…`, `sk-ant-…`, `sk_live_…`, `pk_live_…`, `rk_live_…`, `whsec_…`, `e2b_…`, `ghp_…`, `github_pat_…`, `vercel_blob_rw_…`, `npg_…`) · `NEXT_PUBLIC_` in front of a server secret (Anthropic, OpenAI, E2B, Judge0, database URL, Auth.js/OAuth secrets, Resend, Blob token, GitHub, webhooks).

### `lint-file.sh`

Runs in the background (`asyncRewake: true`) and only wakes Claude on a real lint error. Skips `.next/` and `drizzle/` output, non-JS/TS files, deleted files, files outside the repo, and a broken ESLint install.

### `content-check.sh`

Runs `bun run content:check` (Zod loaders over every file in `content/`, no model, no network) when Claude edits `content/**`, `lib/constants/curriculum.ts`, `lib/constants/content.ts`, `lib/types/content.ts` or `lib/types/curriculum.ts`. Async like `lint-file.sh`: it wakes Claude only on a real schema problem. It checks shape, not facts. Facts are the `content-reviewer` agent's job, run by `/commit` and `/review` (`.claude/skills/validate-content/`).

## Contract: two kinds, don't mix them up

**`PreToolUse` guards** read JSON on stdin and write a `permissionDecision` JSON to stdout. **They always exit 0.** The denial rides in the JSON, so a malformed payload can never wedge a session. Every deny names the escape hatch: the maintainer types `! <command>` to run it in their own shell.

**`lint-file.sh`** and **`content-check.sh`** run after the write, so the exit code is the only channel: `0` = clean/skipped/toolchain broken (silent), `2` = real lint errors (stdout goes to Claude).

## Tests: run after ANY hook change

```bash
bash .claude/hooks/__tests__/guard.test.sh
```

Every rule has a should-fire and a should-skip case. The last case writes a throwaway file with a deliberate lint error into `app/`, removed by an `EXIT` trap and gitignored.

## Kill switch

If a hook misfires, add to `.claude/settings.local.json`:

```json
{ "disableAllHooks": true }
```

Then fix the script and remove the flag. Don't rephrase a command to dodge a hook. If the rule is wrong, change the rule.

## Adding one

1. Write the script. Guards always exit 0 and deny via JSON.
2. Add a should-deny and a should-allow case to the test file.
3. Run the tests.
4. Register it in `.claude/settings.json`.
5. Trim the matching prose in `.claude/rules/` to a one-line reason.
