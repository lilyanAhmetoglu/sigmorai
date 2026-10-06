import type { WebhookEvent } from '@clerk/nextjs/webhooks';
import { dbErrorSummary } from '@/lib/utils';

/**
 * What the Clerk webhook does with an event that verifyWebhook already
 * checked (app/api/webhooks/clerk/route.ts). Pure, so bun test covers it.
 *
 * Only user.deleted matters: it erases the users row. Rows are never created
 * here (onboarding creates them). Any other event gets 200, so Clerk doesn't
 * retry it. A DB failure gets 500, so Clerk retries later.
 */
export async function handleClerkEvent(
  evt: WebhookEvent,
  erase: (userId: string) => Promise<number>,
): Promise<Response> {
  if (evt.type !== 'user.deleted') return new Response(null, { status: 200 });

  const userId = evt.data.id;
  // Clerk types id as optional on deleted objects. Nothing to erase without one.
  if (!userId) return new Response(null, { status: 200 });

  try {
    // 0 rows = never onboarded, or the in-app delete got there first. Both fine.
    await erase(userId);
  } catch (err) {
    console.error('[clerk webhook] erase failed', dbErrorSummary(err));
    return new Response(null, { status: 500 });
  }
  return new Response(null, { status: 200 });
}
