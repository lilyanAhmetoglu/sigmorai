# ENGINEERING.md: Sigmorai

How Sigmorai is built. Stack, architecture rules, data model, build order. The founding brief is `docs/build-prompt.md`; this file wins where they differ. Never makes aesthetic calls (that's `DESIGN.md`).

## Amendments locked 2026-10-06 (leaderboard)

- **Public `/leaderboard` (SIG-20).** RSC page with loading, error and empty states. The range is a link (`?range=week|month|all`), not client Tabs; anything else means `all`. Top 25 per range, cached 60 s (`unstable_cache`: `cacheComponents` is off, and `'use cache'` needs it). The viewer's own rank is read fresh and never cached.
- **All time reads `users.xp`; week/month aggregate `xp_events`.** This replaces "the leaderboard aggregates from the ledger for all three ranges". `users.xp` must equal the ledger sum (`bun run db:check`). Week/month are rolling UTC-day windows: cutoff = `utcDayStart(now)` − 6 / − 29 days (`lib/xp/leaderboard.ts`), passed to SQL as a parameter.
- **Tie order everywhere:** xp desc, `users.created_at` asc, `users.id` asc. No shared ranks. All-time rank = 1 + count(xp > mine) + count(xp = mine and (created_at, id) < mine). Week/month: one CTE with `row_number()` over the window totals, `where rank <= 25 or id = me`. No XP in the range → "no XP" text instead of a rank.
- **Rows carry only rank, hero name, track, level (computed) and XP.** Never the Clerk id, `avatar_url` or `last_active_at`. The viewer's row is marked with text ("YOU"), not colour only.
- **Schema (migration 0004_leaderboard):** `users_xp_idx` → `users_leaderboard_idx (xp desc, created_at, id)`; new unique `users_hero_name_lower_idx` on `lower(hero_name)`. Hero names are trimmed + NFKC-normalised before the checks, use one script group, and can't be a reserved word (`RESERVED_HERO_NAMES`). A name clash returns `name_taken` from `createHero`.

## Amendments locked 2026-10-05 (account privacy)

- One Clerk webhook, for erasure only. POST /api/webhooks/clerk verifies with verifyWebhook (CLERK_WEBHOOK_SIGNING_SECRET) and on user.deleted deletes the users row (cascade). 'No webhook' still holds for row creation: rows are created by onboarding, never by a webhook.
- In-app delete is the primary path. deleteAccount (Server Action): DB row first, then clerkClient().users.deleteUser, so a failure never leaves an orphan row. Both paths are idempotent.
- Export is a GET route handler (/api/account/export, JSON attachment), because a download needs headers a Server Action can't set.
- No Terms page yet; the privacy page lists Clerk, Neon, Vercel. Anthropic is added in the mentor PR. Regions are read from the dashboards, never written from memory.

## Amendments locked 2026-10-05 (no-code pivot)

- **No code runner, no code editor.** The 2026-10-04 "Runner: E2B … fake runner" line is superseded. Stack rows "Editor: Monaco" and "Code runs: E2B via /api/run" are removed. `e2b` leaves package.json; `E2B_API_KEY` and `CODE_RUNNER` leave `.env.example`, `e2e.yml` and `eslint.config.mjs` (those code edits land in PR 2).
- **Build order step 5:** "Quest page: graded scenario cases on both tracks + quick checks, plus XP/HP/streak logic."
- **"UI never imports a provider"** keeps DB, Anthropic and Blob; E2B is removed from the list.
- **Data model:** `users` loses the four sandbox columns (migration 0003); `submissions.payload` is always `{ seed, answers, order }`. **`submissions` is graded at insert.** `status` is `passed` | `failed` with no default; `graded_at` is dropped (it always equalled `created_at`) and `submissions_graded_check` goes with it; `results` becomes NOT NULL. HP spent today = `failed` rows since 00:00 UTC, served by the existing `submissions_user_exercise_idx`. Migration 0003 (db-architect approved 2026-10-05); 0002 is never edited.

## Amendments locked 2026-10-05

- **Auth: Clerk, not Auth.js v5.** Decided by the maintainer: no home-made login. `@clerk/nextjs`, `proxy.ts` with `clerkMiddleware()` (Next 16 name), `await auth()` on the server. Proposed for the schema ticket (db-architect confirms): `users.id` = the Clerk user id (text), row created on first need (upsert), no webhook, no Auth.js adapter tables (`accounts`, `sessions`, `verification_tokens`). Free plan: 50k monthly retained users, up to 3 social logins, email links. The Auth.js lines below are superseded.
- **Neon: work on the `dev` branch** (project `late-haze-29496360`). `production` is touched only by deploys. `neon.ts` is the CLI project marker (branch policy comes with the schema ticket); `neon link` writes `DATABASE_URL` into `.env.local`.

## Amendments locked 2026-10-04

- **Next.js 16, not 15.** `bun create next-app` installs 16.x (current stable). App Router, RSC, Server Actions and async `params` are the same model; read `node_modules/next/dist/docs/` before using an API. Pinning 15 would start the project on an old major for no gain.
- **Runner: E2B** (`e2b` / `@e2b/code-interpreter`) behind `lib/runner/` (`CodeRunner` interface). A `fake` runner exists for dev and E2E only (`CODE_RUNNER=fake`), and never in production.
- **Hosting: Vercel + Neon.** Avatars in Vercel Blob. Vercel Git integration deploys `canary` → preview, `main` → production.
- **Unit tests use `bun test`** (not vitest). Playwright for E2E.

## Stack

| Concern    | Pick                                                                                 |
| ---------- | ------------------------------------------------------------------------------------ |
| Runtime/PM | Bun                                                                                  |
| Framework  | Next.js 16, App Router, RSC, Server Actions, TypeScript strict                       |
| Styling    | Tailwind CSS v4, tokens from `design/tokens` in `@theme`                             |
| Fonts      | `next/font/google`: Pixelify Sans, Silkscreen, Atkinson Hyperlegible, JetBrains Mono |
| DB         | Neon Postgres + Drizzle ORM + drizzle-kit                                            |
| Auth       | Auth.js v5: GitHub, Google, email magic link (Resend)                                |
| Editor     | `@monaco-editor/react`, lazy-loaded (client only)                                    |
| Code runs  | E2B sandbox via `/api/run` → `lib/runner/`                                           |
| Uploads    | Vercel Blob                                                                          |
| Mentor     | `@anthropic-ai/sdk`, streamed, grounded in lesson sources                            |
| Validation | Zod everywhere                                                                       |
| Tests      | `bun test` (units), Playwright (flows)                                               |

## Architecture rules

- **Server is the boundary.** No RLS; every data access goes through `lib/data/` (reads) or `lib/actions/` (writes), both `server-only`, both scoped to `auth()`'s user.
- **UI never imports a provider.** `components/**` and pure `lib/` modules can't import the DB, E2B, Anthropic or Blob SDKs (ESLint `no-restricted-imports`).
- **Grading, XP, HP, streak: server only** (`.claude/rules/scoped/grading.md`).
- **Content is files, progress is rows.** `content/` in git; DB stores ids.
  - Keep `outputFileTracingIncludes` for `content/**` in `next.config.ts`: the `lib/content` loaders read `content/` from disk at runtime, so server routes must ship it.
- **One place per thing.** Shared types/Zod → `lib/types`. Constants (XP amounts, flag positions, model ids) → `lib/constants`.

## Data model

See `docs/build-prompt.md` → Data model, plus the Auth.js adapter tables (`accounts`, `sessions`, `verification_tokens`). Invariants in `db/CLAUDE.md`.

## Build order

1. Scaffold + tokens + fonts + HudBar + landing (static hero first, then canvas)
2. Auth + track picker + profile/avatar
3. DB schema + seed + dashboard + realms catalog + realm detail
4. Level map
5. Quest page: graded scenario cases on both tracks + quick checks, plus XP/HP/streak logic
6. Leaderboard + Math Tower
7. AI mentor (+ eval corpus)
8. Docs-sync script + GitHub Action
9. Playwright: sign up → pick track → clear a level → see XP on the leaderboard

`bun run build` must pass after every step.

## Environment

Every variable is documented in `.env.example`. Server secrets never get `NEXT_PUBLIC_` (a hook blocks it).
