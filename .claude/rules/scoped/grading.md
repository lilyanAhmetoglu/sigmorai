---
paths:
  - 'lib/grading/**'
  - 'lib/runner/**'
  - 'lib/actions/**'
  - 'lib/xp/**'
  - 'app/api/run/**'
  - 'content/**/challenge.json'
  - 'content/**/case.json'
  - 'content/**/quick-check.json'
---

# Grading, runner and XP integrity

XP and the leaderboard are only worth something if nobody can fake them. These are invariants, not style.

## The server decides

- **The browser never sends a score, a pass/fail, an XP amount or a level.** It sends code or chosen option indexes. The server grades.
- **Hidden tests, correct indexes and explanations never leave the server before submit.** Content loaders return a public view (`toPublicChallenge`, `toPublicCase`) to client components; the full object stays in server-only modules (`import 'server-only'`).
- **User code runs only in the sandbox** (`lib/runner/`, E2B by default, pluggable). Never `eval`, `new Function`, `vm`, `child_process` or `Bun.spawn` on user input anywhere in this repo. Every run has a wall-clock timeout and output size cap.

## XP is a ledger

- Every XP change is one `xp_events` row. `users.xp` is updated in the **same transaction** (or derived). Amounts come from `lib/constants` only (never from content frontmatter): +10 lesson, +150 challenge, +500 boss.
- **Award once.** A unique key (user, exercise, reason) makes a replayed clear give 0 XP. Replays are allowed; farming is not.
- `level = floor(sqrt(xp / 100))`, computed, never stored as truth.
- **HP = 3 attempts per challenge, refills daily** (UTC day boundary, decided once in `lib/xp/`). Checked and decremented on the server before the runner is called, so a failed sandbox call can't be retried for free by the client.
- **Streak** advances once per calendar day of a cleared exercise; computed from `lastActiveAt` on the server.

## Every Server Action

1. `const session = await auth()`; no session → typed error.
2. Zod-parse the input. Never trust ids from the client beyond looking them up.
3. Check the exercise is `open` for this user and track.
4. Grade / run / award inside one transaction.
5. `revalidatePath` what changed. Return a typed result, never throw raw errors to the client.

## Tests

Every rule above has a `bun test` case in `lib/xp/*.test.ts` or `lib/grading/*.test.ts`: award-once, level curve edges, HP refill at the boundary, streak across midnight, public view strips hidden fields.
