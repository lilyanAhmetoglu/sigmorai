import { describe, expect, test } from 'bun:test';
import { MIN_CHAPTERS, REALMS } from '@/lib/constants';
import type { FrontierChapter, RealmView, TrackOutline } from '@/lib/types';
import {
  activeRealms,
  bossTitle,
  buildFrontierList,
  buildTowerMap,
  buildTrackMap,
  clearedLevels,
  frontierSummary,
  levelStatus,
  playableStep,
  realmChapterCount,
  towerSummary,
} from './track-map';

const outline: TrackOutline = {
  realms: REALMS.map((r) => ({
    id: r.id,
    topic: `topic ${r.id}`,
    lore: `lore ${r.id}`,
    chapters: Array.from({ length: MIN_CHAPTERS }, (_, i) => ({
      id: `c${i + 1}`,
      title: `Chapter ${i + 1}`,
    })),
    boss: {},
  })),
};

const ADVANCED = REALMS.find((r) => r.tier === 'advanced')!.id;
const caseId = (realm: number, chapter: number) => `strategist/r${realm}/c${chapter}/challenge`;
const quickId = (realm: number, chapter: number) => `strategist/r${realm}/c${chapter}/quick-check`;
const bossId = (realm: number) => `strategist/r${realm}/boss/challenge`;

/** Every step of realm 0 and the advanced realm has content. */
const ALL_LIVE = new Set(
  [0, ADVANCED].flatMap((realm) => [
    ...Array.from({ length: MIN_CHAPTERS }, (_, i) => [
      `strategist/r${realm}/c${i + 1}/lesson`,
      caseId(realm, i + 1),
      quickId(realm, i + 1),
    ]).flat(),
    bossId(realm),
  ]),
);
const NONE = new Set<string>();

const map = (live: Set<string>, cleared: Set<string>) =>
  buildTrackMap('strategist', outline, live, cleared);
const realm = (realms: RealmView[], id: number) => realms.find((r) => r.id === id)!;

describe('buildTrackMap', () => {
  test('one realm per REALMS row, 6 chapters + the boss each', () => {
    const { realms } = map(NONE, NONE);
    expect(realms.map((r) => r.id)).toEqual(REALMS.map((r) => r.id));
    for (const r of realms) expect(r.chapters).toHaveLength(MIN_CHAPTERS + 1);
    expect(realms[0].chapters.at(-1)).toMatchObject({ chapter: null, title: bossTitle(REALMS[0]) });
  });

  test('a 9-chapter realm: 9 chapters + the boss, and the boss needs all 9 cases', () => {
    const NINE = 9;
    const grown: TrackOutline = {
      realms: outline.realms.map((r) =>
        r.id !== 0
          ? r
          : {
              ...r,
              chapters: Array.from({ length: NINE }, (_, i) => ({
                id: `c${i + 1}`,
                title: `Chapter ${i + 1}`,
              })),
            },
      ),
    };
    const live = new Set([...Array.from({ length: NINE }, (_, i) => caseId(0, i + 1)), bossId(0)]);
    const cases = (n: number) => new Set(Array.from({ length: n }, (_, i) => caseId(0, i + 1)));
    const r0 = (cleared: Set<string>) =>
      realm(buildTrackMap('strategist', grown, live, cleared).realms, 0);

    expect(r0(NONE).chapters).toHaveLength(NINE + 1);
    expect(realmChapterCount(r0(NONE))).toBe(NINE);
    expect(r0(cases(MIN_CHAPTERS)).chapters.at(-1)!.status).toBe('locked');
    expect(r0(cases(NINE - 1)).chapters.at(-1)!.status).toBe('locked');
    expect(r0(cases(NINE)).chapters.at(-1)!.status).toBe('open');
  });

  test('a visitor: chapter 1 open, chapter 2 locked, boss locked', () => {
    const r0 = realm(map(ALL_LIVE, NONE).realms, 0);
    expect(r0.status).toBe('open');
    expect(r0.chapters[0].status).toBe('open');
    expect(r0.chapters[0].steps.map((s) => s.status)).toEqual(['open', 'open', 'open']);
    expect(r0.chapters[1].status).toBe('locked');
    expect(r0.chapters.at(-1)!.status).toBe('locked');
  });

  test('a step with no content file is "soon", even when its chapter is open', () => {
    const r0 = realm(map(new Set([caseId(0, 1)]), NONE).realms, 0);
    expect(r0.chapters[0].steps.map((s) => s.status)).toEqual(['soon', 'open', 'soon']);
    expect(r0.chapters[0].status).toBe('open');
    // No live step at all → the chapter is "soon", not "locked".
    expect(r0.chapters[1].status).toBe('soon');
  });

  test('clearing a case marks it done and opens the next chapter', () => {
    const r0 = realm(map(ALL_LIVE, new Set([caseId(0, 1)])).realms, 0);
    expect(r0.status).toBe('in-progress');
    expect(r0.chapters[0].status).toBe('done');
    expect(r0.chapters[1].status).toBe('open');
    expect(r0.cleared).toBe(1);
  });

  test('a cleared quick check alone does not clear the chapter', () => {
    const r0 = realm(map(ALL_LIVE, new Set([quickId(0, 1)])).realms, 0);
    expect(r0.chapters[0].status).toBe('open');
    expect(r0.status).toBe('in-progress');
  });

  test('the boss clears the realm', () => {
    const cleared = new Set([
      ...Array.from({ length: MIN_CHAPTERS }, (_, i) => caseId(0, i + 1)),
      bossId(0),
    ]);
    const r0 = realm(map(ALL_LIVE, cleared).realms, 0);
    expect(r0.status).toBe('cleared');
    expect(r0.cleared).toBe(MIN_CHAPTERS + 1);
  });

  test('an advanced realm is tier-locked everywhere, with content and with old clears', () => {
    const r = realm(map(ALL_LIVE, new Set([caseId(ADVANCED, 1)])).realms, ADVANCED);
    expect(r.status).toBe('tier-locked');
    for (const c of r.chapters) {
      expect(c.status).toBe('tier-locked');
      for (const s of c.steps) expect(s.status).toBe('tier-locked');
    }
  });

  test('open-tier realms are open from day one (no realm-to-realm lock)', () => {
    const { realms } = map(NONE, NONE);
    for (const r of realms) {
      expect(r.status).toBe(r.tier === 'advanced' ? 'tier-locked' : 'open');
    }
  });
});

