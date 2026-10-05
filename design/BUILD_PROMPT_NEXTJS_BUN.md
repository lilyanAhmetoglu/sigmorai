# Sigmorai: build prompt (Next.js + Bun)

Paste everything below the line into Claude Code (or another coding agent) at the root of an empty folder. Copy this design project's `assets/`, `tokens/` and `ui_kits/webapp/Sigmorai App.dc.html` into a `design/` folder first, so the agent has a reference for every screen.

---

You are building **Sigmorai** (sigmorai.com). It's a 2D pixel-art RPG web app for learning AI engineering and agentic systems. It is responsive web only; there is no native app. The design reference is in `./design/`:
- `design/ui_kits/webapp/Sigmorai App.dc.html`: every screen, interaction and piece of copy
- `design/tokens/*.css`: colors, type, spacing, effects (copy these verbatim)
- `design/assets/`: logo, sprites, level SVGs, art prompts

Match the visuals exactly. Don't invent new colors, fonts or radii.

## Stack
- **Runtime/package manager:** Bun (`bun create next-app`, `bun install`, `bun run dev`, `bun test`)
- **Framework:** Next.js 15, App Router, React Server Components, TypeScript strict, Server Actions
- **Styling:** Tailwind CSS v4. Map every CSS variable from `design/tokens` into `@theme`, and keep the raw `--*` vars in `app/globals.css`. Zero border-radius globally. Use utilities for `shadow-notch`, `shadow-drop`, `bevel` and `bevel-pressed`.
- **Fonts:** `next/font/google`: Pixelify Sans (display), Silkscreen (HUD), Atkinson Hyperlegible (body), JetBrains Mono (code). Turn ligatures off globally.
- **DB:** Postgres (Neon) with Drizzle ORM and drizzle-kit migrations
- **Auth:** Auth.js v5 (NextAuth) with GitHub, Google and email magic-link
- **Code editor:** Monaco (`@monaco-editor/react`), lazy-loaded
- **Code execution:** run challenges in a sandbox. Use an `/api/run` route that calls a pluggable runner. Default to Judge0 or E2B; do NOT eval user code on the server.
- **Storage:** Vercel Blob or S3 for avatar uploads
- **AI mentor:** Anthropic SDK (`@anthropic-ai/sdk`), streamed. Answers are grounded only in the current lesson's source docs.
- **Validation:** Zod everywhere (forms, API, content schemas)
- **Testing:** `bun test` for units, Playwright for main flows

## Product model
- **Two paths (tracks):** `builder` (technical: levels end in a code challenge checked by tests) and `strategist` (business: levels end in a decision case graded as a multi-choice scenario). The user picks one at sign-up and can switch from the HUD toggle. Progress is stored per track.
- **9 realms per track + Math Tower (side realm, 8 floors).** Realms 00–08: Bootstrap Village, Prompt Forest, Tool Forge, Context Library, Agent Citadel, MCP Bridgelands, Eval Arena, Swarm Spire, Production Peaks. Each realm has 6 chapters and 1 boss. Each chapter has 3 exercises: lesson, challenge, quick check.
- **Gamification:**
  - XP: +10 per lesson, +150 per cleared challenge, +500 per boss
  - Level = floor(sqrt(xp/100))
  - Daily streak
  - HP = 3 attempts per challenge; it refills daily
  - Leaderboard by week, month and all time
- **Story:** the Oracle of Latentia (the model) is clouded by the Hallucinant, a fog of confident falsehood. Each realm has an NPC guide whose lines appear only inside parchment DialogBoxes. The product voice stays plain and technical.
- **Avatar:** a deterministic 8×8 symmetric sprite seeded by username (port the `sprite()` function from the design file), or an uploaded photo shown with `image-rendering: pixelated`.

## Content pipeline (the docs-sync "workflow")
- Content lives in `content/<track>/<realm>/<chapter>/*.mdx` with frontmatter validated by Zod: `id, title, xp, minutes, sources[{kind:'docs'|'repo', title, url}], sourceHash`.
- Challenges: `challenge.json` (starter code, language, visible + hidden tests) for builder; `case.json` (scenario, questions, options, correct index, explanations) for strategist.
- **Sync job:** `scripts/sync-sources.ts` (run with `bun run sync`, scheduled daily via GitHub Actions cron):
  1. Fetch the official Anthropic docs, the OpenAI docs and a list of high-star GitHub repos (from `content/sources.yaml`). Use sitemaps or llms.txt where available, and GitHub releases/README for repos.
  2. Hash each page and diff it against the stored `sourceHash`.
  3. For new or changed pages, use Claude to draft a new or updated chapter MDX + challenge. Open it as a **PR labelled `new-level`**; never auto-publish.
  4. After merge, insert a `level_announcements` row so the map shows a "NEW LEVEL" banner.

