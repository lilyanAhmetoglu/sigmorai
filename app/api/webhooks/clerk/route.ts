import { verifyWebhook } from '@clerk/nextjs/webhooks';
import { revalidateTag } from 'next/cache';
import type { NextRequest } from 'next/server';
import { eraseUser } from '@/lib/account/erase';
import { handleClerkEvent } from '@/lib/account/webhook';
import { LEADERBOARD_CACHE_TAG } from '@/lib/constants';

/**
 * Clerk webhook, for erasure only (ENGINEERING.md amendments 2026-10-05,
 * account privacy). Public: Clerk signs each call (Svix) and verifyWebhook
 * checks it with CLERK_WEBHOOK_SIGNING_SECRET, read at request time, so the
 * build needs no secret. Bad or missing signature, or no secret set: 400.
 */
export async function POST(req: NextRequest) {
  let evt;
  try {
    evt = await verifyWebhook(req);
  } catch (err) {
    console.error('[clerk webhook] verify failed', err);
    return new Response('Webhook verification failed', { status: 400 });
  }
  return handleClerkEvent(evt, eraseAndExpireBoard);
}

/**
 * Erase, then expire the leaderboard's cached top list, so a deleted hero's
 * name leaves the board now, not up to 60 s later. Also on 0 rows: the in-app
 * delete erased first and only marked the list stale. { expire: 0 }: no stale
 * copy is served (updateTag works only in Server Actions).
 */
async function eraseAndExpireBoard(userId: string): Promise<number> {
  const erased = await eraseUser(userId);
  revalidateTag(LEADERBOARD_CACHE_TAG, { expire: 0 });
  return erased;
}
