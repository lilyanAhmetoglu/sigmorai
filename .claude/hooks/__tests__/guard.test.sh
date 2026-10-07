#!/usr/bin/env bash
# Unit tests for the hooks.
#
# Run:  bash .claude/hooks/__tests__/guard.test.sh
#
# The guards HARD BLOCK. A false positive stops legitimate work, so every rule
# needs both a should-deny and a should-allow case. Run this after touching any hook.
set -uo pipefail

HOOKS="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ROOT="$(cd "$HOOKS/../.." && pwd)"
export CLAUDE_PROJECT_DIR="$ROOT"
pass=0; fail=0

# assert <expect deny|allow> <script> <json payload> <label>
assert() {
  local expect="$1" script="$2" payload="$3" label="$4" out got
  out=$(printf '%s' "$payload" | bash "$HOOKS/$script" 2>/dev/null)
  # here-string, not `printf | grep -q`: under pipefail a SIGPIPE'd writer turned a
  # real deny into a false "allow" (the flaky 81/82). See guard-bash.sh.
  if grep -q '"permissionDecision": *"deny"' <<<"$out"; then got=deny; else got=allow; fi
  if [ "$got" = "$expect" ]; then
    pass=$((pass+1)); printf '  \033[32m✓\033[0m %s\n' "$label"
  else
    fail=$((fail+1)); printf '  \033[31m✗\033[0m %s \033[2m(expected %s, got %s)\033[0m\n' "$label" "$expect" "$got"
  fi
}

# Big values go in on STDIN (-Rs), never as `--arg`: Linux caps ONE argument at
# 128 KiB ("jq: Argument list too long"), which made the huge-payload cases send
# an empty payload on CI. Small values (the path) are fine as arguments.
bash_cmd() { printf '%s' "$1" | jq -Rs '{tool_name:"Bash",tool_input:{command:.}}'; }
write_file() { printf '%s' "${2-}" | jq -Rs --arg p "$1" '{tool_name:"Write",tool_input:{file_path:$p,content:.}}'; }