describe('activeRealms', () => {
  test('in-progress realms come first, then open ones; never tier-locked; capped', () => {
    const live = new Set([caseId(2, 1)]);
    const { realms } = map(live, new Set([caseId(2, 1)]));
    const picked = activeRealms(realms, 3);
    expect(picked.map((r) => r.id)).toEqual([2, 0, 1]);
    expect(activeRealms(realms, 99).some((r) => r.status === 'tier-locked')).toBe(false);
  });
});

describe('next step', () => {
  test('is the first open step in map order', () => {
    expect(map(ALL_LIVE, NONE).next).toMatchObject({
      realm: 0,
      chapter: 1,
      step: { exerciseId: 'strategist/r0/c1/lesson' },
    });
  });

  test('skips steps with no content', () => {
    expect(map(new Set([caseId(0, 1)]), NONE).next?.step.exerciseId).toBe(caseId(0, 1));
  });

  test('moves on after a clear', () => {
    const live = new Set([caseId(0, 1), caseId(0, 2)]);
    expect(map(live, new Set([caseId(0, 1)])).next?.step.exerciseId).toBe(caseId(0, 2));
  });

  test('prefers an in-progress realm: cleared realm 2 c1 → realm 2 c2, not realm 0 c1', () => {
    const live = new Set([caseId(0, 1), caseId(2, 1), caseId(2, 2)]);
    expect(map(live, new Set([caseId(2, 1)])).next?.step.exerciseId).toBe(caseId(2, 2));
  });

  test('is null when nothing is open, and never points into an advanced realm', () => {
    expect(map(NONE, NONE).next).toBeNull();
    const advancedOnly = new Set([caseId(ADVANCED, 1)]);
    expect(map(advancedOnly, NONE).next).toBeNull();
  });
});

describe('levelStatus', () => {
  test('maps chapter states to map node states', () => {
    const cleared = new Set([caseId(0, 1)]);
    const chapters = realm(map(ALL_LIVE, cleared).realms, 0).chapters;
    expect(levelStatus(chapters[0], false)).toBe('done');
    expect(levelStatus(chapters[1], false)).toBe('open');
    expect(levelStatus(chapters[1], true)).toBe('current');
    expect(levelStatus(chapters[2], false)).toBe('locked');
  });

  test('tier-locked and soon show as locked, even when current', () => {
    const adv = realm(map(ALL_LIVE, NONE).realms, ADVANCED).chapters[0];
    expect(levelStatus(adv, true)).toBe('locked');
    const soon = realm(map(NONE, NONE).realms, 0).chapters[0];
    expect(soon.status).toBe('soon');
    expect(levelStatus(soon, true)).toBe('locked');
  });

  test('done wins over current', () => {
    const c1 = realm(map(ALL_LIVE, new Set([caseId(0, 1)])).realms, 0).chapters[0];
    expect(levelStatus(c1, true)).toBe('done');
  });
});

