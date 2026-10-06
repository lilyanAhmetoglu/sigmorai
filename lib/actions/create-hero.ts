'use server';

/**
 * createHero: onboarding. Writes the player's users row (track + hero name),
 * then sends them on. No row = not onboarded (db/schema/users.ts).
 *
 * Public HTTP endpoint: every argument is hostile. The user id comes from
 * Clerk's session only. The client sends a track and a hero name, nothing else:
 * xp, streak and the avatar come from the column defaults.
 */
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { users } from '@/db/schema';
import { AFTER_ONBOARDING_HREF } from '@/lib/constants';
import { OnboardingSchema, type OnboardingField, type OnboardingFormState } from '@/lib/types';
import { dbErrorSummary } from '@/lib/utils';

export async function createHero(
  _prev: OnboardingFormState,
  formData: FormData,
): Promise<OnboardingFormState> {
  const { userId } = await auth();
  if (!userId) return { error: 'unauthorized' };

  const parsed = OnboardingSchema.safeParse({
    heroName: formData.get('heroName'),
    track: formData.get('track'),
  });
  if (!parsed.success) {
    const fields = [
      ...new Set(parsed.error.issues.map((issue) => issue.path[0] as OnboardingField)),
    ];
    return { error: 'invalid_input', fields };
  }

  try {
    // A second submit (double click, second tab) keeps the first row: the
    // track can't be switched here, and this is not a profile edit.
    await db
      .insert(users)
      .values({ id: userId, heroName: parsed.data.heroName, track: parsed.data.track })
      .onConflictDoNothing({ target: users.id });
  } catch (err) {
    // Code + constraint only: the query error's message holds the row (id, hero name).
    console.error('[createHero] insert failed', dbErrorSummary(err));
    return { error: 'server_error' };
  }

  // The HUD in every (app) page reads the users row.
  revalidatePath('/', 'layout');
  // Outside the try: redirect() throws to navigate.
  redirect(AFTER_ONBOARDING_HREF);
}