echo "guard-bash.sh — must DENY"
assert deny guard-bash.sh "$(bash_cmd 'gh pr close 12')"                      "gh pr close"
assert deny guard-bash.sh "$(bash_cmd 'gh pr close 12')"                      "gh pr close"
assert deny guard-bash.sh "$(bash_cmd 'gh release delete v1.0.0')"            "gh release delete"
assert deny guard-bash.sh "$(bash_cmd 'git push --force origin feat/x')"      "git push --force"
assert deny guard-bash.sh "$(bash_cmd 'git push -f')"                         "git push -f"
assert deny guard-bash.sh "$(bash_cmd 'git reset --hard HEAD~1')"             "git reset --hard"
assert deny guard-bash.sh "$(bash_cmd 'git clean -fd')"                       "git clean -fd"
assert deny guard-bash.sh "$(bash_cmd 'git commit --amend -m x')"             "git commit --amend"
assert deny guard-bash.sh "$(bash_cmd 'git commit --no-verify -m x')"         "git commit --no-verify"
assert deny guard-bash.sh "$(bash_cmd 'git add .')"                           "git add ."
assert deny guard-bash.sh "$(bash_cmd 'git add -A')"                          "git add -A"
assert deny guard-bash.sh "$(bash_cmd 'git push origin main')"                "push to main"
assert deny guard-bash.sh "$(bash_cmd 'git push origin canary')"              "push to canary"
assert deny guard-bash.sh "$(bash_cmd 'npm install lodash')"                  "npm install"
assert deny guard-bash.sh "$(bash_cmd 'pnpm add react')"                      "pnpm add"
assert deny guard-bash.sh "$(bash_cmd 'yarn install')"                        "yarn install"
assert deny guard-bash.sh "$(bash_cmd 'npx drizzle-kit generate')"         "npx drizzle-kit"
assert deny guard-bash.sh "$(bash_cmd 'cd sub && npm ci')"                    "npm ci (no exceptions here)"
assert deny guard-bash.sh "$(bash_cmd 'echo hi && git add .')"                "chained git add ."
# gh api writes that skip the git-safety gates (merge, close, ref writes).
assert deny guard-bash.sh "$(bash_cmd 'gh api -X PUT repos/o/r/pulls/7/merge')"            "gh api PUT merge"
assert deny guard-bash.sh "$(bash_cmd "gh api 'repos/o/r/pulls/7/merge' -f merge_method=squash")" "gh api merge path (POST)"
assert deny guard-bash.sh "$(bash_cmd 'gh api repos/o/r/merges -f base=canary -f head=x')" "gh api /merges"
assert deny guard-bash.sh "$(bash_cmd 'gh api --method PATCH repos/o/r/issues/3 -f title=x')" "gh api --method PATCH"
assert deny guard-bash.sh "$(bash_cmd 'gh api --method=DELETE repos/o/r/issues/3/labels/x')" "gh api --method=DELETE"
assert deny guard-bash.sh "$(bash_cmd 'gh api -X delete repos/o/r/git/refs/heads/x')"     "gh api -X delete (lower case)"
assert deny guard-bash.sh "$(bash_cmd 'gh api repos/o/r/issues/3 -f state=closed')"       "gh api -f state=closed"
assert deny guard-bash.sh "$(bash_cmd "gh api repos/o/r/pulls/7 -F 'state=closed'")"      "gh api -F 'state=closed'"
assert deny guard-bash.sh "$(bash_cmd 'gh api repos/o/r/git/refs -f ref=refs/heads/x -f sha=abc')" "gh api /git/refs"
assert deny guard-bash.sh "$(bash_cmd "gh api graphql -f query='mutation { mergePullRequest(input: {}) { clientMutationId } }'")" "gh api graphql merge mutation"
assert deny guard-bash.sh "$(bash_cmd 'echo hi && gh api -X PATCH repos/o/r/pulls/7 -f state=closed')" "chained gh api close"
assert deny guard-bash.sh "$(bash_cmd "gh api -H 'Accept: x' graphql -f query='mutation { mergePullRequest(input: {}) { clientMutationId } }'")" "gh api graphql mutation after -H"
assert deny guard-bash.sh "$(bash_cmd "gh api -X POST graphql -f query='mutation { closePullRequest(input: {}) { clientMutationId } }'")" "gh api -X POST graphql mutation"
assert deny guard-bash.sh "$(bash_cmd "gh api graphql -f query='mutation { mergeBranch(input: {}) { clientMutationId } }'")" "gh api graphql mergeBranch"
assert deny guard-bash.sh "$(bash_cmd 'gh api -X Patch repos/o/r/pulls/7 -f title=x')"   "gh api -X Patch (mixed case)"
assert deny guard-bash.sh "$(bash_cmd "gh api repos/o/r/issues/3 -f 'state'='closed'")"   "gh api quoted state key"
assert deny guard-bash.sh "$(bash_cmd 'gh issue close 5')"                                 "gh issue close"
assert deny guard-bash.sh "$(bash_cmd 'gh pr merge 12 --auto --merge')"                    "gh pr merge --auto"
assert deny guard-bash.sh "$(bash_cmd 'gh pr merge 12 --squash')"                          "gh pr merge --squash"
assert deny guard-bash.sh "$(bash_cmd 'gh pr merge 12 --rebase')"                          "gh pr merge --rebase"

