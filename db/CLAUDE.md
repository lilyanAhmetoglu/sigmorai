# db/: Drizzle schema on Neon Postgres

> Loads automatically when Claude opens a file under `db/`.

⚠️ **Run the `db-architect` agent before writing any schema change.**

## Invariants

1. **No RLS here: the server is the boundary.** Every query that touches user data filters by the session user id from `auth()`. Never by an id from the request body.
2. **Erasure is one delete.** Every user-owned table references `users(id)` with `onDelete: 'cascade'`.
3. **`xp_events` is the ledger.** The leaderboard's week/month aggregate from `xp_events`; all-time reads `users.xp`, which must equal the ledger sum (`bun run db:check`). `users.xp` is a cache written in the same transaction. A unique index on `(user_id, exercise_id, reason)` makes awards idempotent.
4. **The track lives in the exercise id.** `progress` is keyed `(user_id, exercise_id)`; ids like `builder/r0/c1/lesson` carry the track (grammar in `content/CLAUDE.md`, helpers in `lib/content/ids.ts`). Shared Math Tower and Frontier ids have no track, so they clear and grant XP once. Realm chapters in a `content/shared-chapters.json` group credit each other on read; the progress row keeps its own track id.
5. **Computed, not stored:** level (from xp), HP refill (from attempts + date), "NEW LEVEL" visibility (from `level_announcements.created_at`).
6. **Enums are CHECK constraints or text + Zod, never Postgres enums.** Fixed sets (track, kb kind) get a CHECK built from the `lib/constants` list; growing sets (xp reason) are text + a Zod enum in `lib/types`.
7. **`users.public_id` is a capability, not an identity.** A random uuid (unique index `users_public_id_idx`) used only in certificate links (`/cert/<public_id>/<achievement>`). Select it only on the cert route, the owner's own profile certificates panel, and the export. Never in leaderboard or HUD reads. Never put the Clerk id in a URL.
8. **Content lives in the repo** (`content/`), not the DB. The DB stores ids that point at it.

## Layout

- `db/schema/*.ts`: one file per table group, re-exported from `db/schema/index.ts`.
- `db/index.ts`: the Neon client + drizzle instance. `import 'server-only'`.
- `drizzle/`: generated SQL migrations + `meta/` (never hand-edit `meta/`).
- v1 tables: `users`, `progress`, `submissions`, `xp_events`, `kb_sources`. Step 7 (mentor, amendment 2026-10-08) adds `mentor_chunks` (a derived pgvector index of lessons + cited pages, no user data, rebuilt by `bun run mentor:index`) and `mentor_usage` (one row per question, cascade from `users`); no `mentor_messages` in v1. Step 8 adds **no** tables: docs-watch keeps its page hashes in git on the `docs-watch` branch, and the other `kb_*` tables and `lesson_sources` are dropped (knowledge-base plan, amendment 2026-10-06); pgvector was dropped there too and returns for the mentor only (2026-10-08). `mentor_chunks` is a cache of `content/`: TRUNCATE + `bun run mentor:index` rebuilds it. `kb_sources` stays but nothing reads it yet; removing it is a later cleanup with db-architect.

## Migrations

| Task               | Command                                             |
| ------------------ | --------------------------------------------------- |
| Generate migration | `bun run db:generate` (drizzle-kit generate, named) |
| Apply locally      | `bun run db:migrate`                                |
| Check consistency  | `bunx drizzle-kit check`                            |
| Seed (idempotent)  | `bun run seed`                                      |
| Check the XP cache | `bun run db:check` (exit 1 if users.xp ≠ ledger)    |

Scripts run with `--conditions=react-server`: `db/index.ts` imports `server-only`, which throws outside a React Server context unless this condition is set. Don't drop the flag or the import.
| Apply to prod | CI on merge to `main` (`migrate.yml`) |

- **Never edit an applied migration.** Generate a new one on top.
- **REINDEX `users_hero_name_lower_idx` after a Postgres major upgrade.** It is an expression index on `lower(hero_name)`, and `lower()` can change with the collation library, so the unique check could go wrong. Run `REINDEX INDEX users_hero_name_lower_idx;`.
- **Never `drizzle-kit push` against production.** Push is for a throwaway Neon branch only.
- Use the **pooled** URL at runtime, the **direct** URL for migrations.
