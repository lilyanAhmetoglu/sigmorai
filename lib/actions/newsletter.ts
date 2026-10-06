'use server';

/**
 * subscribeNewsletter: the DISPATCH FROM LATENTIA box (blog list and post).
 *
 * Public HTTP endpoint, open to visitors who are not signed in, so no
 * auth(): the email is the only input. Every argument is hostile:
 *   - the honeypot field (hidden from people) must be empty; a bot that
 *     fills it gets the same success reply and nothing is sent;
 *   - the email passes NewsletterSchema (trim, lower-case, ≤ 254, valid);
 *   - with no RESEND_API_KEY or RESEND_SEGMENT_ID the action says
 *     "not open yet" and calls nothing.
 * Resend sends no confirmation email for a new contact, so success is
 * "You're on the list.", never "Check your inbox". The same reply for a
 * new or an existing address: the form never tells who is subscribed.
 * Nothing is stored in our database.
 */
import { NEWSLETTER_FIELDS } from '@/lib/constants';
import { addContact } from '@/lib/newsletter/resend';
import { NewsletterSchema, type NewsletterFormState } from '@/lib/types';

export async function subscribeNewsletter(
  _prev: NewsletterFormState,
  formData: FormData,
): Promise<NewsletterFormState> {
  const honeypot = formData.get(NEWSLETTER_FIELDS.honeypot);
  if (typeof honeypot === 'string' && honeypot.length > 0) return { done: true };

  const parsed = NewsletterSchema.safeParse({ email: formData.get(NEWSLETTER_FIELDS.email) });
  if (!parsed.success) return { error: 'invalid_email' };

  const apiKey = process.env.RESEND_API_KEY;
  const segmentId = process.env.RESEND_SEGMENT_ID;
  if (!apiKey || !segmentId) return { error: 'not_open' };

  const result = await addContact(parsed.data.email, { apiKey, segmentId });
  if (result === 'added') return { done: true };
  if (result === 'busy') return { error: 'busy' };
  return { error: 'server_error' };
}