echo "guard-bash.sh — must ALLOW"
assert allow guard-bash.sh "$(bash_cmd 'git add app/page.tsx lib/xp/level.ts')" "git add exact paths"
assert allow guard-bash.sh "$(bash_cmd 'git commit -m "feat(care): x"')"      "normal commit"
assert allow guard-bash.sh "$(bash_cmd 'git push -u origin feat/thing')"      "push feature branch"
assert allow guard-bash.sh "$(bash_cmd 'gh pr merge 12 --merge')"          "gh pr merge (git-safety rule 3)"
assert allow guard-bash.sh "$(bash_cmd 'gh pr merge 12 --merge --delete-branch')" "gh pr merge --merge --delete-branch"
assert allow guard-bash.sh "$(bash_cmd "gh api graphql -f query='query { viewer { login } }'")" "gh api graphql read query"
assert allow guard-bash.sh "$(bash_cmd 'gh api repos/o/r/commits/abc/status -q .statuses')" "gh api GET commit status (release loop)"
assert allow guard-bash.sh "$(bash_cmd 'gh api repos/o/r/deployments')"                    "gh api GET deployments"
assert allow guard-bash.sh "$(bash_cmd 'git status -sb')"                     "git status"
assert allow guard-bash.sh "$(bash_cmd 'git log --oneline -5')"               "git log"
assert allow guard-bash.sh "$(bash_cmd 'gh pr create --base main')"           "gh pr create"
assert allow guard-bash.sh "$(bash_cmd 'gh pr view 12 --json url')"           "gh pr view"
# gh api reads and POSTs the knowledge-sync skill needs.
assert allow guard-bash.sh "$(bash_cmd "gh api 'repos/o/r/issues?labels=docs-changed&state=open' --jq '.[] | select(.pull_request | not) | .number'")" "gh api GET issues with state=open in the query"
assert allow guard-bash.sh "$(bash_cmd 'gh api repos/o/r/issues?labels=new-level&state=open&per_page=100')" "gh api GET unquoted query"
assert allow guard-bash.sh "$(bash_cmd 'gh api repos/o/r/pulls/7 --jq .merged')"          "gh api GET a PR (reads .merged)"
assert allow guard-bash.sh "$(bash_cmd 'gh api repos/o/r/pulls -f base=canary -f head=content/knowledge-sync-2026-10-07-1 -f title=x -F body=@/tmp/b.md')" "gh api POST /pulls"
assert allow guard-bash.sh "$(bash_cmd "gh api repos/o/r/issues/3/comments -f body='knowledge-sync: done'")" "gh api POST comment"
assert allow guard-bash.sh "$(bash_cmd "gh api repos/o/r/issues/7/labels -f 'labels[]=new-level'")" "gh api POST label"
assert allow guard-bash.sh "$(bash_cmd 'gh api repos/o/r/git/commits/abc')"               "gh api GET a git commit"
assert allow guard-bash.sh "$(bash_cmd 'bun install')"                        "bun install"
assert allow guard-bash.sh "$(bash_cmd 'bun run test')"                       "bun run test"
assert allow guard-bash.sh "$(bash_cmd 'bun dev')"                            "bun dev"
assert allow guard-bash.sh "$(bash_cmd 'bunx drizzle-kit generate')"       "bunx drizzle-kit"
assert allow guard-bash.sh "$(bash_cmd 'bunx tsc --noEmit')"                  "bunx tsc"
assert allow guard-bash.sh "$(bash_cmd 'bunx playwright test')"              "bunx playwright"
assert allow guard-bash.sh "$(bash_cmd 'git clean -n')"                       "git clean dry-run"
assert allow guard-bash.sh "$(bash_cmd 'echo "npm install is banned"')"       "the words in a string"
assert allow guard-bash.sh "$(bash_cmd 'git push -u origin feat/x && gh pr create --base main')" "push && gh pr create --base main (the repo's own flow)"
assert allow guard-bash.sh "$(bash_cmd 'git push origin feat/x && rm -f /tmp/scratch')"          "push && rm -f (unrelated -f)"
assert allow guard-bash.sh "$(bash_cmd 'git push origin bugfix-f')"                              "branch name ending in -f"
assert allow guard-bash.sh "$(bash_cmd 'git push origin main-menu-fix')"                         "branch name starting with main"
assert allow guard-bash.sh "$(bash_cmd 'git push origin feat/next-steps')"                       "branch name containing next"
assert allow guard-bash.sh "$(bash_cmd 'git push origin feat/canary-x')"                       "branch name containing canary"
assert allow guard-bash.sh "$(bash_cmd "$(printf 'git commit -m "$(cat <<%sEOF%s\nfeat(ci): guard\n\ndenies gh pr merge and git push --force and git add .\nEOF\n)"' "'" "'")")" "heredoc commit message naming blocked commands"

