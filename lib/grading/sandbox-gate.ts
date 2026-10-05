import 'server-only';
import { and, eq } from 'drizzle-orm';
import { db, type Tx } from '@/db';
import { users } from '@/db/schema';
import { capReachedText, RUN_DAILY_CAP, RUN_STALE_MS, SUBMIT_DAILY_CAP } from '@/lib/constants';
import type { QuestFailure, SandboxKind } from '@/lib/types';
import { nextUtcDayStart, utcDayKey } from '@/lib/xp/day';
import { questFailure } from './failure';

/**
 * The sandbox gate (quest-actions spec → Data model). Before every sandbox
 * call (Run and Submit), inside a short transaction that locks the user row:
 * roll the counters to today (UTC), refuse if another call holds the lock,
 * refuse at the daily cap, else count the call and take the lock. The runner
 * is called AFTER the commit, and the lock is released on any outcome.
 */

/** The users columns the gate reads. */
export type SandboxState = {
  sandboxDay: string | null;
  runCount: number;
  submitCount: number;
  sandboxPendingAt: Date | null;
};

const CAPS: Record<SandboxKind, number> = { run: RUN_DAILY_CAP, submit: SUBMIT_DAILY_CAP };

/** What a passed gate writes: today, the new counts, and the lock. */
type SandboxUpdate = {
  sandboxDay: string;
  runCount: number;
  submitCount: number;
  sandboxPendingAt: Date;
};

export type GateDecision = { ok: true; update: SandboxUpdate } | QuestFailure;

/** Pure: what to write, or why not. `now` is the lock time too. */
export function decideGate(state: SandboxState, kind: SandboxKind, now: Date): GateDecision {
  const today = utcDayKey(now);
  const sameDay = state.sandboxDay === today;
  const runCount = sameDay ? state.runCount : 0;
  const submitCount = sameDay ? state.submitCount : 0;

  const pending = state.sandboxPendingAt;
  if (pending && now.getTime() - pending.getTime() < RUN_STALE_MS) {
    return questFailure('RUN_IN_PROGRESS');
  }

  const used = kind === 'run' ? runCount : submitCount;
  const cap = CAPS[kind];
  if (used >= cap) {
    return questFailure('CAP_REACHED', capReachedText(kind, used, cap), {
      kind,
      used,
      cap,
      resetsAt: nextUtcDayStart(now).toISOString(),
    });
  }

  return {
    ok: true,
    update: {
      sandboxDay: today,
      runCount: kind === 'run' ? runCount + 1 : runCount,
      submitCount: kind === 'submit' ? submitCount + 1 : submitCount,
      sandboxPendingAt: now,
    },
  };
}

/** A taken lock. Pass `lockedAt` back to releaseSandbox. */
export type SandboxClaim = { ok: true; lockedAt: Date } | QuestFailure;

/** The gate inside the caller's transaction (Submit adds its pending row in the same one). */
export async function claimSandbox(
  tx: Tx,
  userId: string,
  kind: SandboxKind,
  now: Date,
): Promise<SandboxClaim> {
  const [row] = await tx
    .select({
      sandboxDay: users.sandboxDay,
      runCount: users.runCount,
      submitCount: users.submitCount,
      sandboxPendingAt: users.sandboxPendingAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .for('update');
  if (!row) return questFailure('NOT_ONBOARDED');

  const decision = decideGate(row, kind, now);
  if (!decision.ok) return decision;
  await tx.update(users).set(decision.update).where(eq(users.id, userId));
  return { ok: true, lockedAt: now };
}

/** The gate in its own short transaction (Run). */
export function openSandbox(
  userId: string,
  kind: SandboxKind,
  now: Date = new Date(),
): Promise<SandboxClaim> {
  return db.transaction((tx) => claimSandbox(tx, userId, kind, now));
}

/**
 * Clears the lock, only if it is still ours (a stale lock may have been
 * taken over). Never throws: on a DB error the lock goes stale after
 * RUN_STALE_MS by itself.
 */
export async function releaseSandbox(userId: string, lockedAt: Date): Promise<void> {
  try {
    await db
      .update(users)
      .set({ sandboxPendingAt: null })
      .where(and(eq(users.id, userId), eq(users.sandboxPendingAt, lockedAt)));
  } catch (error) {
    console.error('[sandbox-gate] release failed; the lock will go stale', error);
  }
}
