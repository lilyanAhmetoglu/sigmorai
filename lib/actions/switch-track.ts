'use server';

/**
 * switchTrack: change the player's path (profile → Your path).
 *
 * Public HTTP endpoint: every argument is hostile. The user id comes from
 * Clerk's session only; the form sends one track, nothing else.
 *
 * Only users.track changes. Progress is already kept per track (the exercise
 * id holds the track, db/CLAUDE.md invariant 4), so nothing is lost and
 * nothing is granted: no confirm box, no rate limit. XP, level and streak are
 * one ledger, shared by both paths. Saving the same track is a no-op success.
 */
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { updateTag } from 'next/cache';
import { db } from '@/db';
import { users } from '@/db/schema';
import { LEADERBOARD_CACHE_TAG } from '@/lib/constants';
import { SwitchTrackSchema, type SwitchTrackFormState } from '@/lib/types';
import { dbErrorSummary } from '@/lib/utils';

export async function switchTrack(
  _prev: SwitchTrackFormState,
  formData: FormData,
): Promise<SwitchTrackFormState> {
  const { userId } = await auth();
  if (!userId) return { error: 'unauthorized' };

  const parsed = SwitchTrackSchema.safeParse({ track: formData.get('track') });
  if (!parsed.success) return { error: 'invalid_input' };

  let updated: { id: string }[];
  try {
    updated = await db
      .update(users)
      .set({ track: parsed.data.track })
      .where(eq(users.id, userId))
      .returning({ id: users.id });
  } catch (err) {
    // Code + constraint only: the query error's message can hold the row.
    console.error('[switchTrack] update failed', dbErrorSummary(err));
    return { error: 'server_error' };
  }

  // No row = no hero yet. Onboarding creates it; this action never inserts.
  if (updated.length === 0) return { error: 'not_onboarded' };

  // The leaderboard shows each hero's track: expire its cache. updateTag also
  // re-renders this page and its HUD; the dashboard and realms are dynamic and
  // read the new track on the next visit.
  updateTag(LEADERBOARD_CACHE_TAG);
  return { done: true };
}