## Data model (Drizzle)
- `users(id, name, email, image, heroName, track, xp, streak, lastActiveAt, createdAt)`
- `progress(userId, track, realmId, chapterId, exerciseId, status: 'locked'|'open'|'done', attempts, completedAt)`
- `submissions(id, userId, exerciseId, code|answers jsonb, passed, results jsonb, createdAt)`
- `xp_events(id, userId, amount, reason, createdAt)` (the leaderboard aggregates from this)
- `level_announcements(id, track, realmId, chapterId, title, source, createdAt)`
- `mentor_messages(id, userId, exerciseId, role, content, createdAt)`

## Routes (App Router)
- `/`: landing with a live canvas hero (see below), "Two paths" cards, Popular realms, Story, How you pass
- `/sign-in`, `/sign-up`: track picker plus a hero-name field with a live sprite preview
- `/dashboard`: welcome banner, Continue learning, Your realms, Stats, Daily quest, Math Tower shortcut
- `/realms`: catalog with a track toggle and Beginner/Intermediate/Advanced filters
- `/realms/[realm]`: detail page with hero, expandable chapters, NPC lore, "Built from" sources
- `/map/[realm]`: **side-scrolling level** (see below)
- `/quest/[exercise]`: builder = lesson | Monaco editor | test runner | Console / Ask Mentor tabs; strategist = lesson | case file with graded choices
- `/math`, `/math/[floor]`
- `/leaderboard`, `/profile`, `/profile/edit`

## Key components (put them in `components/`, matching the design-system names)
PixelButton (primary/xp/success/secondary/danger/ghost; sm/md/lg; presses 2px), Panel (notched; HUD title tab; tones default/sunken/raised/story), Badge, XPBar (segmented, never smooth), PixelAvatar, TextField, Choice (correct/wrong states), LevelNode, QuestCard, DialogBox, TestResult, Toast, Tabs, TrackToggle, HudBar (sticky top: logo, nav, track toggle, XP, streak, avatar).

## Canvas scenes (client components)
1. **`<HeroScene />`** on the landing page: port `startHero()` from the design file into a `useEffect` + `requestAnimationFrame` hook.
   - Internal resolution 160px tall, scaled with `image-rendering: pixelated`.
   - Parallax layers from `/public/art/hero-{sky,far,mid,near}.png`, tiled seamlessly, with the procedural fallback when they're missing.
   - The auto-playing hero jumps for books (+10 XP), hits Σ blocks that pop concept words, and fact-checks Hallucinant ghosts with a bolt.
   - Pause when off-screen (IntersectionObserver). Show a static frame under `prefers-reduced-motion`.
2. **`<LevelMap />`** at `/map/[realm]`: a 2048×480 scrollable level using `/public/levels/realm-XX.svg`.
   - Flags at x = [4,11,19,27,35,44] × 32 + 16 and the boss castle at 1840.
   - Clicking a flag walks the hero sprite there (800ms, `steps(16)`, flipped when moving left) and auto-scrolls.
   - The selected-level card shows status and an Enter/Replay/Locked button.

## Rules
- Inline the token values from `design/tokens`. Hard offset shadows only, never blur. No gradients except the text-legibility fade on scenes.
- Reading text always uses Atkinson Hyperlegible; pixel fonts are only for headings, HUD and buttons.
- Mobile web: every layout reflows (flex-wrap/auto-fit). The level map scrolls horizontally. Tap targets are at least 44px.
- Accessibility: focus ring = 3px Spark (#FFC53D). Canvas scenes get `aria-hidden`, with a text alternative.
- Server Actions for progress/XP mutations, always re-validated server-side. Grading happens on the server only.
- Seed script `bun run seed` adds 2 tracks × 9 realms, realm 02 fully authored (6 chapters), the Math Tower floors, and 8 demo users for the leaderboard.

## Deliverables, in order
1. Scaffold + tokens + fonts + HudBar + landing (static hero first, then canvas)
2. Auth + track picker + profile/avatar
3. DB schema + seed + dashboard + realms catalog + realm detail
4. Level map
5. Quest page: builder (Monaco + runner) and strategist (case grading), plus the XP/HP/streak logic
6. Leaderboard + Math Tower
7. AI mentor
8. Docs-sync script + GitHub Action
9. Playwright tests: sign up → pick track → clear a level → see XP on the leaderboard

Before you start, list your plan and any decisions you need from me (runner provider, hosting). Then build step by step and run `bun run build` after each step.
