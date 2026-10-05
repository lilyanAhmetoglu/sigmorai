import 'server-only';
import { auth } from '@clerk/nextjs/server';
import { connection } from 'next/server';
import { cache } from 'react';
import { db } from '@/db';
import { HP_PER_CHALLENGE, QUEST_ERROR_TEXT, QUEST_TEXT, questHref, REALMS } from '@/lib/constants';
import { isRealmOpen, realmAccent } from '@/lib/content/curriculum';
import { buildExerciseId, parseExerciseId, questBackHref } from '@/lib/content/ids';
import {
  ContentError,
  hasContent,
  loadCase,
  loadLesson,
  loadQuickCheck,
  loadTrackOutline,
} from '@/lib/content/load';
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
  Lesson,
  LessonViewer,
  RealmId,
} from '@/lib/types';
import { nextUtcDayStart } from '@/lib/xp/day';
import { getHudState } from './hud';

/** A realm step: a chapter lesson, case or quick check, or a boss. */
type RealmRef = Extract<ExerciseRef, { area: 'chapter' | 'boss' }>;
type ChapterRef = Extract<ExerciseRef, { area: 'chapter' }>;

/** What the quest page renders. Public content only: no correct flags, no explanations. */
export type QuestPage =
  | { kind: 'not-found' }
  /** A real step this page can't show yet (Math Tower and Frontier steps). */
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
    }
  | {
      kind: 'lesson';
      exerciseId: string;
      /** The full lesson: frontmatter + MDX body. Nothing in it is secret. */
      lesson: Lesson;
      /** "BOOTSTRAP VILLAGE · CHAPTER 1 · LESSON" */
      tag: string;
      accent: Accent;
      /** The realm's NPC: every <DialogBox> in the body speaks as them. */
      npc: string;
      viewer: LessonViewer;
      /** Where Continue goes after "Lesson done": this chapter's case. */
      nextHref: string;
    };

const STEP_TAG = {
  case: QUEST_TEXT.caseTag,
  'quick-check': QUEST_TEXT.quickCheckTag,
  lesson: QUEST_TEXT.lessonTag,
} as const satisfies Record<GradedKind | 'lesson', string>;

function tagFor(ref: RealmRef, step: keyof typeof STEP_TAG): string {
  const realm = REALMS[ref.realm as RealmId].name.toUpperCase();
  const where = ref.area === 'boss' ? QUEST_TEXT.bossTag : QUEST_TEXT.chapterTag(ref.chapter);
  return `${realm} · ${where} · ${STEP_TAG[step]}`;
}

/** Continue after a pass: the next case if it has content, else the realm page. */
async function nextHrefFor(ref: ExerciseRef, exerciseId: string): Promise<string> {
  const next = nextCaseId(ref);
  return next && (await hasContent(next)) ? questHref(next) : questBackHref(exerciseId);
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
  if (ref.area === 'chapter' && ref.step === 'lesson') return lessonPage(ref, exerciseId);
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
    nextHref: await nextHrefFor(ref, exerciseId),
  };
}

// ── Lessons ───────────────────────────────────────────────────────────────

/** One disk read per lesson per request: generateMetadata and the page share it. */
const loadLessonCached = cache((exerciseId: string) => loadLesson(exerciseId));

/** Null when the lesson has no file (a stub chapter). A broken file still throws. */
async function readLesson(exerciseId: string): Promise<Lesson | null> {
  try {
    return await loadLessonCached(exerciseId);
  } catch (error) {
    if (error instanceof ContentError && error.code === 'missing') return null;
    throw error;
  }
}

/** Continue after "Lesson done": this chapter's case if it has content, else the realm page. */
async function lessonNextHref(ref: ChapterRef, exerciseId: string): Promise<string> {
  const caseId = buildExerciseId({ ...ref, step: 'challenge' });
  return (await hasContent(caseId)) ? questHref(caseId) : questBackHref(exerciseId);
}

/**
 * Who is reading. Lessons are public: everyone reads the body. A signed-in
 * player also gets the open check (completeLesson runs it again) and the clear.
 */
async function lessonViewer(exerciseId: string): Promise<LessonViewer> {
  const hud = await getHudState();
  if (hud.status === 'onboarding') return { status: 'onboarding' };
  // getHudState is cached per request; auth() gives the same session's id.
  const { userId } = await auth();
  if (hud.status !== 'ready' || !userId) return { status: 'signed-out' };
  const open = await checkOpen(db, userId, exerciseId);
  if (!open.ok) return { status: 'not-open', message: open.message };
  const { cleared } = await readAttempts(db, userId, exerciseId, new Date());
  return { status: 'ready', cleared };
}

/** A realm chapter lesson. The tier check already ran in getQuestPage. */
async function lessonPage(ref: ChapterRef, exerciseId: string): Promise<QuestPage> {
  const lesson = await readLesson(exerciseId);
  if (!lesson) return { kind: 'not-found' };
  const [viewer, nextHref] = await Promise.all([
    lessonViewer(exerciseId),
    lessonNextHref(ref, exerciseId),
  ]);
  return {
    kind: 'lesson',
    exerciseId,
    lesson,
    tag: tagFor(ref, 'lesson'),
    accent: realmAccent(ref.realm as RealmId),
    npc: REALMS[ref.realm as RealmId].npc,
    viewer,
    nextHref,
  };
}

/** Title, description (the realm's topic) and canonical for a realm lesson; null otherwise. */
export async function getLessonMeta(exerciseId: string) {
  const ref = parseExerciseId(exerciseId);
  if (ref?.area !== 'chapter' || ref.step !== 'lesson') return null;
  const lesson = await readLesson(exerciseId);
  if (!lesson) return null;
  const outline = await loadTrackOutline(ref.track);
  return {
    title: lesson.frontmatter.title,
    description: outline.realms[ref.realm].topic,
    canonical: questHref(exerciseId),
  };
}
