import { createClerkClient } from '@clerk/backend';
import { clerkSetup } from '@clerk/testing/playwright';
import { neon } from '@neondatabase/serverless';
import { test as setup } from '@playwright/test';
import { E2E_EMAIL } from './test-user';

/** Same fail-closed rule as scripts/seed.ts: never touch production. */
const PRODUCTION_BRANCH = 'production';

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

/** Get the dev-instance test user, or create it on the first run. */
async function testUserId(): Promise<string> {
  const clerk = createClerkClient({ secretKey: env('CLERK_SECRET_KEY') });
  const { data } = await clerk.users.getUserList({ emailAddress: [E2E_EMAIL] });
  if (data[0]) return data[0].id;
  const user = await clerk.users.createUser({
    emailAddress: [E2E_EMAIL],
    skipPasswordRequirement: true,
  });
  return user.id;
}

setup('clerk testing token + fresh test user', async () => {
  const branch = env('NEON_BRANCH');
  if (branch === PRODUCTION_BRANCH) throw new Error('E2E never runs on the production branch');
  // Throws on a production (sk_live_) secret key.
  // dotenv off: the keys come from playwright.config.ts (local) or the CI job env.
  await clerkSetup({ dotenv: false });

  const id = await testUserId();
  // Only the test user's row (cascade clears its progress, XP and submissions).
  // The neon() HTTP driver, not @/db: that module is server-only.
  const sql = neon(env('DATABASE_URL'));
  await sql.query('delete from users where id = $1', [id]);
});
