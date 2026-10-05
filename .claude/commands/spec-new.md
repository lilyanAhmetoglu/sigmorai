---
description: Scaffold a new design plan under docs/plans/ using the Sigmorai spec template (see .claude/rules/scoped/specs.md).
---

Create a new spec (design plan) in `docs/plans/` using the Sigmorai template.

Specs live in `docs/plans/<slug>-design-plan.md` per `@.claude/rules/scoped/specs.md`.

## Procedure

### 1. Gather inputs

Ask (or take from args):

- **Title**: short, ≤ 50 chars ("Level map", "AI mentor", "Docs sync")
- **Slug**: kebab-case, derived from the title by default
- **Status**: `STUB` | `Substantive stub` | `Ready to implement`
- **Build step**: which deliverable in ENGINEERING.md → Build order (1–9), or `cross-cutting`
- **Track**: `builder` | `strategist` | `both` | `n/a`
- **Purpose**: one paragraph, or `TODO`

### 2. Validate

- `docs/plans/<slug>-design-plan.md` does NOT exist (`ls docs/plans/` first; a similar spec may already cover it)
- Slug matches `^[a-z0-9][a-z0-9-]*$`
- Status is one of the three values

### 3. Create the spec

```markdown
# Sigmorai — <Title>

> <One-line purpose and scope. Read end-to-end before any code; each phase is gated by explicit approval.>

## Status

**STATUS: <STUB | Substantive stub | Ready to implement>. Build step: <n | cross-cutting>. Track: <builder | strategist | both | n/a>.**

## Amendments

<!-- New decisions are appended here as:
## Amendments locked YYYY-MM-DD
- ...
-->

---

## Context

<What's already in place, what this builds on, what blocks it. Link the ENGINEERING.md / DESIGN.md sections and the screen in design/ui_kits/webapp/Sigmorai App.dc.html it matches.>

## Purpose

<One paragraph: problem, who it's for, outcome.>

## User-visible behavior

<Step by step what the learner sees and does. Golden path first, then edge cases. NPC lines only inside DialogBoxes; product voice stays plain and technical.>

## Fairness and integrity check

<How this feature could let a learner fake progress (client-side XP, replaying a challenge for XP, leaking hidden tests or correct answers) and how the design stops it. "N/A" only if the feature touches no XP, grading or leaderboard.>

## Data model

<Drizzle tables, columns, indexes, migration name, per-track progress — or "N/A". Schema changes need the db-architect agent.>

## API contract

<Server actions and route handlers, input/output shapes (Zod), error codes, revalidatePath targets — or "N/A">

## AI and cost

<Mentor or docs-sync drafter usage: model, prompt file, grounding sources, cache-friendly prefix, expected tokens per learner per day, rate limits, what degrades near a cap — or "N/A">

## Code execution

<E2B sandbox usage: language, timeouts, memory, visible vs hidden tests, what the client sees — or "N/A">

## States and transitions

<Loading, empty, error, success. Locked / open / done. HP at 0. Signed-out. Mobile width (≤ 390px), keyboard only, prefers-reduced-motion.>

## Phases

### Phase 1 — <name>

**Goal:** <one line>

**Files**

- `<path>` _(new | modify)_ — <what changes>

**Verification**

- <how we know it works: bun test, Playwright flow, bun run build, browser check at mobile width>

**Approval gate:** <what must be true before phase 2>

---

## Acceptance criteria

- [ ] <done-when checks>

## Out of scope

- <explicitly not building>

## Open questions

- <decisions the maintainer needs to make>

## Companion plans

- <related specs in docs/plans/>
```

### 4. Update the index (ask first)

Ask: _"Add this spec to `docs/plans/README.md`?"_ If yes, add a row. If the README doesn't exist, offer to create it.

### 5. Report

- Path created
- Status, build step and track
- Reminder: the spec is the contract. Fill the TODOs and get approval before writing code. Run the `devil` agent before each phase.