describe('playableStep', () => {
  test('an open chapter links to its first open step', () => {
    const c1 = realm(map(ALL_LIVE, NONE).realms, 0).chapters[0];
    expect(playableStep(c1)?.exerciseId).toBe('strategist/r0/c1/lesson');
  });

  test('skips cleared steps', () => {
    const cleared = new Set(['strategist/r0/c1/lesson']);
    const c1 = realm(map(ALL_LIVE, cleared).realms, 0).chapters[0];
    expect(playableStep(c1)?.exerciseId).toBe(caseId(0, 1));
  });

  test('a done chapter with an open step left links to that step', () => {
    const c1 = realm(map(ALL_LIVE, new Set([caseId(0, 1)])).realms, 0).chapters[0];
    expect(playableStep(c1)?.exerciseId).toBe('strategist/r0/c1/lesson');
  });

  test('a fully done chapter replays its first step', () => {
    const cleared = new Set(['strategist/r0/c1/lesson', caseId(0, 1), quickId(0, 1)]);
    const c1 = realm(map(ALL_LIVE, cleared).realms, 0).chapters[0];
    expect(playableStep(c1)?.exerciseId).toBe('strategist/r0/c1/lesson');
  });

  test('a locked, soon or tier-locked chapter is not playable', () => {
    const { realms } = map(ALL_LIVE, NONE);
    expect(playableStep(realm(realms, 0).chapters[1])).toBeNull();
    expect(playableStep(realm(realms, ADVANCED).chapters[0])).toBeNull();
    expect(playableStep(realm(map(NONE, NONE).realms, 0).chapters[0])).toBeNull();
  });

  test('the boss links to its one step once open', () => {
    const cleared = new Set(Array.from({ length: MIN_CHAPTERS }, (_, i) => caseId(0, i + 1)));
    const boss = realm(map(ALL_LIVE, cleared).realms, 0).chapters.at(-1)!;
    expect(playableStep(boss)?.exerciseId).toBe(bossId(0));
  });
});

describe('clearedLevels', () => {
  test('counts cleared chapters and bosses across realms; quick checks do not count', () => {
    const cleared = new Set([caseId(0, 1), caseId(0, 2), quickId(0, 3), caseId(2, 1)]);
    expect(clearedLevels(map(ALL_LIVE, cleared).realms)).toBe(3);
    expect(clearedLevels(map(ALL_LIVE, NONE).realms)).toBe(0);
  });
});

