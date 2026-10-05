# CLAUDE.md: Sigmorai

A pixel-art RPG web app for learning AI engineering. Next.js + Bun on Vercel, Neon Postgres. Explain decisions in A2 English.

This file holds only what is true **everywhere**. Area guidance loads on demand (`.claude/rules/scoped/`, nested `CLAUDE.md`). Don't duplicate it here.

## The repo

@AGENTS.md

## Working agreements

The operational rules of the repo. Read them before acting.

@.claude/rules/explain-simply.md
@.claude/rules/critical-behavior.md
@.claude/rules/decision-style.md
@.claude/rules/working-style.md
@.claude/rules/git-safety.md
@.claude/rules/package-manager.md
@.claude/rules/external-tools.md
@.claude/rules/model-tiers.md
@.claude/context/project.md

**Never `@import` area guidance here.** An import expands at launch, which is what on-demand loading avoids.

## Loads on demand

| File                      | Fires on                                                                           |
| ------------------------- | ---------------------------------------------------------------------------------- |
| `db/CLAUDE.md`            | any file under `db/`: schema, client, migrations                                   |
| `content/CLAUDE.md`       | any file under `content/`: lessons, challenges, cases, sources                     |
| `scoped/specs.md`         | `docs/plans/**`: the spec flow and the devil gate                                  |
| `scoped/grading.md`       | `lib/grading/**`, `lib/runner/**`, `lib/actions/**`, `lib/xp/**`, `app/api/run/**` |
| `scoped/mentor-eval.md`   | `lib/mentor/**`, `lib/prompts/**`, `app/api/mentor/**`, `scripts/sync-sources.ts`  |
| `scoped/pixel-art.md`     | `lib/sprite/**`, `components/scenes/**`, `components/map/**`, `public/art/**`      |
| `scoped/design-tokens.md` | `app/globals.css`, `components/**`, `design/tokens/**`                             |

## Tools in `.claude/`

| Kind     | What                                                                                                                                                                                                        |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Commands | `/commit` · `/review` · `/push` · `/spec-new`                                                                                                                                                               |
| Agents   | `cto` · `devil` · `db-architect` · `voice-guardian` (Fable-pinned gates) · `plan` · `security-checker` · `ui-ux-reviewer` · `nextjs-best-practices` · `content-reviewer` · `product-owner` · `docs-updater` |
| Skills   | `new-route` · `new-ui-primitive` · `new-server-action`                                                                                                                                                      |
| Hooks    | `guard-bash.sh`, `guard-write.sh`, prettier + `lint-file.sh` after every edit. See `.claude/hooks/README.md`.                                                                                               |

## Where things are documented

`DESIGN.md` + `design/` (look and voice) · `ENGINEERING.md` (stack, data, build order) · `docs/build-prompt.md` (founding brief) · `docs/plans/<feature>-design-plan.md` (feature specs) · `db/CLAUDE.md` · `content/CLAUDE.md`.
