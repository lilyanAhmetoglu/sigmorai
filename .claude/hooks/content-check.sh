#!/usr/bin/env bash
# PostToolUse(Edit|Write|MultiEdit) — run `bun run content:check` after Claude
# touches content or the curriculum. Deterministic: Zod loaders only, no model,
# no network, well under a second.
#
# Fires on: content/** · lib/constants/curriculum.ts · lib/constants/content.ts ·
# lib/types/content.ts · lib/types/curriculum.ts (the schemas and the map).
# Facts are NOT checked here: /commit and /review run the content-reviewer agent.
#
# Same contract as lint-file.sh (async, `asyncRewake: true`):
#   exit 0 = valid / not applicable / toolchain problem   (stay silent)
#   exit 2 = schema problems; stdout is fed back to Claude (wake the model)
#
# Test: bash .claude/hooks/__tests__/guard.test.sh
set -uo pipefail

payload=$(cat)
path=$(printf '%s' "$payload" | jq -r '.tool_input.file_path // .tool_response.filePath // empty' 2>/dev/null)
[ -z "$path" ] && exit 0

root="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"
abs="$path"
case "$abs" in
  /*) ;;
  *) abs="$root/$path" ;;
esac
rel="${abs#"$root"/}"
[ "$rel" = "$abs" ] && exit 0 # outside the repo

case "$rel" in
  content/* | lib/constants/curriculum.ts | lib/constants/content.ts | lib/types/content.ts | lib/types/curriculum.ts) ;;
  *) exit 0 ;;
esac

cd "$root" 2>/dev/null || exit 0
command -v bun >/dev/null 2>&1 || exit 0
[ -d "$root/node_modules" ] || exit 0

out=$(bun run --silent content:check 2>&1)
status=$?
[ "$status" -eq 0 ] && exit 0

# The check prints "content:check: N problem(s)" on real problems. Anything
# else (a crash, a missing script) is a toolchain issue, not Claude's to fix.
printf '%s' "$out" | grep -q 'content:check: [0-9]* problem' || exit 0

printf 'Content check failed after your edit to %s:\n\n%s\n\nFix the file before continuing.\n' "$rel" "$out"
exit 2
