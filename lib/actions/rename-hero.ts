'use server';

/**
 * renameHero: change the player's hero name (profile → Hero name).
 *
 * Public HTTP endpoint: every argument is hostile. The user id comes from
 * Clerk's session only; the form sends one name, nothing else. The name is
 * public on the leaderboard, so it passes the same HeroNameSchema as
 * onboarding (trim, NFKC, length, characters, one script, reserved words).
 *
 * Only users.hero_name (and updated_at) changes. The sprite is drawn from the
 * name (PixelAvatar seed), so it changes with it; nothing else is stored.
 * Saving the exact same name is a no-op success. A case-only change
 * ("nora" → "Nora") is saved: the unique index on lower(hero_name) sees the
 * player's own row, so it can't clash.
 */
import { auth } from '@clerk/nextjs/server';
import { and, eq, ne } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { users } from '@/db/schema';
import { HERO_NAME_UNIQUE_INDEX } from '@/lib/constants';
import { RenameHeroSchema, type RenameHeroFormState } from '@/lib/types';
import { dbErrorSummary, isUniqueViolation } from '@/lib/utils';

export async function renameHero(
  _prev: RenameHeroFormState,
  formData: FormData,
): Promise<RenameHeroFormState> {
  const { userId } = await auth();
  if (!userId) return { error: 'unauthorized' };

  const parsed = RenameHeroSchema.safeParse({ heroName: formData.get('heroName') });
  if (!parsed.success) return { error: 'invalid_input' };
  const { heroName } = parsed.data;

  try {
    // ne(): the same name writes nothing (no updated_at bump).
    const updated = await db
      .update(users)
      .set({ heroName })
      .where(and(eq(users.id, userId), ne(users.heroName, heroName)))
      .returning({ id: users.id });

    if (updated.length === 0) {
      // No row changed: either no hero yet, or the name is already this one.
      const [row] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      // Onboarding creates the row; this action never inserts.
      if (!row) return { error: 'not_onboarded' };
      return { done: true };
    }
  } catch (err) {
    const summary = dbErrorSummary(err);
    // Another hero already has this name (any case). Not a server fault, so no log line.
    if (isUniqueViolation(summary, HERO_NAME_UNIQUE_INDEX)) return { error: 'name_taken' };
    // Code + constraint only: the query error's message holds the row (id, hero name).
    console.error('[renameHero] update failed', summary);
    return { error: 'server_error' };
  }

  // The HUD, profile, leaderboard and every sprite read the name.
  revalidatePath('/', 'layout');
  return { done: true };
}
