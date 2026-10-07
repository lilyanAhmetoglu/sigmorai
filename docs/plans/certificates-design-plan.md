# Sigmorai — Certificates

> The contract for shareable certificates (Notion SIG-47): what a certificate proves, what is public, and how it is built in two PRs.

## Amendments locked 2026-10-07

> Amendments locked 2026-10-07 (devil + db-architect, before the first draft)
>
> - Derived, not stored. A certificate is a read over `progress` rows; no `certificates` table, no issuance action, no backfill. The boss row already proves the 6 chapter cases (open check in the same transaction), and the tower's floor 8 proves floors 1–7.
> - One new column: `users.public_id uuid not null default gen_random_uuid()`, unique index `users_public_id_idx` (migration 0006). URL `/cert/<public_id>/<achievement>`. Never the Clerk id in a URL. Select it only on the cert route and in the export.
> - Achievements in v1: realm cleared (`<track>-r<N>` = `<track>/rN/boss/challenge`) and Math Tower complete (`math-tower` = `math/f8/quick-check`). Track complete is out until the advanced tier opens (realms 6–8 are TIER_LOCKED).
> - No issue moment: the date is that row's `completed_at` (UTC day).
> - The hero name is not frozen; the page shows the current hero name, labelled "Hero name".
> - No revocation feature; account delete 404s every link. No rotation in v1 (one-line update later, with a UI warning).
> - Public data on /cert: hero name, path label, achievement title, earned date, certificate id, OG image. Never Clerk id, email, XP, level, streak. `robots: noindex` meta; no robots.txt disallow.
> - Bad id, unknown hero and not-cleared all give the same 404; parse the id with Zod uuid and build exercise ids with buildExerciseId before touching the DB.
> - LinkedIn: static "Add to profile" URL `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME` plus five copy fields (Name, Issuing organization "Sigmorai", Issue date, Credential ID, Credential URL). LinkedIn no longer autofills custom links (help answer a528030). Maintainer: a Sigmorai LinkedIn Company Page for the logo.
> - PNG only (the ImageResponse OG route doubles as download); print stylesheet for Save as PDF; no PDF dependency.
> - Depends on the share-kit PR (ShareButtons + lib/og/ loader); certificates import both.
> - Linkage trade-off accepted: one public id links a player's certificates; the HMAC-tag upgrade path needs no schema change.
> - Migration 0006: dev Neon branch by hand with `bun run db:migrate`; production before the release that ships it (the Migrate workflow runs only when DB_ENABLED is set), always with the drizzle.__drizzle_migrations row written; verify with a count query.

## Status

**STATUS: PR 1 (schema) in review. Track: all.** Nothing user-facing ships until PR 2.

## The plan

### PR 1: schema (this PR)

- `users.public_id` column and `users_public_id_idx` (`drizzle/0006_public_id.sql`).
- `db/CLAUDE.md` note: the id is a capability, never in leaderboard or HUD reads.
- Privacy page: say we store a random public id, and that certificate pages are public.
- This plan.

### PR 2: feature

- Data read in `lib/data/` (server-only): public id and achievement in, the certificate view out, or `null`.
- Pages: `/cert/<public_id>/<achievement>` with `robots: noindex`, and the print stylesheet.
- OG image route (`ImageResponse`), also the PNG download. Uses `lib/og/` from the share-kit PR.
- Profile panel: list cleared achievements, copy link, LinkedIn fields.
- Four async states on every new screen: loading, empty, error, success.
- Tests: id parsing, same 404 for the three bad cases, no private field in the view, achievement mapping.
- The data export already includes `public_id` (it selects the whole users row); add an assertion in the export test.
- Privacy page: add "Certificate pages are public: anyone with the link can see them." when the pages ship.

## Out of scope

- Track-complete certificate (until realms 6–8 open).
- A `certificates` table, issuance action or backfill.
- Revocation, id rotation, PDF generation, frozen hero names.
- LinkedIn autofill and the Company Page (maintainer task).
