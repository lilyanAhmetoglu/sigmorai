# Project context: Sigmorai

Durable facts that don't change week to week.

> **Current status belongs in auto-memory and the specs, not here.** Phase status and PR numbers go stale; this file is loaded on every request.

## What it is

**Sigmorai** (sigmorai.com) is a 2D pixel-art RPG web app for learning AI engineering and agentic systems. Responsive web only, no native app.

Two paths: **builder/tech** (how to design and run AI systems) and **strategist/business** (how to use AI at work). Every chapter ends in a graded scenario case. 9 realms per track (00 Bootstrap Village → 08 Production Peaks) plus the Math Tower side realm (8 floors). Each realm: 6 chapters + 1 boss; each chapter: lesson, case, quick check.

Story: the Oracle of Latentia (the model) is clouded by the Hallucinant, a fog of confident falsehood. NPC guides speak only inside parchment DialogBoxes. Everywhere else the product voice is plain and technical.

## Where to read

| Question                                   | Read                                         |
| ------------------------------------------ | -------------------------------------------- |
| What should it look like? Every screen     | `design/ui_kits/webapp/Sigmorai App.dc.html` |
| Tokens, voice, visual rules                | `DESIGN.md` + `design/tokens/`               |
| How is it built? Stack, data, build order  | `ENGINEERING.md`                             |
| Repo layout, commands, easy-to-break rules | `AGENTS.md`                                  |
| A specific feature's contract              | `docs/plans/<feature>-design-plan.md`        |
| The original brief                         | `docs/build-prompt.md`                       |
| Database conventions                       | `db/CLAUDE.md`                               |
| Lesson/case authoring                      | `content/CLAUDE.md`                          |

## Who does what

```
  ┌─────────────────┐  Server Actions (Zod + auth())   ┌──────────────────┐
  │ Next.js (Vercel)│ ───────────────────────────────▶ │ Neon Postgres    │
  │ RSC pages + HUD │                                  │ Drizzle, xp_events│
  └──┬─────────┬────┘                                  └──────────────────┘
     │ /api/mentor (stream)
     ▼
  ┌──────────────┐        GitHub Actions cron (daily)
  │ Anthropic API│ ◀──── scripts/sync-sources.ts → PR `new-level`
  └──────────────┘        (never auto-publishes)
```

## Branch model

- `canary`: the dev branch. All work lands here first. Vercel preview + prerelease channel (`1.1.0-canary.N`).
- `main`: release branch. Only gets `canary` merged in, when a real release is wanted. Vercel production + semantic-release tags.
- `feat/<name>`, `fix/<name>`, `docs/<name>`, `content/<name>`: branch from `canary`, PR back into `canary`. The sync bot's PRs are `content/new-level-<slug>`, labelled `new-level`.
- **`canary` → `main` is always a merge commit, never squash.** A squash hides the conventional commits, so semantic-release bumps the version wrong.
- **After each release on `main`, merge `main` back into `canary` right away** (PR, merge commit), or the next release PR conflicts.

Review and diff against `canary` unless told otherwise. Never push to `main` or `canary` directly.

## Decisions log

Major decisions go into `Amendments locked YYYY-MM-DD` blocks at the top of the relevant spec in `docs/plans/`. **Don't rewrite history.** Layer the new decision on top and say why the old one was dropped.

## Hard product rules

- **Grading and XP are server-only.** The leaderboard must be trustworthy.
- **The curriculum is vendor-neutral.** It teaches AI systems for Claude, OpenAI, Gemini and open models alike; a concept cites more than one vendor where it can. Lessons are built from the official docs first.
- **Lessons come from official Anthropic and OpenAI docs first, then other official sources.**
- **Content is never auto-published.** Docs-sync opens a PR; a human merges it.
- **Every lesson cites its sources.** No claim without a source; the mentor answers only from them.
- **Two voices.** Plain technical product voice; lore only in DialogBoxes.
- **No dark patterns.** No streak shaming, no paid HP refills, no loot boxes.
