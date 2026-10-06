import { z } from 'zod';
import { HERO_NAME_MAX, HERO_NAME_MIN, HERO_NAME_PATTERN, TRACKS } from '@/lib/constants';

/** The name a player picks at onboarding. The DB CHECK enforces the length too. */
export const HeroNameSchema = z
  .string()
  .trim()
  .min(HERO_NAME_MIN)
  .max(HERO_NAME_MAX)
  .regex(HERO_NAME_PATTERN);

/**
 * The track-picker form (lib/actions/create-hero.ts). The only two things the
 * client may send: everything else in the users row comes from the server.
 */
export const OnboardingSchema = z.object({
  heroName: HeroNameSchema,
  track: z.enum(TRACKS),
});
export type OnboardingInput = z.infer<typeof OnboardingSchema>;

/** Which onboarding field failed. The form maps it to fixed copy (ONBOARDING_TEXT). */
export type OnboardingField = keyof OnboardingInput;

/**
 * What createHero returns to useActionState. Success never returns: it
 * redirects. null = nothing submitted yet.
 */
export type OnboardingFormState = {
  error: 'invalid_input' | 'unauthorized' | 'server_error';
  fields?: OnboardingField[];
} | null;

/**
 * What deleteAccount (lib/actions/account.ts) returns to useActionState.
 * null = nothing submitted yet. done = both deletes worked; the form then
 * signs the browser out and goes home (no server redirect, so the stale
 * Clerk cookie is cleared). clerk_error = our rows are gone but the sign-in
 * account is not; a retry works.
 */
export type DeleteAccountFormState =
  | { done: true; error?: undefined }
  | { done?: undefined; error: 'not_confirmed' | 'unauthorized' | 'server_error' | 'clerk_error' }
  | null;
