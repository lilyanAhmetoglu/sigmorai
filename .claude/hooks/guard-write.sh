#!/usr/bin/env bash
# PreToolUse(Edit|Write|MultiEdit) guard — blocks writes to generated or
# protected files and writes that would hardcode a secret.
#
# Contract: hook payload JSON on stdin, permissionDecision JSON on stdout.
# Always exits 0; the DENY rides in the JSON so a bad payload can't wedge things.
#
# Test: bash .claude/hooks/__tests__/guard.test.sh
set -uo pipefail

# Fail closed without jq (every check below needs it). Fixed JSON, no jq.
command -v jq >/dev/null || { printf '%s\n' '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"BLOCKED: jq is not installed (brew install jq). Hooks fail closed without it."}}'; exit 0; }

payload=$(cat)

# Reason goes in on STDIN, not as an argument (Linux caps one argument at 128 KiB).
# If jq fails, print a fixed deny by hand. A deny must never come out empty.
deny() {
  printf '%s' "$1" | jq -Rs '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: .
    }
  }' 2>/dev/null \
    || printf '%s\n' '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"BLOCKED by hook (reason could not be rendered)."}}'
  exit 0
}

# Fail CLOSED: an empty or non-JSON payload is denied, not allowed.
if ! jq -e . >/dev/null 2>&1 <<<"$payload"; then
  deny "BLOCKED: the hook payload was empty or not valid JSON, so the write cannot be checked (fail closed)."
fi

path=$(printf '%s' "$payload" | jq -r '.tool_input.file_path // empty' 2>/dev/null)
[ -z "$path" ] && exit 0

# New/changed text across Write, Edit and MultiEdit shapes.
content=$(printf '%s' "$payload" | jq -r '
  [ .tool_input.content?,
    .tool_input.new_string?,
    (.tool_input.edits? // [] | .[]?.new_string?)
  ] | map(select(. != null)) | join("\n")
' 2>/dev/null)

# Repo-relative view of the path, so the checks below work for absolute paths.
root="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"
rel="${path#"$root"/}"

# ── 1. Generated files ───────────────────────────────────────────────────────
# .next/ is build output; next-env.d.ts is rewritten by `next dev`/`next build`;
# drizzle/meta/ is drizzle-kit's snapshot journal (never hand-edit it).
case "$rel" in
  .next/* | next-env.d.ts | drizzle/meta/*)
    deny "BLOCKED: '$rel' is generated. Change the source (next.config.ts, db/schema/**) and regenerate: 'bun run build' or 'bun run db:generate' (AGENTS.md)."
    ;;
esac

# ── 2. Lockfiles ─────────────────────────────────────────────────────────────
case "$rel" in
  bun.lock)
    deny "BLOCKED: bun.lock is generated. Change package.json, then run 'bun install'."
    ;;
  package-lock.json | pnpm-lock.yaml | yarn.lock)
    deny "BLOCKED: this repo is Bun-only (package-manager.md). Only bun.lock is committed."
    ;;
esac

# ── 3. Secret-shaped paths ───────────────────────────────────────────────────
case "$path" in
  *.env|*.env.*|*.pem|*id_rsa*|*.key|*credentials*|*secret*)
    # .env.example is the documented, committed template — allow it.
    case "$path" in
      *.env.example) ;;
      *) deny "BLOCKED: '$path' looks like a secrets file. Claude never writes these. Secrets live in Vercel env ('bunx vercel env add KEY') and your local .env.local, which you write yourself. Document every var in .env.example." ;;
    esac
    ;;
esac

[ -z "$content" ] && exit 0

# Test files legitimately contain key-SHAPED fixtures — that's how you test a
# secret scanner. Narrow on purpose: only obvious test paths.
case "$path" in
  *__tests__/*|*.test.*|*.spec.*|*/fixtures/*|*/__fixtures__/*) exit 0 ;;
esac

# sk- must start a word: '(^|[^A-Za-z0-9])' skips risk-/task-/desk- URL slugs, and
# (no \b) works the same in GNU and BSD grep. It also covers sk-ant- and sk-proj-.
# ── 4. Hardcoded live credentials ────────────────────────────────────────────
# The allowlist is checked on the MATCHING LINE only; a whole-file check would
# let a real key through whenever the word "example" appears anywhere.
# (here-strings, not `printf | grep -q`: see the SIGPIPE note in guard-bash.sh)
key_lines=$(grep -E '((^|[^A-Za-z0-9])sk-[A-Za-z0-9_-]{20,}|sk_live_[A-Za-z0-9]{10,}|pk_live_[A-Za-z0-9]{10,}|rk_live_[A-Za-z0-9]{10,}|whsec_[A-Za-z0-9]{10,}|e2b_[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|vercel_blob_rw_[A-Za-z0-9_]{10,}|npg_[A-Za-z0-9]{10,})' <<<"$content")
# The -n test is load-bearing: <<<"" feeds grep one EMPTY line, which -v counts
# as a non-allow-listed line, so without it every keyless write would be denied.
if [ -n "$key_lines" ] && grep -qviE '(example|placeholder|dummy|fake|xxx|your[-_]?key|test_)' <<<"$key_lines"; then
  deny "BLOCKED: this write contains what looks like a live API key. Secrets never go in the repo — use Vercel env vars ('bunx vercel env add') and .env.local, and document the name in .env.example."
fi

# ── 5. Server-only secrets behind the client-visible prefix ──────────────────
# Deliberately NOT matching bare KEY or URL: NEXT_PUBLIC_SITE_URL is
# client-safe by design.
if grep -qE 'NEXT_PUBLIC_[A-Z_]*(SECRET|PRIVATE|TOKEN|ANTHROPIC|OPENAI|E2B|JUDGE0|DATABASE|POSTGRES|NEON|AUTH_|GITHUB|GOOGLE_CLIENT|RESEND|BLOB|WEBHOOK)' <<<"$content"; then
  deny "BLOCKED: NEXT_PUBLIC_ inlines the value into the browser bundle. Never put ANTHROPIC_API_KEY, E2B_API_KEY, DATABASE_URL, AUTH_SECRET / OAuth secrets, RESEND_API_KEY, BLOB_READ_WRITE_TOKEN or webhook secrets behind it. Read them in server code only."
fi

exit 0
