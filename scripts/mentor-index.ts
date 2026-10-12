// `bun run mentor:index` (mentor plan, Phase 1): chunks every lesson.mdx and
// every page a lesson cites, embeds only new chunks with Voyage, and syncs
// `mentor_chunks`. A second run with no change embeds 0 and writes 0 rows.
// A failed page fetch keeps that page's old rows and never fails the run.
//
// Env: VOYAGE_API_KEY · DATABASE_URL_UNPOOLED (direct URL: long transactions,
// like migrations). `bun run` loads .env.local for a local run.
import { writeFile } from 'node:fs/promises';
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from '@/db/schema';
import { embedTexts } from '@/lib/mentor/embed';
import { buildIndex, drizzleStore, formatSummary } from '@/lib/mentor/index-build';

const apiKey = process.env.VOYAGE_API_KEY;
const url = process.env.DATABASE_URL_UNPOOLED;
const missing = [!apiKey && 'VOYAGE_API_KEY', !url && 'DATABASE_URL_UNPOOLED'].filter(Boolean);
if (!apiKey || !url) {
  console.error(`mentor-index: missing ${missing.join(' and ')}. Nothing was indexed.`);
  process.exit(1);
}

const pool = new Pool({ connectionString: url });
pool.on('error', (err: Error) => console.error('db pool error', err));
const db = drizzle({ client: pool, schema, casing: 'snake_case' });

try {
  const summary = await buildIndex({
    store: drizzleStore(db),
    embed: (texts) => embedTexts(texts, 'document', { apiKey }),
    log: (line) => console.log(line),
  });
  const text = formatSummary(summary);
  console.log(text);
  if (process.env.GITHUB_STEP_SUMMARY) {
    await writeFile(process.env.GITHUB_STEP_SUMMARY, `\`\`\`\n${text}\n\`\`\`\n`, { flag: 'a' });
  }
} catch (err) {
  // An embed or DB failure stops the run. Documents already written stay; the next run continues.
  console.error('mentor-index failed:', err instanceof Error ? err.message : err);
  process.exitCode = 1;
} finally {
  await pool.end();
}
