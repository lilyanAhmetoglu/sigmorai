import { verifyWebhook } from '@clerk/nextjs/webhooks';
import type { NextRequest } from 'next/server';
import { eraseUser } from '@/lib/account/erase';
import { handleClerkEvent } from '@/lib/account/webhook';

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
  return handleClerkEvent(evt, eraseUser);
}
