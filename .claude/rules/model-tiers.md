# Model tiers: who runs on what

Match the model to the stakes. Expensive context goes to judgment; cheap tokens go to mechanics. Claude picks the tier per task **by itself**. The maintainer only states the goal.

## The tiers

| Work                                                                                          | Model      | How it runs                                                                                              |
| --------------------------------------------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------- |
| **devil** agent (plan vs reality)                                                             | **Fable**  | Pinned via `model: fable` in `.claude/agents/devil.md`                                                   |
| **cto** agent / `/review` / pre-commit review                                                 | **Fable**  | Pinned via `model: fable` in `.claude/agents/cto.md`                                                     |
| **db-architect** agent (schema critique)                                                      | **Fable**  | Pinned via `model: fable` in `.claude/agents/db-architect.md`                                            |
| **voice-guardian** agent (NPC lines, lesson copy, mentor prompt vs the voice rules)           | **Fable**  | Pinned via `model: fable`. A confident wrong fact in a lesson is the Hallucinant winning.                |
| Feature implementation (routes, components, actions, mentor)                                  | **Opus**   | Delegate to a subagent with `model: opus` when the slice is big enough; tiny edits stay in the main loop |
| **content-reviewer** agent (docs-sync `new-level` PRs)                                        | **Opus**   | Pinned in its frontmatter; checks every claim against the cited source                                   |
| **product-owner** agent                                                                       | **Sonnet** | Pinned via `model: sonnet`                                                                               |
| Mechanical work: running tests, file moves, import rewrites, scaffolds, seed data, formatting | **Sonnet** | Delegate with `model: sonnet`                                                                            |
| Bulk asset checks or renaming (sprites, level SVGs)                                           | **Haiku**  | Delegate with `model: haiku` when a script can't do it                                                   |

Current family: Fable 5.1, Opus 5.5, Sonnet 5.5, Haiku 4.5.

**Why the review gates are Fable-pinned agents, not skills:** a skill runs on whatever model the session uses, so on a Sonnet session a review would silently get weaker. Pinning the agent guarantees the model. An agent can't call another agent, so the devil flags `SCHEMA REVIEW REQUIRED` and the main session runs db-architect.

## The reasoning

- **Fable is the scarce judgment resource.** Reviews, adversarial critique and go/no-go verdicts always get it.
- **The main session orchestrates.** Handing implementation and mechanics to subagents keeps the main context small.
- **Opus is enough to write the code.** Fable reviews it before commit (`git-safety.md`).
- **Sonnet is enough when there is a known recipe** and tsc, lint, tests or build can check the result.

## In-product models (not Claude Code)

The mentor and the docs-sync drafter call the Anthropic API from `lib/mentor/` and `scripts/sync-sources.ts`. Their model ids live in `lib/constants/` (one place). Check the `claude-api` skill for current ids and prices before changing them.

## Practical notes

- Subagent work still goes through every gate: step approval, CTO review before commit, mentor eval before push.
- **When review agents may run:** only when the user asks, when a slash command's own procedure spawns one (`/review` → `cto`, `/commit` → `cto`), or when this file says to delegate implementation or mechanics. Review agents never run unrequested.
- If a delegated task goes wrong twice, pull it back into the main session (working-style stop signal).
