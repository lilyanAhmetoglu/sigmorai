import 'server-only';
import { auth } from '@clerk/nextjs/server';
import { connection } from 'next/server';
import { cache } from 'react';
import { db } from '@/db';
import {
  FRONTIER_AREA,
  FRONTIER_TEXT,
  HP_PER_CHALLENGE,
  MATH_AREA,
  MATH_FLOOR_COUNT,
  MATH_TOWER,
  QUEST_ERROR_TEXT,
  QUEST_TEXT,
  questHref,
  REALMS,
} from '@/lib/constants';
import { isRealmOpen, realmAccent } from '@/lib/content/curriculum';
import { buildExerciseId, parseExerciseId, questBackHref } from '@/lib/content/ids';
import {
  ContentError,
  hasContent,
  loadCase,
  loadLesson,
  loadMathOutline,
  loadQuickCheck,
  loadTrackOutline,
} from '@/lib/content/load';
import { toPublicCase, toPublicQuickCheck } from '@/lib/content/public';
import { readAttempts } from '@/lib/grading/attempts';
import { gradedKind, hpNow, nextCaseId, triesLeft } from '@/lib/grading/case';
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

/** Every step this page plays: a realm chapter step, a boss, a Math Tower floor or Frontier step. */
type PlayableRef = ExerciseRef;
/** A step that has a lesson: a realm chapter, Math Tower floor or Frontier chapter step. */
type LessonRef = Exclude<ExerciseRef, { area: 'boss' }>;

/** What the quest page renders. Public content only: no correct flags, no explanations. */
export type QuestPage =
  | { kind: 'not-found' }
  | { kind: 'locked'; message: string }
  | {
      kind: 'answers';
      sheet: AnswerSheet;
      /** Case only: the brief and the optional exhibit. */
      scenario?: string;
      exhibit?: string;
      /** "BOOTSTRAP VILLAGE · CHAPTER 1 · CASE", "MATH TOWER · FLOOR 2 · QUICK CHECK" */
      tag: string;
      /** The realm (or tower) colour for the tag (data-accent). */
      accent: Accent;
      viewer: AnswerViewer;
      /** Where Continue goes after a pass. */
      nextHref: string;
      /** The chapter's or floor's lesson, linked after a fail; null for a boss or a stub lesson. */
      lessonHref: string | null;
    }
  | {
      kind: 'lesson';
      exerciseId: string;
      /** The full lesson: frontmatter + MDX body. Nothing in it is secret. */
      lesson: Lesson;
      /** "BOOTSTRAP VILLAGE · CHAPTER 1 · LESSON", "MATH TOWER · FLOOR 1 · LESSON" */
      tag: string;
      accent: Accent;
      /**
       * The realm's (or tower's) NPC: every <DialogBox> in the body speaks as
       * them. None for the Frontier: its body may use no component at all.
       */
      npc?: string;
      viewer: LessonViewer;
      /** Where Continue goes after "Lesson done": this chapter's case, or this floor's quick check. */
      nextHref: string;
    };

const STEP_TAG = {
  case: QUEST_TEXT.caseTag,
  'quick-check': QUEST_TEXT.quickCheckTag,
  lesson: QUEST_TEXT.lessonTag,
} as const satisfies Record<GradedKind | 'lesson', string>;

function tagFor(ref: PlayableRef, step: keyof typeof STEP_TAG): string {
  if (ref.area === MATH_AREA) {
    return `${MATH_TOWER.name.toUpperCase()} · ${QUEST_TEXT.floorTag(ref.floor)} · ${STEP_TAG[step]}`;
  }
  if (ref.area === FRONTIER_AREA) {
    return `${QUEST_TEXT.frontierArea} · ${ref.date} · ${STEP_TAG[step]}`;
  }
  const realm = REALMS[ref.realm as RealmId].name.toUpperCase();
  const where = ref.area === 'boss' ? QUEST_TEXT.bossTag : QUEST_TEXT.chapterTag(ref.chapter);
  return `${realm} · ${where} · ${STEP_TAG[step]}`;
}

function accentFor(ref: PlayableRef): Accent {
  if (ref.area === MATH_AREA) return 'math';
  if (ref.area === FRONTIER_AREA) return 'neutral';
  return realmAccent(ref.realm as RealmId);
}

/** The lesson's NPC. The Frontier has none (no DialogBox, no lore). */
function npcFor(ref: LessonRef): string | undefined {
  if (ref.area === MATH_AREA) return MATH_TOWER.npc;
  if (ref.area === FRONTIER_AREA) return undefined;
  return REALMS[ref.realm as RealmId].npc;
}

/**
 * The step a pass leads to: the next case, or (Math Tower) the next floor's
 * lesson. The Frontier has no order: Continue goes back to its page.
 */
function nextStepId(ref: PlayableRef): string | null {
  if (ref.area === FRONTIER_AREA) return null;
  if (ref.area !== MATH_AREA) return nextCaseId(ref);
  return ref.floor < MATH_FLOOR_COUNT
    ? buildExerciseId({ area: MATH_AREA, floor: ref.floor + 1, step: 'lesson' })
    : null;
}

