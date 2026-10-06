import { z } from 'zod';
import {
  HERO_NAME_MAX,
  HERO_NAME_MIN,
  HERO_NAME_PATTERN,
  HERO_NAME_SCRIPT_GROUPS,
  RESERVED_HERO_NAMES,
  TRACKS,
} from '@/lib/constants';

/** Characters that are not part of a name's "word": "Sig-morai" and "sig morai" both match "sigmorai". */
const NAME_SEPARATORS = /[ .'_-]/gu;
const LETTER = /\p{L}/u;

/** The reserved-word key of a name: lower case, separators removed. */
export const heroNameKey = (name: string): string =>
  name.toLowerCase().replace(NAME_SEPARATORS, '');

/** True when every letter comes from one script group (HERO_NAME_SCRIPT_GROUPS). */
export function isSingleScript(name: string): boolean {
  let first: number | undefined;
  for (const char of name) {
    if (!LETTER.test(char)) continue;
    // A letter in no listed group (Kannada, Khmer, Cherokee…) shares one OTHER group (-1).
    const group = HERO_NAME_SCRIPT_GROUPS.findIndex((g) => g.test(char));
    first ??= group;
    if (group !== first) return false;
  }
  return true;
}

const RESERVED = new Set(RESERVED_HERO_NAMES.map(heroNameKey));

/**
 * The name a player picks at onboarding. Trim, then NFKC (full-width "Ａｄｍｉｎ"
 * becomes "Admin") BEFORE the length and character checks, so the checks see
 * what gets stored. The DB CHECK enforces the length too, and a unique index on
 * lower(hero_name) stops two heroes sharing a name.
 */
export const HeroNameSchema = z
  .string()
  .trim()
  .normalize('NFKC')
  .min(HERO_NAME_MIN)
  .max(HERO_NAME_MAX)
  .regex(HERO_NAME_PATTERN)
  .refine(isSingleScript, { message: 'mixed_script' })
  .refine((name) => !RESERVED.has(heroNameKey(name)), { message: 'reserved' });

/**
 * The track-picker form (lib/actions/create-hero.ts). The only two things the
 * client may send: everything else in the users row comes from the server.
 */
export const OnboardingSchema = z.object({
  heroName: HeroNameSchema,
  track: z.enum(TRACKS),
});
export type OnboardingInput = z.infer<typeof OnboardingSchema>;

/**
 * The path-switch form on /profile (lib/actions/switch-track.ts). The client
 * sends a track, nothing else. The user id comes from the session.
 */
export const SwitchTrackSchema = OnboardingSchema.pick({ track: true });
export type SwitchTrackInput = z.infer<typeof SwitchTrackSchema>;

/**
 * What switchTrack returns to useActionState. null = nothing submitted yet.
 * not_onboarded = no users row to update (no hero yet).
 */
export type SwitchTrackFormState =
  | { done: true; error?: undefined }
  | { done?: undefined; error: 'invalid_input' | 'unauthorized' | 'not_onboarded' | 'server_error' }
  | null;

/** Which onboarding field failed. The form maps it to fixed copy (ONBOARDING_TEXT). */
export type OnboardingField = keyof OnboardingInput;

/**
 * What createHero returns to useActionState. Success never returns: it
 * redirects. null = nothing submitted yet.
 */
export type OnboardingFormState = {
  /** name_taken: another hero has this name (any case). fields = ['heroName']. */
  error: 'invalid_input' | 'name_taken' | 'unauthorized' | 'server_error';
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
