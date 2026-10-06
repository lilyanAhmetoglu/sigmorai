/**
 * Blog view shapes and the newsletter form contract. A post's topic, realm
 * and art are derived from its linked lesson (lib/content/blog.ts); posts
 * have no tags field.
 */
import { z } from 'zod';
import { BLOG_TOPICS, NEWSLETTER_EMAIL_MAX } from '@/lib/constants';
import type { Accent } from './ui';

export type BlogTopic = (typeof BLOG_TOPICS)[number];
/** A filter value: one topic, or every post. */
export type BlogFilter = BlogTopic | 'all';

/** Where a post's lesson lives, for its label, colour and scene art. */
export type BlogPlace = {
  /** The realm or side area name: "Prompt Forest", "Math Tower", "The Frontier". */
  name: string;
  accent: Accent;
  /** Base URL of the four art layers, or null when the area has no scene (the Frontier). */
  art: string | null;
  /** Null: the post shows under ALL only. */
  topic: BlogTopic | null;
};

/** Everything a post card (list, featured, Keep reading) shows. Serialisable: it crosses to the filter client. */
export type BlogCardView = {
  slug: string;
  title: string;
  description: string;
  /** `YYYY-MM-DD`. */
  date: string;
  minutes: number;
  place: BlogPlace;
};

/** One `##` heading of a post body, for the "On this page" list. */
export type BlogHeading = { id: string; text: string };

/** The newsletter form, after trim + lower-case. Honeypot checked separately. */
export const NewsletterSchema = z.object({
  email: z.string().trim().toLowerCase().max(NEWSLETTER_EMAIL_MAX).pipe(z.email()),
});
export type NewsletterInput = z.infer<typeof NewsletterSchema>;

export type NewsletterError = 'invalid_email' | 'not_open' | 'busy' | 'server_error';

/** What subscribeNewsletter returns to useActionState. null = nothing sent yet. */
export type NewsletterFormState = { done: true } | { error: NewsletterError } | null;
