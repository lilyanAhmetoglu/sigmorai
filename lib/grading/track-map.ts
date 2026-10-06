import { BOSS_STEP, CHAPTER_COUNT, CHAPTER_STEPS, REALMS } from '@/lib/constants';
import { isRealmOpen } from '@/lib/content/curriculum';
import { buildExerciseId } from '@/lib/content/ids';
import type {
  ChapterView,
  ExerciseRef,
  NextStep,
  Realm,
  RealmStatus,
  RealmView,
  StepStatus,
  StepView,
  Track,
  TrackMap,
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
  const step = ref.area === 'chapter' ? ref.step : BOSS_STEP;
  return { step, exerciseId, status: stepStatus(ref, exerciseId, sets) };
}

/** A chapter takes its case's state, except "soon" only when no step is live. */
function chapterStatus(steps: StepView[], caseStep: StepView): StepStatus {
  if (caseStep.status === 'tier-locked' || caseStep.status === 'done') return caseStep.status;
  if (steps.every((s) => s.status === 'soon')) return 'soon';
  if (steps.some((s) => s.status === 'open' || s.status === 'done')) return 'open';
  return 'locked';
}

function chapterViews(track: Track, realm: Realm, titles: string[], sets: Sets): ChapterView[] {
  const chapters = titles.slice(0, CHAPTER_COUNT).map((title, i): ChapterView => {
    const chapter = i + 1;
    const steps = CHAPTER_STEPS.map((step) =>
      stepView({ area: 'chapter', track, realm: realm.id, chapter, step }, sets),
    );
    const caseStep = steps.find((s) => s.step === BOSS_STEP)!;
    return { chapter, title, status: chapterStatus(steps, caseStep), steps };
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

/** The dashboard's realms: in progress first, then open, in map order. Never cleared or tier-locked. */
export function activeRealms(realms: RealmView[], limit = realms.length): RealmView[] {
  const pick = (status: RealmStatus) => realms.filter((r) => r.status === status);
  return [...pick('in-progress'), ...pick('open')].slice(0, limit);
}

/** Chapters and bosses cleared on the whole track (the dashboard's LEVELS CLEARED). */
export const clearedLevels = (realms: RealmView[]): number =>
  realms.reduce((sum, r) => sum + r.cleared, 0);

export function buildTrackMap(
  track: Track,
  outline: TrackOutline,
  live: ReadonlySet<string>,
  cleared: ReadonlySet<string>,
): TrackMap {
  const sets = { live, cleared };
  const realms = REALMS.map((realm): RealmView => {
    const { topic, lore, chapters: outlined } = outline.realms[realm.id];
    const chapters = chapterViews(
      track,
      realm,
      outlined.map((c) => c.title),
      sets,
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