/** Continue after a pass: the next step if it has content, else the realm or tower page. */
async function nextHrefFor(ref: PlayableRef, exerciseId: string): Promise<string> {
  const next = nextStepId(ref);
  return next && (await hasContent(next)) ? questHref(next) : questBackHref(exerciseId);
}

/** "Read the lesson again" after a fail: the chapter's or floor's lesson if its file exists. */
async function lessonHrefFor(ref: PlayableRef): Promise<string | null> {
  if (ref.area === 'boss') return null;
  const lessonId = buildExerciseId({ ...ref, step: 'lesson' });
  return (await hasContent(lessonId)) ? questHref(lessonId) : null;
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
  const { cleared, spent, tries } = await readAttempts(db, userId, exerciseId, now);
  const value = hpNow(kind, cleared, spent);
  return {
    status: 'ready',
    cleared,
    hp: value === null ? null : { value, max: HP_PER_CHALLENGE },
    triesLeft: kind === 'quick-check' ? triesLeft(tries) : null,
    hpResetsAt: nextUtcDayStart(now).toISOString(),
  };
}

/**
 * The quest page's read. Signed-out readers see the case (no submit); only
 * the tier lock applies to them. A signed-in player also gets the chapter
 * (or floor) order check, which the actions run again. Math Tower floors and
 * Frontier chapters have no tier; every Frontier chapter is open.
 */
export async function getQuestPage(exerciseId: string): Promise<QuestPage> {
  // A new seed on every request: never prerender or reuse this read.
  await connection();
  const ref = parseExerciseId(exerciseId);
  if (!ref || !(await hasContent(exerciseId))) return { kind: 'not-found' };
  if (
    (ref.area === 'chapter' || ref.area === 'boss') &&
    !isRealmOpen(REALMS[ref.realm as RealmId].tier)
  ) {
    return { kind: 'locked', message: QUEST_ERROR_TEXT.TIER_LOCKED };
  }
  if (ref.area !== 'boss' && ref.step === 'lesson') return lessonPage(ref, exerciseId);
  const kind = gradedKind(ref);
  // Every non-lesson step is graded; this only narrows the type.
  if (!kind) return { kind: 'not-found' };

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
    accent: accentFor(ref),
    viewer,
    nextHref: await nextHrefFor(ref, exerciseId),
    lessonHref: await lessonHrefFor(ref),
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

/**
 * Continue after "Lesson done": this chapter's case (or this floor's or
 * Frontier chapter's quick check) if it has content, else the realm, tower or
 * Frontier page.
 */
async function lessonNextHref(ref: LessonRef, exerciseId: string): Promise<string> {
  const nextId =
    ref.area === 'chapter'
      ? buildExerciseId({ ...ref, step: 'challenge' })
      : buildExerciseId({ ...ref, step: 'quick-check' });
  return (await hasContent(nextId)) ? questHref(nextId) : questBackHref(exerciseId);
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

/**
 * A realm chapter, Math Tower floor or Frontier lesson. The tier check
 * already ran in getQuestPage.
 */
async function lessonPage(ref: LessonRef, exerciseId: string): Promise<QuestPage> {
  const lesson = await readLesson(exerciseId);
  if (!lesson) return { kind: 'not-found' };
  const [viewer, nextHref] = await Promise.all([
    lessonViewer(exerciseId),
    lessonNextHref(ref, exerciseId),
  ]);
  const npc = npcFor(ref);
  return {
    kind: 'lesson',
    exerciseId,
    lesson,
    tag: tagFor(ref, 'lesson'),
    accent: accentFor(ref),
    ...(npc && { npc }),
    viewer,
    nextHref,
  };
}

/**
 * What a lesson's meta description says: the realm's topic, what the floor
 * covers, or the Frontier's fixed description.
 */
async function lessonDescription(ref: LessonRef): Promise<string> {
  if (ref.area === MATH_AREA) return (await loadMathOutline()).floors[ref.floor - 1].covers;
  if (ref.area === FRONTIER_AREA) return FRONTIER_TEXT.description;
  // The outline lists realms in map order, not by number: find by id.
  const realm = (await loadTrackOutline(ref.track)).realms.find((r) => r.id === ref.realm);
  return realm?.topic ?? REALMS[ref.realm as RealmId].name;
}

/** Title, description and canonical for any lesson (realm, Math Tower, Frontier); null otherwise. */
export async function getLessonMeta(exerciseId: string) {
  const ref = parseExerciseId(exerciseId);
  if (!ref || ref.area === 'boss' || ref.step !== 'lesson') return null;
  const lesson = await readLesson(exerciseId);
  if (!lesson) return null;
  return {
    title: lesson.frontmatter.title,
    description: await lessonDescription(ref),
    canonical: questHref(exerciseId),
  };
}
