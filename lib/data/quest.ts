import 'server-only';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema';
import {
  capReachedText,
  HP_PER_CHALLENGE,
  PROFILE_HREF,
  QUEST_ERROR_TEXT,
  QUEST_TEXT,
  questHref,
  REALMS,
} from '@/lib/constants';
import { isRealmOpen, realmAccent } from '@/lib/content/curriculum';
import { parseExerciseId } from '@/lib/content/ids';
import { ContentError, hasContent, loadChallenge } from '@/lib/content/load';
import { toPublicChallenge } from '@/lib/content/public';
import { readAttempts } from '@/lib/grading/attempts';
import { nextChallengeId } from '@/lib/grading/challenge';
import { checkOpen } from '@/lib/grading/open';
import { capReached } from '@/lib/grading/sandbox-gate';
import type {
  Accent,
  ChallengeViewer,
  ExerciseRef,
  PublicChallenge,
  QuestBlock,
  RealmId,
  SandboxKind,
} from '@/lib/types';
import { hpLeft } from '@/lib/xp/hp';
import { nextUtcDayStart } from '@/lib/xp/day';
import { getHudState } from './hud';

/** What the quest page renders. Only public content: no hidden tests, no solution. */
export type ChallengePage =
  | { kind: 'not-found' }
  /** A real step this page can't show yet (lesson, quick check, case: SIG-11 / SIG-19). */
  | { kind: 'unavailable' }
  | { kind: 'locked'; message: string }
  | {
      kind: 'challenge';
      challenge: PublicChallenge;
      /** "TOOL FORGE · CHAPTER 3" */
      tag: string;
      /** The realm colour for the tag (data-accent). */
      accent: Accent;
      viewer: ChallengeViewer;
      nextHref: string;
    };

type BuilderChallengeRef = Extract<ExerciseRef, { area: 'chapter' | 'boss' }>;

const isBuilderChallenge = (ref: ExerciseRef): ref is BuilderChallengeRef =>
  (ref.area === 'boss' || (ref.area === 'chapter' && ref.step === 'challenge')) &&
  ref.track === 'builder';

async function loadPublicChallenge(exerciseId: string): Promise<PublicChallenge | null> {
  try {
    return toPublicChallenge(await loadChallenge(exerciseId));
  } catch (error) {
    if (error instanceof ContentError && error.code === 'missing') return null;
    throw error;
  }
}

function tagFor(ref: BuilderChallengeRef): string {
  const realm = REALMS[ref.realm as RealmId].name.toUpperCase();
  const step = ref.area === 'boss' ? QUEST_TEXT.bossTag : QUEST_TEXT.chapterTag(ref.chapter);
  return `${realm} · ${step}`;
}

/** Continue after a clear: the next challenge if it has content, else the profile. */
async function nextHrefFor(ref: ExerciseRef): Promise<string> {
  const next = nextChallengeId(ref);
  return next && (await hasContent(next)) ? questHref(next) : PROFILE_HREF;
}

/** HP, caps and the clear for the signed-in, onboarded player. Scoped to auth()'s user. */
async function readyViewer(userId: string, exerciseId: string): Promise<ChallengeViewer> {
  const now = new Date();
  const [state] = await db
    .select({
      sandboxDay: users.sandboxDay,
      runCount: users.runCount,
      submitCount: users.submitCount,
      sandboxPendingAt: users.sandboxPendingAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!state) return { status: 'onboarding' };
  const { cleared, spent } = await readAttempts(db, userId, exerciseId, now);

  const block = (kind: SandboxKind): QuestBlock | null => {
    const cap = capReached(state, kind, now);
    return cap && { message: capReachedText(kind, cap.used, cap.cap), resetsAt: cap.resetsAt };
  };
  return {
    status: 'ready',
    cleared,
    // A replay costs no HP, so a cleared challenge shows full HP (same as hpAfterSubmit).
    hp: cleared ? HP_PER_CHALLENGE : hpLeft(spent),
    hpMax: HP_PER_CHALLENGE,
    hpResetsAt: nextUtcDayStart(now).toISOString(),
    runBlock: block('run'),
    submitBlock: block('submit'),
  };
}

/**
 * The quest page's read. Signed-out readers see the challenge (lessons are
 * public) but only the tier lock applies to them; chapter order is checked
 * for a signed-in player, as Run and Submit check it again.
 */
export async function getChallengePage(exerciseId: string): Promise<ChallengePage> {
  const ref = parseExerciseId(exerciseId);
  if (!ref) return { kind: 'not-found' };
  if (!isBuilderChallenge(ref)) {
    return (await hasContent(exerciseId)) ? { kind: 'unavailable' } : { kind: 'not-found' };
  }
  if (!isRealmOpen(REALMS[ref.realm as RealmId].tier)) {
    return { kind: 'locked', message: QUEST_ERROR_TEXT.TIER_LOCKED };
  }

  const challenge = await loadPublicChallenge(exerciseId);
  if (!challenge) return { kind: 'not-found' };

  const hud = await getHudState();
  // getHudState is cached per request; auth() gives the same session's id.
  const { userId } = await auth();
  let viewer: ChallengeViewer = { status: 'signed-out' };
  if (hud.status === 'onboarding') viewer = { status: 'onboarding' };
  if (hud.status === 'ready' && userId) {
    const open = await checkOpen(db, userId, exerciseId);
    if (!open.ok) return { kind: 'locked', message: open.message };
    viewer = await readyViewer(userId, exerciseId);
  }

  return {
    kind: 'challenge',
    challenge,
    tag: tagFor(ref),
    accent: realmAccent(ref.realm as RealmId),
    viewer,
    nextHref: await nextHrefFor(ref),
  };
}
