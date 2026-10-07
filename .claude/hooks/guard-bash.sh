#!/usr/bin/env bash
# PreToolUse(Bash) guard — hard-blocks irreversible or policy-violating shell commands.
#
# Contract: reads the hook payload as JSON on stdin, writes a permissionDecision
# JSON to stdout. Exit 0 always — the DENY is carried by the JSON, not the exit
# code, so a malformed payload can never wedge the session.
#
# Every deny names the escape hatch: the maintainer can always run the command
# themselves by typing `! <command>` in the Claude Code prompt, which runs in
# their own shell outside Claude's tools.
#
# Rules enforced here are the prose in .claude/rules/git-safety.md and
# .claude/rules/package-manager.md. Prose is a request; this is the guarantee.
#
# Test: bash .claude/hooks/__tests__/guard-bash.test.sh
set -uo pipefail

# Fail closed without jq (every check below needs it). Fixed JSON, no jq.
command -v jq >/dev/null || { printf '%s\n' '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"BLOCKED: jq is not installed (brew install jq). Hooks fail closed without it."}}'; exit 0; }

payload=$(cat)

# The reason goes in on STDIN, never as an argument: Linux caps one argument at
# 128 KiB, so `jq --arg reason "...${cmd}..."` failed on a huge command and the
# deny printed nothing, which reads as allow. If jq still fails, print a fixed
# deny by hand. A deny must never come out empty.
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

# Fail CLOSED: an empty or non-JSON payload is denied, not allowed. Valid JSON
# with no command (another tool shape) still falls through to the allow below.
if ! jq -e . >/dev/null 2>&1 <<<"$payload"; then
  deny "BLOCKED: the hook payload was empty or not valid JSON, so the command cannot be checked (fail closed)."
fi

cmd=$(printf '%s' "$payload" | jq -r '.tool_input.command // empty' 2>/dev/null)

[ -z "$cmd" ] && exit 0

# Deny reasons echo the command; cap it so a huge command gives a small reason.
short_cmd=${cmd:0:300}
[ "${#cmd}" -gt 300 ] && short_cmd+="…"

# Two-stage normalisation.
#
# 1. Remove quoted STRING LITERALS (not just quote characters), so
#    `echo "npm install is banned"` isn't mistaken for actually running npm.
#    Stripping only the quote chars would flag it — a false positive.
# 2. Split on shell separators and match each segment SEPARATELY. Without this,
#    a flag from a later command poisons an earlier one:
#      git push -u origin feat/x && gh pr create --base canary
#    would be denied as "push to main" — which is this repo's own mandated
#    push-then-PR flow.
strip_quotes() { printf '%s' "$1" | sed -E "s/'[^']*'//g; s/\"[^\"]*\"//g"; }

