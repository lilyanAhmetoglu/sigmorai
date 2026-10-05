---
paths:
  - 'docs/plans/**'
---

# Spec-driven development and the devil gate

For non-trivial features, write or update a **spec** in `docs/plans/<feature>-design-plan.md` **before** writing code. The spec is the contract: dense but readable, detailed enough that two engineers would build the same thing.

`ENGINEERING.md`, `DESIGN.md` and `design/` (the Claude Design reference) are the product-level sources of truth. A spec narrows one feature or build step; it never contradicts them silently. If a spec needs to disagree, amend the source doc in the same PR and say so.

## The flow

1. **Draft**: write or update the spec. Cover purpose, user-visible behaviour, data shape, API contract, states, edge cases, phases, acceptance criteria, out of scope and open questions.
2. **Review**: present it. Wait for explicit approval before coding.
3. **Devil gate**: before building any phase, spawn the **`devil`** agent scoped to that phase. It checks the spec against current reality: conflicts with later decisions, over-engineering, stale steps. Show its verdict verbatim, with a plain A2 summary first.
   - `build as written` → implement.
   - `refine before building` / `amend spec first` → get approval on the amendments, write them, **then** implement.
   - If it flags `SCHEMA REVIEW REQUIRED`, the main session spawns the `db-architect` agent (an agent can't call another agent).
   - If the phase touches NPC lines, lesson copy or the mentor/sync prompts, the main session also spawns **`voice-guardian`**.
4. **Implement**: code matches the spec. If you find mid-way that the spec is wrong, **stop**, update it, get approval, resume. Don't drift silently.
5. **Amend in place**: when reality forces a change, add a dated `Amendments locked YYYY-MM-DD` block at the top. Never rewrite history. Layer the decision on top so the reason stays visible, including why the old approach was dropped.
6. **Verify**: walk the acceptance criteria against running code (browser at 360px and desktop, tests, mentor eval).

## When you DON'T need a spec (or the devil)

- Bug fixes: the bug report and the commit **are** the spec
- One-screen tweaks (styles, copy edits, small interactions). NPC lines still go past `voice-guardian`.
- Renames and refactors that keep behaviour
- A new UI primitive: the primitive is its own spec

If you're unsure whether something counts as "building from a spec", it almost certainly does. Run the devil.

## What does NOT go in a spec

Implementation details (exact function names, internal helpers) belong in code. Features more than two phases out stay out; keep specs scoped. Past ~1,500 lines, split the spec.

## The gates are distinct

| Gate                 | When                                | Reviews                       |
| -------------------- | ----------------------------------- | ----------------------------- |
| **devil**            | before building                     | the plan vs reality           |
| **db-architect**     | before any migration                | the data model                |
| **voice-guardian**   | before merging NPC copy or a prompt | the two-voice rules           |
| **eval**             | before push, if mentor-touching     | behaviour (`mentor-eval.md`)  |
| **content-reviewer** | on every `new-level` PR             | lesson truth vs cited sources |
| **cto** / `/review`  | before commit                       | the code                      |

Scaffold a new spec with `/spec-new`.
