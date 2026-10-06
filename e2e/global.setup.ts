import { clerkSetup } from '@clerk/testing/playwright';
import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import { test as setup } from '@playwright/test';
import { testUserId } from './test-user';

/** Same fail-closed rule as scripts/seed.ts: never touch production. */
const PRODUCTION_BRANCH = 'production';
/** The e2e and dev branches hold a handful of users. More means a real database. */
const MAX_USERS = 50;
/** scripts/seed.ts's first demo player: proof that this is a seeded test branch. */
const SEEDED_DEMO_ID = 'demo_01';

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

/** Abort unless the database looks like a seeded test branch. */
async function assertTestDatabase(sql: NeonQueryFunction<false, false>) {
  const [{ n }] = (await sql.query('select count(*)::int as n from users')) as { n: number }[];
  if (n > MAX_USERS) {
    throw new Error(`users has ${n} rows (max ${MAX_USERS}): this looks like a real database`);
  }
  const demo = await sql.query('select 1 from users where id = $1', [SEEDED_DEMO_ID]);
  if (demo.length === 0) {
    throw new Error(`no ${SEEDED_DEMO_ID} row: run \`bun run seed\` on a test branch first`);
  }
}

setup('clerk testing token + fresh test user', async () => {
  if (env('NEON_BRANCH') === PRODUCTION_BRANCH) {
    throw new Error('E2E never runs on the production branch');
  }
  // @clerk/testing does not check the key type itself, so check it here.
  if (
    !env('CLERK_SECRET_KEY').startsWith('sk_test_') ||
    !env('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY').startsWith('pk_test_')
  ) {
    throw new Error('E2E needs a Clerk development key (sk_test_ / pk_test_)');
  }
  // dotenv off: the keys come from playwright.config.ts (local) or the CI job env.
  await clerkSetup({ dotenv: false });

  // The neon() HTTP driver, not @/db: that module is server-only.
  const sql = neon(env('DATABASE_URL'));
  await assertTestDatabase(sql);
  // Only the test user's row (cascade clears its progress, XP and submissions).
  await sql.query('delete from users where id = $1', [await testUserId()]);
});
