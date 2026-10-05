<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Sigmorai

A 2D pixel-art RPG web app for learning AI engineering and agentic systems. Next.js on Vercel, Neon Postgres, responsive web only.

**Read before working:**

- `ENGINEERING.md`: before writing code. Stack, architecture rules, data model, build order.
- `DESIGN.md` + `design/`: before touching anything a user sees. Tokens, screens, voice.

They don't overlap: engineering never makes aesthetic calls, design never makes stack calls.

## Layout

```
app/                Routes (App Router). Pages are thin: read via lib/data, render components.
  api/run/          POST code → lib/runner (E2B). Server-side grading.
  api/mentor/       Streamed mentor replies → lib/mentor.
components/         Design-system primitives, flat (pixel-button.tsx, panel.tsx, xp-bar.tsx, …).
  hud/ scenes/ map/ quest/ …   Area components. Never import the DB or a provider SDK.
lib/
  types/            Every shared type and Zod schema. Import from '@/lib/types'.
  constants/        Every constant: XP amounts, realms, flag positions, model ids.
  xp/  sprite/      Pure TS (level curve, HP, streak, avatar sprite). bun test covers these.
  utils/            Tiny shared helpers (cn). Pure TS.
  content/          MDX + challenge/case loaders, Zod frontmatter, public views.
  data/             server-only reads, scoped to auth()'s user.
  actions/          'use server' mutations: Zod → auth() → transaction → revalidatePath.
  grading/ runner/  server-only. Runner is pluggable (E2B default, fake for dev/E2E).
  mentor/           server-only. Every Anthropic call.
db/                 Drizzle schema + client (see db/CLAUDE.md).
drizzle/            Generated migrations. Never hand-edit meta/.
content/            Lessons as files (see content/CLAUDE.md).
design/             Claude Design export. Reference only; never edited by code.
scripts/            seed.ts, sync-sources.ts, set-version.ts, eval/.
e2e/                Playwright flows.
```

## Rules that are easy to break

- **One place for each thing.** Shared types → `lib/types`. Constants → `lib/constants`. Search before adding.
- **The browser never decides a grade or an XP amount.** It sends code or option indexes; the server grades.
- **User code never runs on our server.** Only `lib/runner`.
- **Hidden tests and correct answers stay server-only** (`import 'server-only'`).
- **Tokens only.** Zero radius, hard shadows, no gradients, Atkinson for reading text.
- **NPC lore only inside DialogBox.** Everything else is plain technical voice.
- **Model output is parsed with Zod** before use.

## Commands

Bun for everything (`.claude/rules/package-manager.md`; a hook blocks npm, pnpm, yarn and npx).

```bash
bun install
bun dev                  # next dev
bun run build
bun run typecheck
bun run lint
bun run test             # bun test
bun run test:e2e         # playwright
bun run format
bun run hooks:test       # guardrail hook tests
```

Run typecheck, lint, test and build before calling anything done.

Commits are Conventional Commits with a scope from `commitlint.config.js`
(`ui map quest mentor content sync auth db xp math ci deps harness`). Husky enforces it. Use `/commit`;
the approval gates are in `.claude/rules/git-safety.md`.
