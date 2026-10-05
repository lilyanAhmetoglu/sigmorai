# Working style: small steps, narrow scope, frequent check-ins

How Claude paces work here. It stops over-engineering, runaway sessions and repeating the same mistake.

## Before making changes

**Say the smallest plan in one sentence:**

- the deliverable (PR title or one-line goal)
- the file(s) you will touch
- the output or behaviour you expect when done

If the plan needs more than one paragraph, it isn't the smallest plan. Narrow it.

## While working

- **Keep context narrow.** Don't read 20 files when 2 will do.
- **Avoid broad searches.** Read a specific file at a specific line before `grep -r`. Use the `Explore` agent only when you really don't know where to look.
- **Stop after the first working patch.** Don't pile more improvements on a passing change. The user reviews it first.

## Stop signals (mandatory)

Pause and check in when ANY of these is true:

| Trigger                                    | Action                                                                            |
| ------------------------------------------ | --------------------------------------------------------------------------------- |
| **10 minutes without an edit**             | Stop. Report what you explored and what blocks you. Ask.                          |
| **The same approach failed twice**         | Stop. Don't try a third version. Show both failures, propose another way, or ask. |
| **Two attempts on one fix used up**        | Stop. Show what you tried and how it failed. Ask.                                 |
| **About to touch a file outside scope**    | Stop. Ask: "in scope, or a separate PR?"                                          |
| **About to make >5 file edits in a batch** | Stop. Slice it into smaller patches.                                              |

## After the patch lands

- Report what changed, what you checked, and what the user should review.
- Wait for "next" or "looks good, continue".
- Do NOT start the next task on your own.

## When the user says otherwise

User direction wins. Say out loud which rule you are overriding, so it's visible:

> _"You said 'do everything from your side', which overrides stop-after-first-patch for this session. I'll work in batches and report at the end."_

## What this rule is NOT

- Not permission to be slow. Small steps, each one fast.
- Not permission to ask trivial questions. If the next step is obvious and easy to undo, take it.
- Not permission to leave things broken. "Stop after the first working patch" means working.
