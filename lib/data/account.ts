import 'server-only';
import { currentUser } from '@clerk/nextjs/server';
import { asc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { progress, submissions, users, xpEvents } from '@/db/schema';

/**
 * Everything we hold about one player, for the "download your data" file
 * (app/api/account/export). Our rows (users, progress, submissions,
 * xp_events) plus the id and email Clerk holds; we don't store the email.
 * Pass only the id from auth(), never one from the request.
 */
export async function exportAccount(userId: string) {
  const [clerkUser, userRows, progressRows, submissionRows, xpRows] = await Promise.all([
    // A Clerk outage must not block the export: the email just becomes null.
    currentUser().catch((err: unknown) => {
      console.error('[exportAccount] currentUser', err);
      return null;
    }),
    db.select().from(users).where(eq(users.id, userId)).limit(1),
    db
      .select()
      .from(progress)
      .where(eq(progress.userId, userId))
      .orderBy(asc(progress.completedAt)),
    db
      .select()
      .from(submissions)
      .where(eq(submissions.userId, userId))
      .orderBy(asc(submissions.createdAt)),
    db.select().from(xpEvents).where(eq(xpEvents.userId, userId)).orderBy(asc(xpEvents.createdAt)),
  ]);

  // currentUser() reads the same session as auth(); the id check is a guard.
  const email =
    clerkUser?.id === userId ? (clerkUser.primaryEmailAddress?.emailAddress ?? null) : null;

  return {
    exportedAt: new Date().toISOString(),
    identity: { id: userId, email },
    // null = signed in but never onboarded: we hold no rows.
    user: userRows[0] ?? null,
    progress: progressRows,
    submissions: submissionRows,
    xpEvents: xpRows,
  };
}
