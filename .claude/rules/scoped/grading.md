---
paths:
  - 'lib/grading/**'
  - 'lib/actions/**'
  - 'lib/xp/**'
  - 'content/**/case.json'
  - 'content/**/quick-check.json'
---

# Grading and XP integrity

XP and the leaderboard are only worth something if nobody can fake them. These are invariants, not style.

## The server decides

- **The browser never sends a score, a pass/fail, an XP amount or a level.** It sends a seed and option indexes. The server grades.
- **Correct indexes and explanations never leave the server before submit.** Content loaders return a public view (`toPublicCase`) to client components; the full object stays in server-only modules (`import 'server-only'`).

## XP is a ledger

- Every XP change is one `xp_events` row. `users.xp` is updated in the **same transaction** (or derived). Amounts come from `lib/constants` only (never from content frontmatter): +10 lesson, +150 case (reason `challenge`), +500 boss.
- **Award once.** A unique key (user, exercise, reason) makes a replayed clear give 0 XP. Replays are allowed; farming is not.
- `level = floor(sqrt(xp / 100)) + 1` (a new player is LV 1), computed, never stored as truth.
- **HP = 3 attempts per case, refills at the UTC day boundary** (decided once in `lib/xp/`). Checked and decremented on the server inside the grading transaction.
- **Streak** advances once per calendar day of a cleared exercise; computed from `lastActiveAt` on the server.

## Every Server Action

1. `const session = await auth()`; no session → typed error.
2. Zod-parse the input. Never trust ids from the client beyond looking them up.
3. Check the exercise is `open` for this user and track.
4. Grade / run / award inside one transaction.
5. `revalidatePath` what changed. Return a typed result, never throw raw errors to the client.

## Tests

Every rule above has a `bun test` case in `lib/xp/*.test.ts` or `lib/grading/*.test.ts`: award-once, level curve edges, HP refill at the boundary, streak across midnight, public view strips hidden fields.
