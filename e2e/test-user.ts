import { createClerkClient } from '@clerk/backend';

/**
 * The one E2E test user, on the Clerk DEVELOPMENT instance only. `+clerk_test`
 * marks it as a Clerk test address. Its `users` row is deleted before each run
 * (global.setup.ts), so onboarding always starts fresh.
 */
export const E2E_EMAIL = 'e2e+clerk_test@sigmorai.com';

/**
 * "E2E Hero" plus the last 4 characters of the Clerk id. Hero names are
 * unique, so a real player who picked plain "E2E Hero" can't block the run,
 * and the setup never has to delete anyone else's row.
 */
export const heroNameFor = (clerkId: string) => `E2E Hero ${clerkId.slice(-4)}`;

/** Get the dev-instance test user's Clerk id, or create the user on the first run. */
export async function testUserId(): Promise<string> {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) throw new Error('CLERK_SECRET_KEY is not set');
  const clerk = createClerkClient({ secretKey });
  const { data } = await clerk.users.getUserList({ emailAddress: [E2E_EMAIL] });
  if (data[0]) return data[0].id;
  const user = await clerk.users.createUser({
    emailAddress: [E2E_EMAIL],
    skipPasswordRequirement: true,
  });
  return user.id;
}
