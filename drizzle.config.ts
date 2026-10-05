import { defineConfig } from 'drizzle-kit';

// Migrations use the DIRECT (unpooled) url; the app uses the pooled one (db/index.ts).
// `bun run` loads .env.local, so no dotenv import is needed.
const url = process.env.DATABASE_URL_UNPOOLED;
if (!url) throw new Error('DATABASE_URL_UNPOOLED is not set');

export default defineConfig({
  dialect: 'postgresql',
  schema: './db/schema/index.ts',
  out: './drizzle',
  casing: 'snake_case',
  dbCredentials: { url },
  strict: true,
});
