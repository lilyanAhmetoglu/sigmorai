---
name: new-route
description: Scaffold a new Next.js 16 App Router route for Sigmorai — a React Server Component page.tsx with loading.tsx and error.tsx, data loaded on the server (Drizzle via lib/), layout built from Panel/HudBar and the design-system primitives, tokens only (no raw hex, zero radius, hard shadows), mobile reflow and 44px targets, a11y focus ring. Use when adding any new page under app/.
---

# Skill: new-route

Scaffolds a page that follows Sigmorai's conventions (AGENTS.md, DESIGN.md, `design/ui_kits/webapp/Sigmorai App.dc.html`).

## Before you start

- **Is the screen in the design reference?** Open `design/ui_kits/webapp/Sigmorai App.dc.html` and find it. Match its layout, copy and states exactly. A screen that isn't there needs the maintainer's OK first.
- Search first: `ls app components lib`, and `grep -rn "<Thing>" app components lib`.
- **Server by default.** `page.tsx` is a Server Component. Only the interactive leaf (a toggle, Monaco, a canvas scene) is a `'use client'` component in `components/`.
- **Types:** a component's own `Props` stay in its file. Shared shapes and Zod schemas go in `lib/types/` (or next to the schema that owns them).
- **Mutations are server actions** (`lib/actions/`, see the `new-server-action` skill). A page never writes to the DB from the client and never trusts a client score.

## What it produces

```
app/<route>/page.tsx      # RSC: auth + data + layout
app/<route>/loading.tsx   # skeleton in Panel shapes, no spinner gifs
app/<route>/error.tsx     # 'use client' boundary, plain technical voice, retry button
lib/queries/<thing>.ts    # only if the read query doesn't exist yet ('server-only')
```

Signed-in routes sit in the `(app)` route group under the `HudBar` layout. Public routes (`/`, `/sign-in`, `/sign-up`) don't.

## Procedure

### 1. Gather inputs

- **Route path**: e.g. `dashboard`, `realms/[realm]`, `quest/[exercise]`, `math/[floor]`
- **Auth**: `public` | `signed-in` (redirect to `/sign-in`) | `owner-only`
- **Track-aware?** Most pages read the user's current track (`builder` | `strategist`) and show per-track progress.
- **Dynamic params**: Next 16 gives `params` as a Promise. `await` it.

### 2. Validate

- The route folder doesn't exist.
- Data comes from a `server-only` query in `lib/queries/`, never a `fetch` to our own API from an RSC.
- Every dynamic param is parsed with Zod (a bad realm slug → `notFound()`).

### 3. Scaffold

Read the templates in `templates/`, substitute `{{PAGE}}`, `{{THING}}`, `{{THING_KEBAB}}`, `{{ROUTE}}`, then write:

- `templates/page.tsx.template` → `app/<route>/page.tsx`
- `templates/loading.tsx.template` → `app/<route>/loading.tsx`
- `templates/error.tsx.template` → `app/<route>/error.tsx`

Add `generateMetadata` (title `"<Thing> · Sigmorai"`).

### 4. Copy

Product copy is plain and technical, sentence case. Story/NPC lines appear **only** inside a `DialogBox`. Take copy from the design file; don't invent it.

### 5. Verify

- `bun run typecheck && bun run lint && bun run build`
- Open it in the browser at 1280px and at 375px: everything reflows (flex-wrap / auto-fit grid), no horizontal page scroll (except the level map), tap targets ≥ 44px.
- Tab through it: the focus ring is 3px Spark (`#FFC53D` via token), visible on every control.

### 6. Report

- Files created
- Reminders: all four states (loading, empty, error, success) · reading text in Atkinson Hyperlegible, pixel fonts only for headings/HUD/buttons · no raw hex, no radius, no blur shadows, no gradients · canvas scenes `aria-hidden` with a text alternative · `prefers-reduced-motion` respected