echo "guard-bash.sh — staging secret files"
assert deny guard-bash.sh "$(bash_cmd 'git add .env.local')"                  "stage .env.local"
assert deny guard-bash.sh "$(bash_cmd 'git add .env')"                        "stage .env"
assert deny guard-bash.sh "$(bash_cmd 'git add certs/server.pem')"            "stage .pem"
assert deny guard-bash.sh "$(bash_cmd 'git add lib/a.ts my-secret.json')"     "stage secret-named file among others"
assert allow guard-bash.sh "$(bash_cmd 'git add .env.example')"               "stage .env.example (committed template)"
assert allow guard-bash.sh "$(bash_cmd 'git add components/keyboard.tsx')" "path containing 'key' but not a key file"

echo "guard-bash.sh — refspec + quote bypasses"
assert deny guard-bash.sh "$(bash_cmd 'git push origin HEAD:main')"           "refspec push to main"
assert deny guard-bash.sh "$(bash_cmd 'git push origin +main')"               "force-prefix push to main"
assert deny guard-bash.sh "$(bash_cmd 'git push origin HEAD:canary')"         "refspec push to canary"
assert deny guard-bash.sh "$(bash_cmd 'git add "."')"                         "quoted git add ."
assert deny guard-bash.sh "$(bash_cmd 'pnpm dlx create-app')"                 "pnpm dlx"

echo "pipefail / SIGPIPE regression — big payloads, match on the FIRST line"
# grep -q exits at its first match. If a writer process is still sending, it gets
# SIGPIPE and (under pipefail) a real match is reported as "no match". Big
# inputs make that happen every time, so these fail loudly if a hook regresses.
big_tail=$(yes 'echo padding-padding-padding-padding' | head -4000 | tr '\n' ';')
assert deny guard-bash.sh "$(bash_cmd "yarn install; ${big_tail}")"  "yarn install ahead of a huge command"
assert deny guard-bash.sh "$(bash_cmd "git add .; ${big_tail}")"     "git add . ahead of a huge command"
big_file=$(yes 'const padding = 1;' | head -20000)
# Allow-listed key lines ("example"): the 2nd grep in guard-write.sh exits at the
# first real key on line 1 while the 1st grep is still writing these.
big_keys=$(yes 'const example = "sk_live_abcdefghijklmno"' | head -20000)
assert deny guard-write.sh "$(write_file 'lib/x.ts' "$(printf 'const k = "sk_live_abcdefghijklmno"\n%s' "$big_keys")")"        "live key on line 1, then many allow-listed key lines"
assert deny guard-write.sh "$(write_file 'lib/x.ts' "$(printf 'NEXT_PUBLIC_ANTHROPIC_API_KEY=abc\n%s' "$big_file")")"           "NEXT_PUBLIC_ secret on line 1 of a huge file"

assert deny guard-bash.sh "$(bash_cmd "gh pr close 12; ${big_tail}")"  "gh pr close ahead of a huge command (reason embeds the command)"

reason_len=$(printf '%s' "$(bash_cmd "gh pr close 12; ${big_tail}")" | bash "$HOOKS/guard-bash.sh" | jq -r '.hookSpecificOutput.permissionDecisionReason' | wc -c)
if [ "$reason_len" -lt 1024 ]; then
  pass=$((pass+1)); printf '  \033[32m✓\033[0m huge denied command → short reason (%s bytes)\n' "$reason_len"
else
  fail=$((fail+1)); printf '  \033[31m✗\033[0m huge denied command → reason too long (%s bytes)\n' "$reason_len"
fi

echo "hooks fail CLOSED on a bad payload"
assert deny guard-bash.sh  ''                    "bash guard: empty payload"
assert deny guard-bash.sh  'not json'            "bash guard: non-JSON payload"
assert deny guard-write.sh ''                    "write guard: empty payload"
assert deny guard-write.sh 'not json'            "write guard: non-JSON payload"
assert allow guard-bash.sh  '{"tool_name":"Bash","tool_input":{}}'  "bash guard: valid JSON, no command"
assert allow guard-write.sh '{"tool_name":"Write","tool_input":{}}' "write guard: valid JSON, no path"