describe('buildTowerMap', () => {
  const floorIds = (n: number) => [`math/f${n}/lesson`, `math/f${n}/quick-check`];
  /** Floors 1–3 have files, like content/math today. */
  const LIVE = new Set([1, 2, 3].flatMap(floorIds));
  const status = (floors: ReturnType<typeof buildTowerMap>) => floors.map((f) => f.status);

  test('8 floors; a visitor sees floor 1 open, 2–3 locked, the rest coming soon', () => {
    const floors = buildTowerMap(LIVE, NONE);
    expect(floors.map((f) => f.chapter)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(status(floors)).toEqual(['open', 'locked', 'locked', ...Array(5).fill('soon')]);
    expect(floors[0].steps.map((s) => s.step)).toEqual(['lesson', 'quick-check']);
    expect(playableStep(floors[0])?.exerciseId).toBe('math/f1/lesson');
    expect(playableStep(floors[1])).toBeNull();
  });

  test('the floor 1 quick check clears floor 1 and opens floor 2', () => {
    const floors = buildTowerMap(LIVE, new Set(floorIds(1)));
    expect(status(floors).slice(0, 3)).toEqual(['done', 'open', 'locked']);
    expect(playableStep(floors[0])?.exerciseId).toBe('math/f1/lesson');
  });

  test('the lesson alone does not clear a floor', () => {
    const floors = buildTowerMap(LIVE, new Set(['math/f1/lesson']));
    expect(status(floors).slice(0, 2)).toEqual(['open', 'locked']);
    expect(playableStep(floors[0])?.exerciseId).toBe('math/f1/quick-check');
  });
});

describe('towerSummary', () => {
  const floorIds = (n: number) => [`math/f${n}/lesson`, `math/f${n}/quick-check`];
  /** Floors 1–3 have files, like content/math today. */
  const LIVE = new Set([1, 2, 3].flatMap(floorIds));
  const summary = (live: Set<string>, cleared: Set<string>) =>
    towerSummary(buildTowerMap(live, cleared));

  test('a new player: floor 1 open at its lesson, 0 of 3 live floors cleared', () => {
    const s = summary(LIVE, NONE);
    expect(s.state).toBe('open');
    expect(s.next?.floor).toBe(1);
    expect(s.next?.title).toBe(buildTowerMap(LIVE, NONE)[0].title);
    expect(s.next?.step.exerciseId).toBe('math/f1/lesson');
    expect([s.cleared, s.live]).toEqual([0, 3]);
  });

  test('lesson done: the next step is the same floor quick check', () => {
    const s = summary(LIVE, new Set(['math/f1/lesson']));
    expect(s.next?.floor).toBe(1);
    expect(s.next?.step.exerciseId).toBe('math/f1/quick-check');
    expect(s.cleared).toBe(0);
  });

  test('floor 1 cleared: floor 2 is next, 1 of 3 cleared', () => {
    const s = summary(LIVE, new Set(floorIds(1)));
    expect(s.next?.floor).toBe(2);
    expect(s.next?.step.exerciseId).toBe('math/f2/lesson');
    expect([s.cleared, s.live]).toEqual([1, 3]);
  });

  test('every live floor cleared: state cleared, no next floor', () => {
    expect(summary(LIVE, LIVE)).toEqual({ state: 'cleared', next: null, cleared: 3, live: 3 });
  });

  test('a gap with no content: nothing playable, state soon', () => {
    const live = new Set([1, 3].flatMap(floorIds));
    const s = summary(live, new Set(floorIds(1)));
    expect(s).toEqual({ state: 'soon', next: null, cleared: 1, live: 2 });
  });

  test('no live floors at all: state soon, 0 of 0', () => {
    expect(summary(NONE, NONE)).toEqual({ state: 'soon', next: null, cleared: 0, live: 0 });
  });
});

describe('buildFrontierList + frontierSummary', () => {
  const chapter = (date: string, slug: string): FrontierChapter => ({
    folder: `${date}-${slug}`,
    date,
    slug,
    title: `Title ${slug}`,
    minutes: 5,
    lessonId: `frontier/${date}-${slug}/lesson`,
    quickCheckId: `frontier/${date}-${slug}/quick-check`,
  });
  /** Newest first, as listFrontierChapters returns them. */
  const CHAPTERS = [chapter('2026-10-06', 'newer'), chapter('2026-10-05', 'older')];
  const LIVE = new Set(CHAPTERS.flatMap((c) => [c.lessonId, c.quickCheckId]));
  const list = (cleared: Set<string>) => buildFrontierList(CHAPTERS, LIVE, cleared);

  test('a visitor: every chapter open at its lesson, order kept', () => {
    const views = list(NONE);
    expect(views.map((v) => [v.folder, v.status])).toEqual([
      ['2026-10-06-newer', 'open'],
      ['2026-10-05-older', 'open'],
    ]);
    expect(views[0].steps.map((s) => s.step)).toEqual(['lesson', 'quick-check']);
    expect(playableStep(views[1])?.exerciseId).toBe('frontier/2026-10-05-older/lesson');
  });

  test('the quick check clears a chapter; the lesson alone does not', () => {
    const lessonOnly = list(new Set([CHAPTERS[0].lessonId]));
    expect(lessonOnly[0].status).toBe('open');
    expect(playableStep(lessonOnly[0])?.exerciseId).toBe(CHAPTERS[0].quickCheckId);
    expect(list(new Set([CHAPTERS[0].quickCheckId]))[0].status).toBe('done');
  });

  test('a chapter with no live step is soon', () => {
    const live = new Set([CHAPTERS[0].lessonId]);
    const views = buildFrontierList(CHAPTERS, live, NONE);
    expect(views.map((v) => v.status)).toEqual(['open', 'soon']);
  });

  test('summary: the newest chapter not cleared, at its playable step', () => {
    expect(frontierSummary(list(NONE))).toEqual({
      state: 'open',
      next: { title: 'Title newer', date: '2026-10-06', step: list(NONE)[0].steps[0] },
    });
    const s = frontierSummary(list(new Set([CHAPTERS[0].quickCheckId])));
    expect(s.next?.step.exerciseId).toBe(CHAPTERS[1].lessonId);
  });

  test('summary: every chapter cleared, or no chapter at all', () => {
    expect(frontierSummary(list(LIVE))).toEqual({ state: 'cleared', next: null });
    expect(frontierSummary([])).toEqual({ state: 'empty', next: null });
  });
});

describe('shared-chapters credit on the map', () => {
  const credited = new Map([[caseId(0, 4), 'builder' as const]]);
  const r0 = () =>
    realm(
      buildTrackMap('strategist', outline, ALL_LIVE, new Set([caseId(0, 4)]), credited).realms,
      0,
    );

  test('a credited chapter is done, says where it was cleared, and its steps open', () => {
    const c4 = r0().chapters[3];
    expect(c4.status).toBe('done');
    expect(c4.creditedFrom).toBe('builder');
    expect(c4.steps.find((s) => s.step === 'lesson')?.status).toBe('open');
  });

  test('the next chapter opens; the realm counts the credited chapter', () => {
    const view = r0();
    expect(view.chapters[4].status).toBe('open');
    expect(view.cleared).toBe(1);
  });

  test('a real clear has no creditedFrom', () => {
    const view = realm(map(ALL_LIVE, new Set([caseId(0, 1)])).realms, 0);
    expect(view.chapters[0].creditedFrom).toBeUndefined();
  });
});
