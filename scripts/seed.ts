// `bun run seed`: mirrors content/sources.yaml into kb_sources and, outside
// production, adds 8 demo players for the leaderboard. Idempotent: safe to rerun.
import { eq, notInArray, sql } from 'drizzle-orm';
import { db } from '@/db';
import { kbSources, progress, users, xpEvents } from '@/db/schema';
import { CHAPTER_COUNT, CHAPTER_STEPS, KB_SOURCES_FILE, XP_REWARDS } from '@/lib/constants';
import { buildExerciseId } from '@/lib/content/ids';
import { loadKbSources } from '@/lib/content/load';
import type { Track, XpReason } from '@/lib/types';

/** Neon branch that must never get demo players (ENGINEERING.md). */
const PRODUCTION_BRANCH = 'production';
/** Demo players clear chapters in this realm (Bootstrap Village). */
const DEMO_REALM = 0;

type Demo = { heroName: string; track: Track; chapters: number; streak: number };
const DEMOS: Demo[] = [
  { heroName: 'Ada Lovelace', track: 'builder', chapters: 6, streak: 12 },
  { heroName: 'Grace Hopper', track: 'builder', chapters: 5, streak: 7 },
  { heroName: 'Alan Turing', track: 'strategist', chapters: 6, streak: 3 },
  { heroName: 'Hedy Lamarr', track: 'strategist', chapters: 4, streak: 9 },
  { heroName: 'Claude Shannon', track: 'builder', chapters: 3, streak: 1 },
  { heroName: 'Karen Sparck Jones', track: 'strategist', chapters: 2, streak: 4 },
  { heroName: 'John McCarthy', track: 'builder', chapters: 1, streak: 0 },
  { heroName: 'Margaret Hamilton', track: 'strategist', chapters: 0, streak: 0 },
];

const demoId = (i: number) => `demo_${String(i + 1).padStart(2, '0')}`;

/** What a demo player has cleared: progress rows and the XP each one earns. */
function clears({ track, chapters }: Demo) {
  const rows: { exerciseId: string; reason?: XpReason }[] = [];
  for (let chapter = 1; chapter <= chapters; chapter++) {
    for (const step of CHAPTER_STEPS) {
      const exerciseId = buildExerciseId({
        area: 'chapter',
        track,
        realm: DEMO_REALM,
        chapter,
        step,
      });
      rows.push({ exerciseId, reason: step });
    }
  }
  if (chapters === CHAPTER_COUNT) {
    rows.push({
      exerciseId: buildExerciseId({ area: 'boss', track, realm: DEMO_REALM }),
      reason: 'boss',
    });
  }
  return rows;
}

async function seedKbSources() {
  const sources = await loadKbSources();
  await db.transaction(async (tx) => {
    for (const { id, ...fields } of sources) {
      await tx
        .insert(kbSources)
        .values({ id, ...fields })
        .onConflictDoUpdate({ target: kbSources.id, set: fields });
    }
    // A source removed from the YAML stays as history, but is switched off.
    const ids = sources.map((s) => s.id);
    await tx.update(kbSources).set({ enabled: false }).where(notInArray(kbSources.id, ids));
  });
  console.log(`kb_sources: ${sources.length} upserted from ${KB_SOURCES_FILE}`);
}

/** Same shape as a real grant: ledger insert (award once) + cache bump in one transaction. */
async function seedDemo(demo: Demo, i: number) {
  const userId = demoId(i);
  const done = clears(demo);
  const events = done.flatMap(({ exerciseId, reason }) =>
    reason ? [{ userId, exerciseId, reason, amount: XP_REWARDS[reason] }] : [],
  );

  return db.transaction(async (tx) => {
    await tx
      .insert(users)
      .values({ id: userId, heroName: demo.heroName, track: demo.track, streak: demo.streak })
      .onConflictDoNothing();
    if (done.length === 0) return 0;

    await tx
      .insert(progress)
      .values(done.map(({ exerciseId }) => ({ userId, exerciseId })))
      .onConflictDoNothing();
    const added = await tx
      .insert(xpEvents)
      .values(events)
      .onConflictDoNothing()
      .returning({ amount: xpEvents.amount });
    const gain = added.reduce((sum, e) => sum + e.amount, 0);
    if (gain > 0) {
      await tx
        .update(users)
        .set({ xp: sql`${users.xp} + ${gain}`, lastActiveAt: new Date() })
        .where(eq(users.id, userId));
    }
    return gain;
  });
}

try {
  await seedKbSources();
  // Fail closed: no branch name could mean production, so no demo users.
  const branch = process.env.NEON_BRANCH;
  if (!branch || branch === PRODUCTION_BRANCH) {
    console.log(`demo users: skipped (NEON_BRANCH=${branch || 'unset'})`);
  } else {
    let gained = 0;
    for (const [i, demo] of DEMOS.entries()) gained += await seedDemo(demo, i);
    console.log(`demo users: ${DEMOS.length} ensured, ${gained} new XP granted`);
  }
} finally {
  await db.$client.end();
}