echo "guard-write.sh — must DENY"
assert deny guard-write.sh "$(write_file "$ROOT/.next/server/app.js" 'x')"                                    "generated .next/ (absolute path)"
assert deny guard-write.sh "$(write_file 'next-env.d.ts' 'x')"                                                   "generated next-env.d.ts (relative path)"
assert deny guard-write.sh "$(write_file 'drizzle/meta/_journal.json' '{}')"                                    "drizzle-kit journal"
assert deny guard-write.sh "$(write_file 'lib/mentor/client.ts' 'const k = "sk-ant-api03-abcdefghij1234567890XYZ"')" "live Anthropic-shaped key"
assert deny guard-write.sh "$(write_file "$ROOT/bun.lock" 'x')"                                                "bun.lock"
assert deny guard-write.sh "$(write_file 'package-lock.json' '{}')"                                           "package-lock.json"
assert deny guard-write.sh "$(write_file '.env.local' 'FOO=bar')"                                              ".env.local"
assert deny guard-write.sh "$(write_file "$ROOT/.env" 'FOO=bar')"                                              ".env"
assert deny guard-write.sh "$(write_file 'lib/mentor/x.ts' 'const k = "sk-proj-abcdefghij1234567890XYZ"')" "live OpenAI-shaped key"
assert deny guard-write.sh "$(write_file 'lib/x.ts' "$(printf '// see example usage\nconst k = "sk_live_abcdefghijklmno"')")" "live key on a line, 'example' elsewhere in file"
assert deny guard-write.sh "$(write_file 'next.config.ts' 'NEXT_PUBLIC_ANTHROPIC_API_KEY=abc')"                         "NEXT_PUBLIC_ + Anthropic"
assert deny guard-write.sh "$(write_file '.env.example' 'NEXT_PUBLIC_DATABASE_URL=')"            "NEXT_PUBLIC_ + database URL, even in .env.example"
assert deny guard-write.sh "$(write_file 'lib/x.ts' 'NEXT_PUBLIC_E2B_API_KEY=x')"                    "NEXT_PUBLIC_ + E2B key"

echo "guard-write.sh — must ALLOW"
assert allow guard-write.sh "$(write_file 'drizzle/0001_level_announcements.sql' 'create table x ();')" "new migration"
assert allow guard-write.sh "$(write_file '.env.example' 'ANTHROPIC_API_KEY=  # server-side, Vercel env')"     ".env.example template"
assert allow guard-write.sh "$(write_file "$ROOT/app/page.tsx" 'export default function Home() { return null }')" "ordinary source file"
assert allow guard-write.sh "$(write_file 'docs/plans/x.md' 'Use sk-your-key-here as a placeholder')"            "placeholder in docs"
assert allow guard-write.sh "$(write_file '.env.example' 'NEXT_PUBLIC_SITE_URL=')"                        "legit NEXT_PUBLIC_ site url"
assert allow guard-write.sh "$(write_file 'lib/x.ts' 'NEXT_PUBLIC_POSTHOG_KEY=phc_x')"               "legit NEXT_PUBLIC_ analytics key"
assert allow guard-write.sh "$(write_file 'lib/__tests__/keys.test.ts' 'const f = "sk_live_abcdefghijklmno"')" "key-shaped fixture in a test file"
assert allow guard-write.sh "$(write_file 'components/next-hint.tsx' 'x')"                                      "file named next-* outside .next/"
assert allow guard-write.sh "$(write_file 'lib/keyboard.ts' 'x')"                                                  "path containing 'key' but not a key file"

# ── lint-file.sh ─────────────────────────────────────────────────────────────
# Runs AFTER the write; signals via EXIT CODE. 0 = clean/skip, 2 = errors.
assert_exit() {
  local expect="$1" payload="$2" label="$3" got
  printf '%s' "$payload" | bash "$HOOKS/lint-file.sh" >/dev/null 2>&1
  got=$?
  if [ "$got" = "$expect" ]; then
    pass=$((pass + 1)); printf '  \033[32m✓\033[0m %s\n' "$label"
  else
    fail=$((fail + 1)); printf '  \033[31m✗\033[0m %s \033[2m(expected exit %s, got %s)\033[0m\n' "$label" "$expect" "$got"
  fi
}
edit_file() { jq -n --arg p "$1" '{tool_name:"Edit",tool_input:{file_path:$p}}'; }

