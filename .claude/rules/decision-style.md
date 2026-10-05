# Decision style: opinionated, not a menu

For technical or product decisions, give **one** opinionated pick with a one-line reason. Don't list 3–4 equal options.

## Why

The maintainer wants momentum. A menu adds friction and no value when the trade-offs are small.

## How to apply

- **Stack picks, naming, file placement, internal architecture**: just decide. Add one sentence of "why" so the user can override.
- **Consequential, hard-to-undo decisions** (vendor swap, schema redesign, payment flow, model provider): lead with the recommendation, then one line: "alternatives: X or Y, both worse because Z".
- **Only ask** when the answer needs the maintainer (accounts, real preferences, legal or money limits, budget) or you would be guessing badly.
- **Never** ask a question whose answer doesn't change the next action.

## Flag decisions under 95% confidence up front

When you propose a phase or feature, list the calls you are unsure about **in the proposal**, with your lean, before you build. Don't build, then revert when questioned.

> **Calls I'm under 95% on:**
>
> 1. **<topic>**: Lean: <pick>. Why: <one line>. Other option: <alternative>, downside <one line>.

## When to break this rule

If the user asks "what are my options" or "compare X and Y", give a real comparison. They asked for the menu.
