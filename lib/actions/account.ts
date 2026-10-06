'use server';

/**
 * deleteAccount: the in-app "delete my account" (profile → Your data).
 *
 * Public HTTP endpoint: every argument is hostile. The user id comes from
 * Clerk's session only; the form sends one confirm checkbox, nothing else.
 *
 * Order matters: our users row first (cascade wipes progress, submissions,
 * xp_events), then the Clerk account. If Clerk fails, the player keeps a
 * sign-in but no data ("not onboarded"), and pressing delete again finishes
 * the job. The other order could leave our rows behind with no owner.
 * The Clerk user.deleted webhook runs the same erase again: 0 rows, fine.
 */
import { isClerkAPIResponseError } from '@clerk/nextjs/errors';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { revalidateTag } from 'next/cache';
import { eraseUser } from '@/lib/account/erase';
import { DELETE_CONFIRM_FIELD, DELETE_CONFIRM_VALUE, LEADERBOARD_CACHE_TAG } from '@/lib/constants';
import type { DeleteAccountFormState } from '@/lib/types';
import { dbErrorSummary } from '@/lib/utils';

export async function deleteAccount(
  _prev: DeleteAccountFormState,
  formData: FormData,
): Promise<DeleteAccountFormState> {
  const { userId } = await auth();
  if (!userId) return { error: 'unauthorized' };

  // A checkbox sends its value only when ticked.
  if (formData.get(DELETE_CONFIRM_FIELD) !== DELETE_CONFIRM_VALUE) {
    return { error: 'not_confirmed' };
  }

  try {
    await eraseUser(userId);
  } catch (err) {
    console.error('[deleteAccount] erase', dbErrorSummary(err));
    return { error: 'server_error' };
  }
  // The hero is gone from the board. 'max' marks the cached top list stale
  // without re-rendering /profile (updateTag would, and bounce to onboarding);
  // the next board visit fetches it again. The Clerk webhook expires it at once.
  // Guarded: the row is already gone, so a cache error must not stop the Clerk delete.
  try {
    revalidateTag(LEADERBOARD_CACHE_TAG, 'max');
  } catch (err) {
    console.error('[deleteAccount] revalidate', err);
  }

  try {
    const client = await clerkClient();
    await client.users.deleteUser(userId);
  } catch (err) {
    // 404 = the Clerk user is already gone (deleted elsewhere): the job is done.
    if (!(isClerkAPIResponseError(err) && err.status === 404)) {
      console.error('[deleteAccount] clerk deleteUser', err);
      // No revalidatePath here on purpose: a fresh /profile would redirect a
      // player with no row to onboarding, and they'd lose this form and its
      // retry. Pressing delete again erases 0 rows and retries Clerk.
      return { error: 'clerk_error' };
    }
  }

  // No revalidatePath or redirect: a re-render of /profile would bounce to
  // onboarding first. The form signs the browser out and leaves the app,
  // which drops every cached page.
  return { done: true };
}