# Heredoc bodies are DATA, not commands. A commit message that describes a
# blocked command (`gh pr merge`) must not be read as running it — that
# blocked this very commit on first run. Drop everything between the heredoc
# marker and its terminator before any matching.
strip_heredocs() {
  local line trimmed out="" marker="" inhd=0
  while IFS= read -r line || [ -n "$line" ]; do
    if [ "$inhd" -eq 1 ]; then
      trimmed="${line#"${line%%[![:space:]]*}"}"        # ltrim
      trimmed="${trimmed%"${trimmed##*[![:space:]]}"}"  # rtrim
      [ "$trimmed" = "$marker" ] && inhd=0
      continue                                          # drop heredoc body
    fi
    if [[ "$line" =~ \<\<-?[[:space:]]*[\'\"]?([A-Za-z_][A-Za-z0-9_]*)[\'\"]? ]]; then
      marker="${BASH_REMATCH[1]}"
      inhd=1
      out+="${line%%<<*}"$'\n'                          # keep what precedes <<
      continue
    fi
    out+="$line"$'\n'
  done <<<"$1"
  printf '%s' "$out"
}

# Segments, one per line, quotes already stripped.
segments=$(strip_quotes "$(strip_heredocs "$cmd")" \
  | tr '\n' ';' | sed -E 's/(\|\||&&|[;&|])/\n/g' | sed -E 's/^ +| +$//g' | tr -s ' ' | grep -v '^$')

# Same segmentation but WITHOUT stripping quotes, so quoted-token bypasses like
# `git add "."` are still visible. Heredocs are dropped from both.
segments_q=$(strip_heredocs "$cmd" \
  | tr '\n' ';' | sed -E 's/(\|\||&&|[;&|])/\n/g' | sed -E 's/^ +| +$//g' | tr -s ' ' | grep -v '^$')

# NOTE: no `printf | grep -q` here. With `pipefail`, grep -q exits at its first
# match, the writer can then die of SIGPIPE, and the pipeline reports failure,
# so a real match reads as "no match" (a flaky false-allow). A here-string has no
# writer process, so the result is deterministic.
# seg_matches <extended-regex> — true if ANY single segment matches.
# Patterns are anchored with ^ so a segment must START with the binary. Prose
# that merely mentions a command (a commit message, an echo) never does. This
# anchor is what makes the guard safe to hard-block with; the earlier
# unanchored version blocked its own commit message.
seg_matches() {
  grep -qE "$1" <<<"$segments"
}

# seg_matches_q — same, against the quote-preserving segments.
seg_matches_q() {
  grep -qE "$1" <<<"$segments_q"
}

# ── 1. Closing PRs and deleting releases — never without a fresh yes ─────────
# Merging is allowed (git-safety.md rule 3: green, reviewed PRs into canary).
if seg_matches '^gh\s+(pr\s+close|release\s+delete)(\s|$)'; then
  deny "BLOCKED: closing a PR or deleting a release needs a fresh, explicit approval (git-safety.md). If you really want this, run it yourself: ! ${short_cmd}"
fi

# The same through the raw REST/GraphQL API. The knowledge-sync routine
# (.claude/skills/knowledge-sync/SKILL.md) uses `gh api` and has no branch
# protection behind it, so this hook is the guard. Quote-preserving segments:
# API paths and fields are usually quoted. Allowed: GET reads and the POSTs the
# routine needs (`/pulls`, `/issues/N/comments`, `/issues/N/labels`).
gh_api_deny="BLOCKED: 'gh api' may only read, open a PR, comment or add a label. Merging, closing (state=), PUT/PATCH/DELETE and git ref changes are a human's call (git-safety.md). If you really want this, run it yourself: ! ${short_cmd}"
if seg_matches_q '^gh\s+api\b.*/merges?([/?'"'"'"[:space:]]|$)'; then deny "$gh_api_deny"; fi
if seg_matches_q '^gh\s+api\b.*\s(-X|--method)(\s+|=)?['"'"'"]?(PUT|PATCH|DELETE|put|patch|delete)\b'; then deny "$gh_api_deny"; fi
if seg_matches_q '^gh\s+api\b.*\s(-f|-F|--field|--raw-field)(\s+|=)['"'"'"]?state='; then deny "$gh_api_deny"; fi
if seg_matches_q '^gh\s+api\b.*/git/refs'; then deny "$gh_api_deny"; fi
if seg_matches_q '^gh\s+api\s+graphql\b.*(mergePullRequest|closePullRequest|closeIssue|updatePullRequest|updateIssue|deleteRef|updateRef)'; then deny "$gh_api_deny"; fi

# ── 2. History rewriting / destructive git ───────────────────────────────────
# Flags must belong to the git command in THIS segment, so `-f` from an
# unrelated `rm -f` in a chain can't be read as a force-push.
if seg_matches '^git\s+push\b.*[[:space:]](--force(-with-lease)?|-f)([[:space:]]|$)'; then
  deny "BLOCKED: force-push rewrites history that may already be on origin. This needs a fresh, explicit in-message approval every single time (git-safety.md). Run it yourself if intended: ! ${cmd}"
fi
if seg_matches '^git\s+reset(\s|$).*--hard'; then
  deny "BLOCKED: 'git reset --hard' discards uncommitted work irreversibly. Needs a fresh explicit approval. Run it yourself if intended: ! ${cmd}"
fi
if seg_matches '^git\s+clean\b.*[[:space:]]-[a-zA-Z]*f'; then
  deny "BLOCKED: 'git clean -f' deletes untracked files irreversibly. Needs a fresh explicit approval. Run it yourself if intended: ! ${cmd}"
fi
if seg_matches '^git\s+commit(\s|$).*--amend'; then
  deny "BLOCKED: amending rewrites a commit. If it was already pushed this rewrites shared history. Make a NEW commit instead (git-safety.md). Run it yourself if intended: ! ${cmd}"
fi
if seg_matches '^git\s+commit(\s|$).*(--no-verify|--no-gpg-sign)'; then
  deny "BLOCKED: never bypass commit hooks. If a hook is wrong, fix the hook, not the commit (git-safety.md). Run it yourself if intended: ! ${cmd}"
fi

# ── 3. Staging everything — commits must stage exact paths ───────────────────
# Also matches the quoted form `git add "."`, which quote-stripping would hide.
if seg_matches '^git\s+add\s+(\.|-A|--all)(\s|$)' \
  || seg_matches_q "^git\s+[\"']?add[\"']?\s+[\"']?(\.|-A|--all)[\"']?(\s|\$)"; then
  deny "BLOCKED: stage exact paths, never 'git add .' / '-A'. It sweeps in unrelated work and risks committing secrets (git-safety.md, /commit step 6). Use: git add <file1> <file2>"
fi

# ── 3b. Staging a secret-shaped path ─────────────────────────────────────────
# guard-write.sh stops Claude WRITING a secret file, but a secret that already
# exists on disk could still be staged. git-safety.md claimed a hook covered
# this; it didn't until now. .env.example is the committed template, so allow it.
while IFS= read -r seg; do
  case "$seg" in
    "git add "*|"git add"*)
      for arg in ${seg#git add}; do
        case "$arg" in
          -*) continue ;;                    # flags, not paths
          *.env.example|*.env.sample) continue ;;
          *.env|*.env.*|*.pem|*id_rsa*|*.key|*credentials*|*secret*)
            deny "BLOCKED: '${arg}' looks like a secrets file — never stage it (git-safety.md). If it is genuinely safe to commit, stage it yourself: ! git add ${arg}"
            ;;
        esac
      done
      ;;
  esac
done <<<"$segments"

# ── 4. Direct pushes to protected branches ───────────────────────────────────
# `main` is the release branch and `canary` the dev and prerelease branch; semantic-release
# builds from both. Covers `push origin main`, the refspec `push origin HEAD:main`,
# and the force prefix `push origin +main`. Only inside a `git push` segment, so
# `gh pr create --base main` in the same chain stays allowed.
if seg_matches '^git\s+push(\s|$).*[[:space:]:+](main|canary)(\s|$)'; then
  deny "BLOCKED: never push directly to main or canary — everything goes via PR (git-safety.md). Push your feature branch and open a PR instead."
fi

# ── 5. Wrong package manager ─────────────────────────────────────────────────
# No exceptions in this repo. Docs say `npx create-next-app` / `npx drizzle-kit`; here it is `bunx …`.
if seg_matches '^(npm|pnpm|yarn)\s+(i|install|add|remove|run|ci|exec|create|dlx)(\s|$)' \
  || seg_matches '^npx(\s|$)'; then
  deny "BLOCKED: this repo is Bun-only (package-manager.md). Use bun install / bun add / bun add -d / bun run / bunx (not npx)."
fi

exit 0
