---
name: new-server-action
description: Scaffold a Sigmorai server mutation — a Next.js Server Action in lib/actions/ (Zod-validated input, auth() session check, server-side grading, XP written as xp_events in one transaction, revalidatePath) or, for streamed/long work (AI mentor, E2B runner), a route handler in app/api/. Use when adding anything that writes progress, XP, submissions, profile data, or calls a model or the code runner.
---

# Skill: new-server-action

## Pick the kind

| Kind     | Use for                                                                                              | Template                    |
| -------- | ---------------------------------------------------------------------------------------------------- | --------------------------- |
| `action` | Form/button mutations: complete lesson, submit case answers, switch track, edit profile, claim quest | `server-action.ts.template` |
| `route`  | Streams or long calls: `/api/mentor` (Anthropic stream), `/api/run` (E2B runner)                     | `route-handler.ts.template` |

Server Actions are public HTTP endpoints. Treat every argument as hostile.

## Rules (non-negotiable)

- **Zod-parse every input** at the top. Never trust a client-sent score, XP amount, `passed` flag, track or user id.
- **`auth()` first.** No session → `{ ok: false, error: 'unauthorized' }`. The user id comes from the session only.
- **Grading happens here.** Builder: run hidden tests through `lib/runner/` (E2B) and decide `passed` on the server. Strategist: compare answers to `case.json` on the server. The client never receives hidden tests or correct indexes before submitting.
- **User code is never evaluated on our server.** It only goes to the runner.
- **XP is an `xp_events` row**, written in the same `db.transaction` as the `progress`/`submissions` change, with an idempotency guard (one +150 per exercise per user, one +500 per boss). `users.xp` is derived/updated inside that transaction. Amounts come from `lib/xp/` constants, never literals.
- **HP**: check and decrement attempts on the server; refill is computed from dates, not a cron.
- **`revalidatePath`** every page that shows what changed (`/dashboard`, `/leaderboard`, `/realms/[realm]`, `/map/[realm]`).
- **Return a typed result** (`{ ok: true, data } | { ok: false, error }`). Errors are plain technical copy; NPCs never deliver failures.
- Model calls go through `lib/mentor/` (timeout, retry, token logging, grounded only in the lesson's sources). Prompts live in `prompts/`, never inline.

## Procedure

### 1. Gather inputs

- **Name**: verb-first camelCase (`completeLesson`, `submitChallenge`, `gradeCase`, `switchTrack`, `updateProfile`)
- **Kind**: `action` or `route`
- **Touches XP / progress / submissions?** Then it's grading code: `lib/grading/` and the CTO review can't be skipped.
- **Calls a model or the runner?** Then the scoped mentor-eval rule applies (model), or the runner timeout/limits section in ENGINEERING.md (E2B).

### 2. Validate

- Search `lib/actions/` and `app/api/` for an existing action that already does it.
- File doesn't exist. Name matches `^[a-z][a-zA-Z0-9]*$`.

### 3. Scaffold

- `action` → read `templates/server-action.ts.template`, substitute `{{NAME}}`, `{{NAME_KEBAB}}`, write `lib/actions/{{NAME_KEBAB}}.ts`.
- `route` → read `templates/route-handler.ts.template`, substitute, write `app/api/<name>/route.ts`.

### 4. Wire it up

- New secrets: add the **name** to `.env.example` with a comment ("server-only, set in Vercel"). Never `NEXT_PUBLIC_` a secret.
- Unit-test the pure part (grading, XP maths, HP refill) with `bun test` in `lib/**/*.test.ts`.

### 5. Verify

```bash
bun run typecheck && bun run lint && bun test && bun run build
```

### 6. Report

- Files created
- Secrets to set in Vercel (preview + production)
- Paths revalidated
- If it calls a model: eval cases to add and `voice-guardian` on the prompt
