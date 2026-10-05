# Critical behavior rules

These apply for the whole task, not only at the start.

## Search before you create, every time

**Before you write ANY new function, component, hook, helper, constant, type, config or JSON file, search the repo for one that already exists or does something similar.** Search first, write second.

| About to add             | Search for                                                                                                                                  |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| a function / helper      | the verb AND the noun (`grep -rn "levelFor\|xpFor" lib`)                                                                                    |
| a component              | `components/` (design-system primitives, flat), then `components/<area>/` (`hud/`, `scenes/`, `quest/`, `map/`, …)                          |
| a constant / magic value | `lib/constants/` (barrel `@/lib/constants`), then the literal value itself (an XP amount, a duration).                                      |
| a type / schema          | `lib/types/` (barrel `@/lib/types`). A component's own `Props` stay in its file; anything shared goes in `lib/types`.                       |
| a colour / font / space  | the tokens in `app/globals.css` (`@theme` + raw `--*` vars), copied verbatim from `design/tokens/`. Never a new hex, radius or blur shadow. |
| a JSON / config / seed   | `ls` the directory. The naming convention there is usually settled.                                                                         |

When something similar exists, prefer in this order: **use it** · **extend it** · **explain in a comment why a second one is justified**. A silent near-duplicate is never acceptable.

**If you write a new one anyway, say so out loud.** Name what you found and why it didn't fit, so the maintainer can overrule you before the duplicate lands.

## Before generating code

- **Ask clarifying questions** when requirements are missing, unclear or only implied.
- **Challenge weak assumptions.** If a request rests on a shaky premise, name it.
- **Propose better architecture** when you see it, with reasoning.
- **Think before implementing.** The spec flow exists for this (`.claude/rules/scoped/specs.md`).
- **Write production-ready code.** Handle real edge cases, not just the happy path.
- **No toy examples** unless asked.

## Keep watching for, and raise

- **Missing requirements** that will block or break later
- **Scalability**: what breaks at 10× users, 10× submissions or a leaderboard over a big `xp_events` table
- **Cost**: mentor tokens and the docs-sync drafting job are the whole bill
- **Web UX**: tap targets under 44px, no loading/empty/error state, layouts that don't reflow on a phone, horizontal page scroll (only the level map scrolls sideways)
- **Security**: grading or XP decided on the client, a Server Action that trusts its input or skips `auth()`, secrets behind `NEXT_PUBLIC_`, correct answers sent to the browser
- **Maintainability**: pages or components calling the DB or Anthropic directly (ESLint blocks the imports; don't route around it)
- **Accessibility**: missing labels, colour-only state (pass/fail needs text or an icon too), reduced motion ignored, canvas without `aria-hidden` + a text alternative, focus ring not the 3px Spark ring
- **Truth**: lesson or mentor text that states an API shape the cited source doesn't support. Sigmorai's villain is the Hallucinant; the product can't be one.

## Production-ready means (for Sigmorai specifically)

- **Every async UI has all four states**: loading, empty, error, success.
- **Grading happens on the server only.** Correct indexes and explanations never reach the client before submit.
- **Every XP change is an `xp_events` row**, written in a Server Action that re-validates everything. `users.xp` is derived/denormalised from it, never set from client input.
- **Every mentor call goes through `lib/mentor/`**, grounded only in the current lesson's sources, streamed, with a timeout and token logging.
- **Tokens only.** Zero radius, hard offset shadows, no gradients except the scene text-legibility fade. Reading text is Atkinson Hyperlegible; pixel fonts only for headings, HUD and buttons.
- **Every layout reflows down to 360px wide.**
- **Every server secret stays server-side.** `NEXT_PUBLIC_` is for browser-visible values only.

## When information is missing

**ASK FIRST.** Don't guess and build the wrong thing.

## Confidence floor

**Don't move to the next to-do until you are at least 95% sure the current one works.** Read the file back, run typecheck, lint, tests and `bun run build`, look at the UI. If you are below 95%, say so, then either run the check that gets you there or ask the user.

## Fitting with `decision-style.md`

- `decision-style.md`: when you _make_ a decision, give one opinionated pick, not a menu.
- This rule: when the _question itself_ is unclear or risky, **ask before deciding**.

If you can pick correctly without input, pick. If a wrong pick is expensive to undo (data model, auth provider, product scope, money, a hard-to-reverse migration), ask.
