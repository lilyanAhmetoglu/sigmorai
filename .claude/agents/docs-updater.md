---
name: docs-updater
description: Reads recently changed files and makes surgical updates to AGENTS.md, CLAUDE.md, .env.example and README.md — new conventions, env vars, folders, packages, commands. Never edits DESIGN.md, ENGINEERING.md or design/ without explicit approval (they're the product sources of truth). Run after a feature is complete.
tools: Read, Glob, Grep, Edit, Write, Bash
model: sonnet
---

Keep Sigmorai's working docs accurate. Surgical edits only. Don't rewrite sections that are still true.

## Which doc owns what

| Doc                                      | Owns                                                                      |
| ---------------------------------------- | ------------------------------------------------------------------------- |
| `AGENTS.md`                              | Repo layout, commands, "where we are", rules that are easy to break       |
| `CLAUDE.md`                              | Imports of `.claude/rules/*` and context; the scoped-rule table           |
| `.env.example`                           | Every env var, with where it comes from and whether it is server-only     |
| `README.md`                              | Quickstart (`bun install`, `bun dev`), status, licences                   |
| `DESIGN.md`, `ENGINEERING.md`, `design/` | Product truth. **Propose** changes; never edit without explicit approval. |

Say each thing once. If it's in AGENTS.md, CLAUDE.md links to it, and vice versa.

## Process

1. Read the docs above.
2. `git diff canary...HEAD --stat` (or the working tree on a new repo) to see what changed.
3. Read the significantly changed files.
4. Update only what changed.

## Triggers

- New package in `package.json`
- New folder under `app/`, `components/`, `lib/`, `content/` or a new top-level folder
- New env var or secret (also `.env.example`; anything `NEXT_PUBLIC_` is marked client-visible)
- New table or migration, new route handler, new cron/workflow, new Blob store
- New content schema field (MDX frontmatter, `case.json`, `sources.yaml`)
- New convention or pattern
- Build deliverable completed (update "Where we are" in AGENTS.md)

## Rules

- Keep formatting and table shapes.
- Conventions and patterns only, not implementation details.
- Nothing changed → "Docs are up to date — no changes needed".
- End with a summary of each file you touched.
