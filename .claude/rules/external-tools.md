# External tools: when to reach for what

| You need…                                                                            | Use                                                                                                 |
| ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| Next.js (this repo runs Next 16)                                                     | **`node_modules/next/dist/docs/`** first (see the block at the top of `AGENTS.md`), then nextjs.org |
| Current docs for a library (Auth.js v5, Drizzle, Neon, Tailwind v4, Playwright, Zod) | **context7** if connected (`resolve-library-id` → `query-docs`), else WebFetch the official docs    |
| Anthropic SDK / Claude API                                                           | the **`claude-api`** skill first, then `https://docs.claude.com`                                    |
| A vendor REST API (Resend, Vercel Blob)                                              | **WebFetch** the official docs                                                                      |
| Model pricing                                                                        | **WebFetch** the provider's live pricing page. Never trust memory.                                  |
| The design reference                                                                 | `design/` in this repo (tokens, assets, `Sigmorai App.dc.html`). Never invent a token.              |
| This codebase                                                                        | **Read / Grep / Bash**. Never web-search for what is in the repo.                                   |
| GitHub issues, PRs, releases                                                         | **`gh` CLI**. Never WebFetch a GitHub URL when `gh` works.                                          |
| News or anything else current                                                        | **WebSearch**                                                                                       |

## Why

Your training data is stale for this stack. Next.js, Auth.js, Tailwind v4 and Drizzle all moved in 2025–26. **Verify API shapes before writing code.** Don't write from remembered APIs.

## Spokenly (voice input)

The maintainer dictates with Spokenly. Ask questions with `mcp__spokenly__ask_user_dictation` when it is connected. If it isn't, use `AskUserQuestion` and say that Spokenly wasn't available.

Dictation garbles proper nouns ("cloud" = Claude, "sigma rye" = Sigmorai, "chazzy" = chazi). Read unusual words phonetically before acting on them.
