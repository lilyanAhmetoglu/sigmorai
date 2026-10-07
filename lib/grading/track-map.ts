import {
  BOSS_STEP,
  CHAPTER_COUNT,
  CHAPTER_STEPS,
  FRONTIER_AREA,
  MATH_AREA,
  MATH_FLOORS,
  REALMS,
  SIDE_STEPS,
} from '@/lib/constants';
import { isRealmOpen } from '@/lib/content/curriculum';
import { buildExerciseId } from '@/lib/content/ids';
import type {
  ChapterView,
  ExerciseRef,
  FloorState,
  FrontierChapter,
  FrontierChapterView,
  FrontierSummary,
  LevelStatus,
  NextStep,
  Realm,
  RealmStatus,
  RealmView,
  StepStatus,
  StepView,
  Track,
  TrackMap,
  TowerSummary,
  TrackOutline,
} from '@/lib/types';
import { decideOpen } from './open';

/**
 * The realm / chapter / step states the dashboard and realm pages show.
 * Pure: the caller passes the outline, the ids that have a content file
 * (`live`) and the ids this player cleared (`cleared`, empty for a visitor).
 * The lock itself is decideOpen (lib/grading/open.ts), the same rule the
 * Server Actions run, so a page can't show "open" where an action refuses.
 */

type Sets = { live: ReadonlySet<string>; cleared: ReadonlySet<string> };
type Credited = ReadonlyMap<string, Track>;

/** "Boss · Bootstrap Village" (curriculum spec: the boss name is derived). */
export const bossTitle = (realm: Pick<Realm, 'name'>) => `Boss · ${realm.name}`;

/** Order of precedence: tier lock, done, no content, chapter lock, open. */
function stepStatus(ref: ExerciseRef, id: string, { live, cleared }: Sets): StepStatus {
  const open = decideOpen(ref, cleared);
  if (!open.ok && open.code === 'TIER_LOCKED') return 'tier-locked';
  if (cleared.has(id)) return 'done';
  if (!live.has(id)) return 'soon';
  return open.ok ? 'open' : 'locked';
}

function stepView(ref: ExerciseRef, sets: Sets): StepView {
  const exerciseId = buildExerciseId(ref);
  const step = ref.area === 'boss' ? BOSS_STEP : ref.step;
  return { step, exerciseId, status: stepStatus(ref, exerciseId, sets) };
}

/**
 * A chapter takes its case's state, except "soon" only when no step is live.
 * A Math Tower floor passes its quick check as `caseStep`: it clears the floor.
 */
function chapterStatus(steps: StepView[], caseStep: StepView): StepStatus {
  if (caseStep.status === 'tier-locked' || caseStep.status === 'done') return caseStep.status;
  if (steps.every((s) => s.status === 'soon')) return 'soon';
  if (steps.some((s) => s.status === 'open' || s.status === 'done')) return 'open';
  return 'locked';
}

function chapterViews(
  track: Track,
  realm: Realm,
  titles: string[],
  sets: Sets,
  credited: Credited,
): ChapterView[] {
  const chapters = titles.slice(0, CHAPTER_COUNT).map((title, i): ChapterView => {
    const chapter = i + 1;
    const steps = CHAPTER_STEPS.map((step) =>
      stepView({ area: 'chapter', track, realm: realm.id, chapter, step }, sets),
    );
    const caseStep = steps.find((s) => s.step === BOSS_STEP)!;
    const status = chapterStatus(steps, caseStep);
    const creditedFrom = status === 'done' ? credited.get(caseStep.exerciseId) : undefined;
    return { chapter, title, status, steps, ...(creditedFrom && { creditedFrom }) };
  });
  const boss = stepView({ area: 'boss', track, realm: realm.id }, sets);
  return [
    ...chapters,
    { chapter: null, title: bossTitle(realm), status: boss.status, steps: [boss] },
  ];
}

function realmStatus(realm: Realm, chapters: ChapterView[]): RealmStatus {
  if (!isRealmOpen(realm.tier)) return 'tier-locked';
  if (chapters.at(-1)?.status === 'done') return 'cleared';
  if (chapters.some((c) => c.steps.some((s) => s.status === 'done'))) return 'in-progress';
  return 'open';
}

/** The first open step in map order (realm, chapter, then lesson → case → quick check). */
export function firstOpenStep(realms: RealmView[]): NextStep | null {
  for (const realm of realms) {
    for (const chapter of realm.chapters) {
      const step = chapter.steps.find((s) => s.status === 'open');
      if (step) return { realm: realm.id, chapter: chapter.chapter, step };
    }
  }
  return null;
}

/**
 * A chapter's level-map node state. "current" is the chapter holding the
 * player's next step (the caller decides that). Tier-locked and "soon" both
 * show as locked: there is nothing to play yet.
 */
export function levelStatus(chapter: ChapterView, isCurrent: boolean): LevelStatus {
  if (chapter.status === 'done') return 'done';
  if (chapter.status === 'open') return isCurrent ? 'current' : 'open';
  return 'locked';
}

