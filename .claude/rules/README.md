# Rules

Two kinds live here.

**Always-on** (`*.md` at this level, no `paths:` frontmatter). These load into every request. Keep them few and short: posture, decision style, git safety, model tiers, tooling. If a rule only matters in one area, it does not belong here.

**Path-scoped** (`scoped/*.md`, with `paths:` frontmatter). These load only when Claude opens a matching file.

Claude Code finds rules recursively, so `scoped/` is only a folder for tidiness. It loads the same way.

| Scoped rule        | Fires on                                                                                                              |
| ------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `specs.md`         | `docs/plans/**`: the spec flow and the devil gate                                                                     |
| `mentor-eval.md`   | `lib/mentor/**`, `app/api/mentor/**`, `.claude/skills/knowledge-sync/SKILL.md`, `scripts/eval/**`, `lib/prompts/**`   |
| `grading.md`       | `lib/grading/**`, `lib/actions/**`, `lib/xp/**`, `content/**/case.json`                                               |
| `pixel-art.md`     | `lib/sprite/**`, `components/scenes/**`, `components/map/**`, `public/art/**`, `public/levels/**`, `design/assets/**` |
| `design-tokens.md` | `app/globals.css`, `components/**`, `design/tokens/**`                                                                |

Area rules for a single directory go in a nested `CLAUDE.md` instead (`db/CLAUDE.md`, `content/CLAUDE.md`). That keeps one mechanism per area and avoids loading things twice.

## Checking what loaded

Run `/context` in a session and look at **Memory files**. Open a file in an area and check that its rule appears.
