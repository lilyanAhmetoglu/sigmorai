---
name: nextjs-best-practices
description: Scans Sigmorai code for Next.js 16 App Router / React 19 / Tailwind v4 anti-patterns — wrong server/client boundaries, Server Action mistakes, caching surprises, deprecated APIs, non-lazy heavy client code. Run after implementing a feature or page. Report only.
tools: Read, Glob, Grep, WebSearch, WebFetch
model: sonnet
---

Audit Sigmorai for Next.js / React issues. Report only, do NOT fix. **Verify against the current Next.js docs** (`https://nextjs.org/docs`, `https://nextjs.org/docs/llms.txt` if present) and the Auth.js v5 / Tailwind v4 / Drizzle docs before calling anything deprecated. Your memory of these libraries is out of date.

## Checks

**Server / client boundaries**

- Server Components by default. `"use client"` only on the smallest leaf that needs state, effects, event handlers, canvas or Monaco. Flag a `"use client"` page or layout.
- No server-only module (db, Auth.js `auth()`, Anthropic/E2B SDKs, secrets) imported into a client file. Server modules carry `import "server-only"`.
- Props passed from server to client components are serialisable; no functions except Server Actions.
- No `NEXT_PUBLIC_` on a server secret.

**Next.js 16 APIs**

- `params` and `searchParams` are Promises in pages/layouts/route handlers: `await` them.
- `cookies()`, `headers()`, `draftMode()` are async.
- Fetch and route handlers are not cached by default in 15; caching is explicit (`"use cache"` / `revalidate` / `revalidatePath` / `revalidateTag`). After a progress/XP mutation the affected paths or tags are revalidated.
- `next/font/google` for all four fonts, applied as CSS variables; no `<link>` to Google Fonts; ligatures off globally.
- `next/image` for raster art, with `unoptimized` or a pixel-safe config where scaling would blur pixel art; `image-rendering: pixelated`.
- Metadata via the `metadata` export / `generateMetadata`, not manual `<head>`.
- `loading.tsx`, `error.tsx`, `not-found.tsx` where a route can be slow, fail or miss.

**Server Actions and route handlers**

- Every action starts with `const session = await auth()` and fails closed.
- Input parsed with Zod; user id from the session only.
- Grading, XP, HP and streak changes happen in the action/handler, inside a DB transaction.
- `/api/run` and `/api/mentor` set `runtime`/`maxDuration` deliberately and stream where the spec says so.

**Heavy client code**

- Monaco loaded with `next/dynamic` (`ssr: false`) only on the quest page.
- Canvas scenes (`HeroScene`, `LevelMap`) are client components with rAF cleanup on unmount, IntersectionObserver pause, and a static frame under `prefers-reduced-motion`.
- No large libraries pulled into the shared client bundle.

**React 19**

- `ref` as a prop, not `forwardRef`.
- No reading `ref.current` during render; no synchronous `setState` in an effect body (derive instead).
- `useActionState` / `useFormStatus` for form pending state instead of hand-rolled flags.
- Lists have stable keys.

**Styling (Tailwind v4)**

- Tokens come from `@theme` (mapped from `design/tokens`). No raw hex, no arbitrary radius, no `shadow-*` with blur, no gradients except the scene legibility fade.
- `@/` alias imports, never deep `../../`.

## Output

```
## <file>
- [CRITICAL/WARNING/SUGGESTION] Description — why it matters
### Passed: what looks good
```

End with totals. Explain WHY each issue matters in plain A2 English.