echo "lint-file.sh — must SKIP (exit 0)"
assert_exit 0 "$(edit_file "$ROOT/.next/server/app.js")" "generated .next/ output"
assert_exit 0 "$(edit_file "$ROOT/DESIGN.md")"                             "markdown"
assert_exit 0 "$(edit_file "$ROOT/lib/does-not-exist.ts")"                 "file that no longer exists"
assert_exit 0 "$(edit_file '')"                                            "empty path"
assert_exit 0 "$(jq -n '{tool_name:"Edit",tool_input:{}}')"                "payload with no file_path"
assert_exit 0 "$(edit_file '/tmp/elsewhere.ts')"                           "file outside the repo"

echo "lint-file.sh — must RUN eslint"
assert_exit 0 "$(edit_file "$ROOT/app/page.tsx")" "clean file → no wake"

# The probe has a DELIBERATE lint error. Three defences against leaving it
# behind: sweep probes older than 5 min (left by killed runs; never a live
# parallel run's), an EXIT trap, and a .gitignore entry.
find "$ROOT/app" -maxdepth 1 -name '__lint_hook_probe_*.ts' -mmin +5 -delete 2>/dev/null
PROBE="$ROOT/app/__lint_hook_probe_$$.ts"
cleanup_probe() { rm -f "$PROBE"; }
cleanup_probe
trap cleanup_probe EXIT
cat > "$PROBE" <<'PROBE_EOF'
import { useMemo } from 'react';
import { useState } from 'react';

export const probe = () => useState(useMemo(() => 1, []));
PROBE_EOF
assert_exit 2 "$(edit_file "$PROBE")" "file with duplicate imports → wakes the model"
cleanup_probe
trap - EXIT

# ── content-check.sh ─────────────────────────────────────────────────────────
# Same exit-code contract as lint-file.sh: 0 = valid/skip, 2 = schema problems.
assert_content() {
  local expect="$1" payload="$2" label="$3" got
  printf '%s' "$payload" | bash "$HOOKS/content-check.sh" >/dev/null 2>&1
  got=$?
  if [ "$got" = "$expect" ]; then
    pass=$((pass + 1)); printf '  \033[32m✓\033[0m %s\n' "$label"
  else
    fail=$((fail + 1)); printf '  \033[31m✗\033[0m %s \033[2m(expected exit %s, got %s)\033[0m\n' "$label" "$expect" "$got"
  fi
}

echo "content-check.sh — must SKIP (exit 0)"
assert_content 0 "$(edit_file "$ROOT/app/page.tsx")"   "file outside content/ and the curriculum"
assert_content 0 "$(edit_file '')"                     "empty path"
assert_content 0 "$(edit_file '/tmp/content/x.json')"  "content/ outside the repo"

echo "content-check.sh — must RUN the check"
assert_content 0 "$(edit_file "$ROOT/content/builder/outline.json")" "valid content → no wake"
assert_content 0 "$(edit_file 'lib/constants/curriculum.ts')"         "curriculum map (relative path) → no wake"

# A stray file the validator rejects. Removed by a trap; gitignored too. Stale
# probes (>5 min, from killed runs) are swept first.
find "$ROOT/content" -maxdepth 1 -name '__content_hook_probe_*.json' -mmin +5 -delete 2>/dev/null
CPROBE="$ROOT/content/__content_hook_probe_$$.json"
cleanup_cprobe() { rm -f "$CPROBE"; }
cleanup_cprobe
trap cleanup_cprobe EXIT
printf '{}' > "$CPROBE"
assert_content 2 "$(edit_file "$CPROBE")" "unexpected content file → wakes the model"
cleanup_cprobe
trap - EXIT

printf '\n\033[1m%d passed, %d failed\033[0m\n' "$pass" "$fail"
[ "$fail" -eq 0 ]
