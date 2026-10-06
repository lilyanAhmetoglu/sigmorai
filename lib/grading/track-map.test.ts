import { describe, expect, test } from 'bun:test';
import { CHAPTER_COUNT, REALMS } from '@/lib/constants';
import type { RealmView, TrackOutline } from '@/lib/types';
import {
  activeRealms,
  bossTitle,
  buildTrackMap,
  clearedLevels,
  levelStatus,
  playableStep,
} from './track-map';

const outline: TrackOutline = {
  realms: REALMS.map((r) => ({
    id: r.id,
    topic: `topic ${r.id}`,
    lore: `lore ${r.id}`,
    chapters: Array.from({ length: CHAPTER_COUNT }, (_, i) => ({
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
    ...Array.from({ length: CHAPTER_COUNT }, (_, i) => [
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
    for (const r of realms) expect(r.chapters).toHaveLength(CHAPTER_COUNT + 1);
    expect(realms[0].chapters.at(-1)).toMatchObject({ chapter: null, title: bossTitle(REALMS[0]) });
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
      ...Array.from({ length: CHAPTER_COUNT }, (_, i) => caseId(0, i + 1)),
      bossId(0),
    ]);
    const r0 = realm(map(ALL_LIVE, cleared).realms, 0);
    expect(r0.status).toBe('cleared');
    expect(r0.cleared).toBe(CHAPTER_COUNT + 1);
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
    const cleared = new Set(Array.from({ length: CHAPTER_COUNT }, (_, i) => caseId(0, i + 1)));
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