/**
 * Where a level-map node links: the chapter's first open step; for a done
 * chapter with nothing open, its first step (replay). Else null (not playable).
 */
export function playableStep(chapter: Pick<ChapterView, 'status' | 'steps'>): StepView | null {
  const open = chapter.steps.find((s) => s.status === 'open');
  if (open) return open;
  return chapter.status === 'done' ? (chapter.steps[0] ?? null) : null;
}

/** The dashboard's realms: in progress first, then open, in map order. Never cleared or tier-locked. */
export function activeRealms(realms: RealmView[], limit = realms.length): RealmView[] {
  const pick = (status: RealmStatus) => realms.filter((r) => r.status === status);
  return [...pick('in-progress'), ...pick('open')].slice(0, limit);
}

/** Chapters and bosses cleared on the whole track (the dashboard's LEVELS CLEARED). */
export const clearedLevels = (realms: RealmView[]): number =>
  realms.reduce((sum, r) => sum + r.cleared, 0);

/**
 * `cleared` already holds the credited cases (applyCredit); `credited` says
 * which ones were credited and from which track, for the chapter label.
 */
export function buildTrackMap(
  track: Track,
  outline: TrackOutline,
  live: ReadonlySet<string>,
  cleared: ReadonlySet<string>,
  credited: Credited = new Map(),
): TrackMap {
  const sets = { live, cleared };
  const realms = REALMS.map((realm): RealmView => {
    const { topic, lore, chapters: outlined } = outline.realms[realm.id];
    const chapters = chapterViews(
      track,
      realm,
      outlined.map((c) => c.title),
      sets,
      credited,
    );
    return {
      id: realm.id,
      slug: realm.slug,
      name: realm.name,
      npc: realm.npc,
      tier: realm.tier,
      topic,
      lore,
      status: realmStatus(realm, chapters),
      cleared: chapters.filter((c) => c.status === 'done').length,
      chapters,
    };
  });
  // Continue where the player already is: in-progress realms before fresh ones.
  return { track, realms, next: firstOpenStep(activeRealms(realms)) };
}

/**
 * The Math Tower's floors, as chapter views (`chapter` = the floor number):
 * lesson then quick check, and the quick check decides the floor's state.
 * Same lock rule as the actions (decideOpen). Pure. What a floor covers
 * comes from content/math/outline.json; the caller adds it.
 */
export function buildTowerMap(
  live: ReadonlySet<string>,
  cleared: ReadonlySet<string>,
): FloorState[] {
  const sets = { live, cleared };
  return MATH_FLOORS.map((floor): FloorState => {
    const steps = SIDE_STEPS.map((step) =>
      stepView({ area: MATH_AREA, floor: floor.n, step }, sets),
    );
    const quickCheck = steps.find((s) => s.step === 'quick-check')!;
    return { chapter: floor.n, title: floor.name, status: chapterStatus(steps, quickCheck), steps };
  });
}

/**
 * The dashboard's Math Tower panel and MATH FLOORS stat. A live floor has a
 * content file ("soon" means none); a cleared floor had its quick check passed.
 * The next floor is the first open one, linked to its playable step.
 */
export function towerSummary(floors: FloorState[]): TowerSummary {
  const live = floors.filter((f) => f.status !== 'soon').length;
  const cleared = floors.filter((f) => f.status === 'done').length;
  for (const floor of floors) {
    const step = floor.status === 'open' ? playableStep(floor) : null;
    if (step) {
      return {
        state: 'open',
        next: { floor: floor.chapter, title: floor.title, step },
        cleared,
        live,
      };
    }
  }
  const state = live > 0 && cleared === live ? 'cleared' : 'soon';
  return { state, next: null, cleared, live };
}

/**
 * The Frontier's chapters (curriculum plan, amendment 2026-10-07 SIG-29), in
 * the order given (newest first): lesson then quick check, and the quick
 * check decides the chapter's state. Every chapter is open (decideOpen); a
 * step with no file is "soon". Pure.
 */
export function buildFrontierList(
  chapters: readonly FrontierChapter[],
  live: ReadonlySet<string>,
  cleared: ReadonlySet<string>,
): FrontierChapterView[] {
  const sets = { live, cleared };
  return chapters.map((chapter): FrontierChapterView => {
    const steps = SIDE_STEPS.map((step) =>
      stepView({ area: FRONTIER_AREA, date: chapter.date, slug: chapter.slug, step }, sets),
    );
    const quickCheck = steps.find((s) => s.step === 'quick-check')!;
    return { ...chapter, status: chapterStatus(steps, quickCheck), steps };
  });
}

/**
 * The dashboard's FRONTIER panel: the newest chapter not cleared yet, linked
 * to its playable step. Else `cleared` (every chapter done) or `empty`.
 */
export function frontierSummary(chapters: readonly FrontierChapterView[]): FrontierSummary {
  for (const chapter of chapters) {
    const step = chapter.status === 'open' ? playableStep(chapter) : null;
    if (step) return { state: 'open', next: { title: chapter.title, date: chapter.date, step } };
  }
  return { state: chapters.length > 0 ? 'cleared' : 'empty', next: null };
}
