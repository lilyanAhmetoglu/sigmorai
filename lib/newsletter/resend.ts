import 'server-only';
import { z } from 'zod';
import { NEWSLETTER_TIMEOUT_MS, RESEND_API_URL } from '@/lib/constants';

/**
 * Add one email to the newsletter at Resend (Contacts API, checked
 * 2026-10-06 at resend.com/docs/api-reference/contacts). Since Nov 2025 a
 * contact is global and the old "audiences" are "segments"; the segment id
 * is RESEND_SEGMENT_ID.
 *
 *   1. POST /contacts { email, unsubscribed: false, segments: [{ id }] }
 *   2. If Resend says the contact already exists (a 4xx whose error body
 *      {name, message} says so; Resend does not document the duplicate
 *      error, so we match the message), POST
 *      /contacts/{email}/segments/{segment_id} puts it in the segment.
 *      Any other 4xx (a validation error) is "failed".
 *
 * A contact who unsubscribed stays unsubscribed: there is no double
 * opt-in, so a stranger must not be able to switch someone's emails back on.
 *
 * One request per sign-up, no retries (Resend allows 10 requests per second
 * per team; a 429 becomes "busy"). Never logs the email.
 * Not a 'use server' file: every export there is a public endpoint.
 */

export type ResendConfig = { apiKey: string; segmentId: string };
export type AddContactResult = 'added' | 'busy' | 'failed';
type Fetch = (input: string, init: RequestInit) => Promise<Response>;

const ErrorBody = z.object({ name: z.string().optional(), message: z.string() });

/** Resend's error body says the contact exists. The wording is undocumented, so match loosely. */
async function isAlreadyThere(res: Response): Promise<boolean> {
  const body = ErrorBody.safeParse(await res.json().catch(() => null));
  return body.success && /already|exist|duplicate/i.test(body.data.message);
}

const isAuthOrServer = (status: number) => status === 401 || status === 403 || status >= 500;

async function send(fetcher: Fetch, path: string, apiKey: string, body?: unknown) {
  return fetcher(`${RESEND_API_URL}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(NEWSLETTER_TIMEOUT_MS),
    cache: 'no-store',
  });
}

export async function addContact(
  email: string,
  { apiKey, segmentId }: ResendConfig,
  fetcher: Fetch = fetch,
): Promise<AddContactResult> {
  try {
    const created = await send(fetcher, '/contacts', apiKey, {
      email,
      unsubscribed: false,
      segments: [{ id: segmentId }],
    });
    if (created.ok) return 'added';
    if (created.status === 429) return 'busy';
    if (isAuthOrServer(created.status)) {
      console.error('[newsletter] Resend create contact failed', created.status);
      return 'failed';
    }

    if (!(await isAlreadyThere(created))) {
      console.error('[newsletter] Resend create contact refused', created.status);
      return 'failed';
    }

    const path = `/contacts/${encodeURIComponent(email)}/segments/${encodeURIComponent(segmentId)}`;
    const joined = await send(fetcher, path, apiKey);
    if (joined.ok) return 'added';
    if (joined.status === 429) return 'busy';
    console.error('[newsletter] Resend add to segment failed', created.status, joined.status);
    return 'failed';
  } catch (err) {
    // Timeout or network: the name only, never the request (it holds the email).
    console.error('[newsletter] Resend request failed', (err as Error).name);
    return 'failed';
  }
}
