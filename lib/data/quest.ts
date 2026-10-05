import 'server-only';
import { auth } from '@clerk/nextjs/server';
import { connection } from 'next/server';
import { db } from '@/db';
import {
  HP_PER_CHALLENGE,
  PROFILE_HREF,
  QUEST_ERROR_TEXT,
  QUEST_TEXT,
  questHref,
  REALMS,
} from '@/lib/constants';
import { isRealmOpen, realmAccent } from '@/lib/content/curriculum';
import { parseExerciseId } from '@/lib/content/ids';
import { ContentError, hasContent, loadCase, loadQuickCheck } from '@/lib/content/load';
import { toPublicCase, toPublicQuickCheck } from '@/lib/content/public';
import { readAttempts } from '@/lib/grading/attempts';
import { gradedKind, hpNow, nextCaseId } from '@/lib/grading/case';
import { checkOpen } from '@/lib/grading/open';
import { newSeed, shuffleQuestions } from '@/lib/grading/shuffle';
import type {
  Accent,
  AnswerSheet,
  AnswerViewer,
  ExerciseRef,
  GradedKind,
  RealmId,
} from '@/lib/types';
import { nextUtcDayStart } from '@/lib/xp/day';
import { getHudState } from './hud';

/** A realm case or quick check: the only exercises this page plays so far. */
type RealmRef = Extract<ExerciseRef, { area: 'chapter' | 'boss' }>;

/** What the quest page renders. Public content only: no correct flags, no explanations. */
export type QuestPage =
  | { kind: 'not-found' }
  /** A real step this page can't show yet (the lesson page is SIG-11). */
  | { kind: 'unavailable' }
  | { kind: 'locked'; message: string }
  | {
      kind: 'answers';
      sheet: AnswerSheet;
      /** Case only: the brief and the optional exhibit. */
      scenario?: string;
      exhibit?: string;
      /** "BOOTSTRAP VILLAGE · CHAPTER 1 · CASE" */
      tag: string;
      /** The realm colour for the tag (data-accent). */
      accent: Accent;
      viewer: AnswerViewer;
      /** Where Continue goes after a pass. */
      nextHref: string;
    };

function tagFor(ref: RealmRef, kind: GradedKind): string {
  const realm = REALMS[ref.realm as RealmId].name.toUpperCase();
  const where = ref.area === 'boss' ? QUEST_TEXT.bossTag : QUEST_TEXT.chapterTag(ref.chapter);
  const step = kind === 'case' ? QUEST_TEXT.caseTag : QUEST_TEXT.quickCheckTag;
  return `${realm} · ${where} · ${step}`;
}

/** Continue after a pass: the next case if it has content, else the profile. */
async function nextHrefFor(ref: ExerciseRef): Promise<string> {
  const next = nextCaseId(ref);
  return next && (await hasContent(next)) ? questHref(next) : PROFILE_HREF;
}

/**
 * The public, shuffled sheet. A fresh random seed per render: the Server
 * Action re-shuffles from it to map the picked indexes back. Nothing is
 * stored before submit.
 */
async function loadSheet(kind: GradedKind, exerciseId: string) {
  const seed = newSeed();
  if (kind === 'case') {
    const full = await loadCase(exerciseId);
    const { questions } = shuffleQuestions(full.questions, seed);
    const pub = toPublicCase({ ...full, questions });
    const sheet: AnswerSheet = {
      kind,
      exerciseId,
      title: pub.title,
      seed,
      questions: pub.questions,
    };
    return { sheet, scenario: pub.scenario, exhibit: pub.exhibit };
  }
  const full = await loadQuickCheck(exerciseId);
  const { questions } = shuffleQuestions(full.questions, seed);
  const pub = toPublicQuickCheck({ ...full, questions });
  const sheet: AnswerSheet = {
    kind,
    exerciseId,
    title: QUEST_TEXT.quickCheckTitle,
    seed,
    questions: pub.questions,
  };
  return { sheet };
}

/** HP and the clear for the signed-in, onboarded player. Scoped to auth()'s user. */
async function readyViewer(
  userId: string,
  exerciseId: string,
  kind: GradedKind,
): Promise<AnswerViewer> {
  const now = new Date();
  const { cleared, spent } = await readAttempts(db, userId, exerciseId, now);
  const value = hpNow(kind, cleared, spent);
  return {
    status: 'ready',
    cleared,
    hp: value === null ? null : { value, max: HP_PER_CHALLENGE },
    hpResetsAt: nextUtcDayStart(now).toISOString(),
  };
}

/**
 * The quest page's read. Signed-out readers see the case (no submit); only
 * the tier lock applies to them. A signed-in player also gets the chapter
 * order check, which the actions run again.
 */
export async function getQuestPage(exerciseId: string): Promise<QuestPage> {
  // A new seed on every request: never prerender or reuse this read.
  await connection();
  const ref = parseExerciseId(exerciseId);
  if (!ref || !(await hasContent(exerciseId))) return { kind: 'not-found' };
  if (ref.area !== 'chapter' && ref.area !== 'boss') return { kind: 'unavailable' };
  if (!isRealmOpen(REALMS[ref.realm as RealmId].tier)) {
    return { kind: 'locked', message: QUEST_ERROR_TEXT.TIER_LOCKED };
  }
  const kind = gradedKind(ref);
  if (!kind) return { kind: 'unavailable' };

  let loaded: Awaited<ReturnType<typeof loadSheet>>;
  try {
    loaded = await loadSheet(kind, exerciseId);
  } catch (error) {
    if (error instanceof ContentError && error.code === 'missing') return { kind: 'not-found' };
    throw error;
  }

  const hud = await getHudState();
  // getHudState is cached per request; auth() gives the same session's id.
  const { userId } = await auth();
  let viewer: AnswerViewer = { status: 'signed-out' };
  if (hud.status === 'onboarding') viewer = { status: 'onboarding' };
  if (hud.status === 'ready' && userId) {
    const open = await checkOpen(db, userId, exerciseId);
    if (!open.ok) return { kind: 'locked', message: open.message };
    viewer = await readyViewer(userId, exerciseId, kind);
  }

  return {
    kind: 'answers',
    ...loaded,
    tag: tagFor(ref, kind),
    accent: realmAccent(ref.realm as RealmId),
    viewer,
    nextHref: await nextHrefFor(ref),
  };
}
