# db/: Drizzle schema on Neon Postgres

> Loads automatically when Claude opens a file under `db/`.

⚠️ **Run the `db-architect` agent before writing any schema change.**

## Invariants

1. **No RLS here: the server is the boundary.** Every query that touches user data filters by the session user id from `auth()`. Never by an id from the request body.
2. **Erasure is one delete.** Every user-owned table references `users(id)` with `onDelete: 'cascade'`.
3. **`xp_events` is the ledger.** The leaderboard aggregates from it (week / month / all time). `users.xp` is a cache written in the same transaction. A unique index on `(user_id, exercise_id, reason)` makes awards idempotent.
4. **Progress is per track.** `progress` is keyed `(user_id, track, exercise_id)`.
5. **Computed, not stored:** level (from xp), HP refill (from attempts + date), "NEW LEVEL" visibility (from `level_announcements.created_at`).
6. **Content lives in the repo** (`content/`), not the DB. The DB stores ids that point at it.

## Layout

- `db/schema/*.ts`: one file per table group, re-exported from `db/schema/index.ts`.
- `db/index.ts`: the Neon client + drizzle instance. `import 'server-only'`.
- `drizzle/`: generated SQL migrations + `meta/` (never hand-edit `meta/`).

## Migrations

| Task               | Command                                             |
| ------------------ | --------------------------------------------------- |
| Generate migration | `bun run db:generate` (drizzle-kit generate, named) |
| Apply locally      | `bun run db:migrate`                                |
| Check consistency  | `bunx drizzle-kit check`                            |
| Apply to prod      | CI on merge to `main` (`migrate.yml`)               |

- **Never edit an applied migration.** Generate a new one on top.
- **Never `drizzle-kit push` against production.** Push is for a throwaway Neon branch only.
- Use the **pooled** URL at runtime, the **direct** URL for migrations.
