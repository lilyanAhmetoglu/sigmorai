#!/usr/bin/env bash
# PostToolUse(Edit|Write|MultiEdit) — ESLint the ONE file Claude just touched.
#
# Why: prettier (inline in settings.json) fixes formatting, but nothing ran
# ESLint until `git commit`, long after the context that caused the error.
#
# Why ASYNC (`asyncRewake: true` in settings.json): ESLint with the React
# Compiler rules takes a few seconds per file. It runs in the background and
# only interrupts Claude when it finds a real error.
#
# Contract — DIFFERENT from the guard-*.sh scripts:
#   exit 0 = clean / not applicable / toolchain problem   (stay silent)
#   exit 2 = real lint errors; stdout is fed back to Claude (wake the model)
#
# Errors only (`--quiet`). Warnings aren't worth interrupting a turn for.
#
# Test: bash .claude/hooks/__tests__/guard.test.sh
set -uo pipefail

payload=$(cat)
path=$(printf '%s' "$payload" | jq -r '.tool_input.file_path // .tool_response.filePath // empty' 2>/dev/null)
[ -z "$path" ] && exit 0
[ -f "$path" ] || exit 0

# ── 1. Only files ESLint is configured for ───────────────────────────────────
case "$path" in
  *.ts | *.tsx | *.js | *.jsx | *.mjs | *.cjs | *.mts) ;;
  *) exit 0 ;;
esac

# ── 2. Generated output has no business being linted ─────────────────────────
case "$path" in
  */.next/* | .next/* | */drizzle/* | drizzle/*) exit 0 ;;
esac

# ── 3. One workspace: the repo root ──────────────────────────────────────────
root="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"
abs="$path"
case "$abs" in
  /*) ;;
  *) abs="$root/$path" ;;
esac
rel="${abs#"$root"/}"
[ "$rel" = "$abs" ] && exit 0 # outside the repo

cd "$root" 2>/dev/null || exit 0

# ── 4. Lint ──────────────────────────────────────────────────────────────────
# Call the ESLint binary directly, never `bunx`: bunx also exits non-zero when
# it can't resolve a package (fresh clone, offline), which would wake the model
# over a toolchain problem instead of a lint error.
eslint_bin="$root/node_modules/.bin/eslint"
[ -x "$eslint_bin" ] || exit 0

out=$("$eslint_bin" --quiet --no-warn-ignored "$rel" 2>&1)
status=$?

[ "$status" -eq 0 ] && exit 0
[ -z "$out" ] && exit 0

# ESLint exits 1 for problems, 2 when its own config/CLI is broken. Only the
# former is Claude's to fix.
[ "$status" -ne 1 ] && exit 0

printf 'ESLint found errors in %s (introduced by the edit you just made):\n\n%s\n\nFix them before continuing.\n' "$rel" "$out"
exit 2
