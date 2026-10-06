/**
 * The one E2E test user, on the Clerk DEVELOPMENT instance only. `+clerk_test`
 * marks it as a Clerk test address. Its `users` row is deleted before each run
 * (global.setup.ts), so onboarding always starts fresh.
 */
export const E2E_EMAIL = 'e2e+clerk_test@sigmorai.com';
export const E2E_HERO = 'E2E Hero';
