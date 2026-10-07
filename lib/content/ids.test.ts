import { describe, expect, test } from 'bun:test';
import {
  CHAPTER_STEPS,
  CONTENT_DIR,
  MATH_FLOOR_COUNT,
  MAX_CHAPTERS,
  MIN_CHAPTERS,
  OUTLINE_FILE,
  REALMS,
  SIDE_STEPS,
  TRACKS,
} from '@/lib/constants';
import { ExerciseIdSchema, trackOutlineSchema, type ExerciseRef } from '@/lib/types';
import { CORE_IDS, CREATOR_ORDER, fixtureOutline, SPECIALIST_REALMS } from './__fixtures__/realms';
import {
  buildExerciseId,
  frontierExerciseIds,
  isExerciseId,
  parseBlogFileName,
  parseChapterId,
  parseExerciseId,
  mathExerciseIds,
  questBackHref,
  realmExerciseIds,
  trackExerciseIds,
} from './ids';

const range = (from: number, count: number) => Array.from({ length: count }, (_, i) => from + i);

/** Every id the grammar allows (c1–c12 in every realm), plus two Frontier examples. */
const ALL_REFS: ExerciseRef[] = [
  ...TRACKS.flatMap((track) =>
    CORE_IDS.flatMap((realm): ExerciseRef[] => [
      ...range(1, MAX_CHAPTERS).flatMap((chapter) =>
        CHAPTER_STEPS.map((step) => ({ area: 'chapter' as const, track, realm, chapter, step })),
      ),
      { area: 'boss', track, realm },
    ]),
  ),
  ...range(1, MATH_FLOOR_COUNT).flatMap((floor) =>
    SIDE_STEPS.map((step) => ({ area: 'math' as const, floor, step })),
  ),
  ...SIDE_STEPS.map((step) => ({
    area: 'frontier' as const,
    date: '2026-10-05',
    slug: 'claude-agent-sdk-2',
    step,
  })),
];

describe('exercise ids round-trip', () => {
  test.each([
    [
      'builder/r0/c1/lesson',
      { area: 'chapter', track: 'builder', realm: 0, chapter: 1, step: 'lesson' },
    ],
    [
      'builder/r8/c6/quick-check',
      { area: 'chapter', track: 'builder', realm: 8, chapter: 6, step: 'quick-check' },
    ],
    [
      'creator/r1/c12/quick-check',
      { area: 'chapter', track: 'creator', realm: 1, chapter: 12, step: 'quick-check' },
    ],
    [
      'strategist/r2/c3/challenge',
      { area: 'chapter', track: 'strategist', realm: 2, chapter: 3, step: 'challenge' },
    ],
    ['strategist/r3/boss/challenge', { area: 'boss', track: 'strategist', realm: 3 }],
    ['creator/r0/boss/challenge', { area: 'boss', track: 'creator', realm: 0 }],
    [
      'creator/r0/c1/lesson',
      { area: 'chapter', track: 'creator', realm: 0, chapter: 1, step: 'lesson' },
    ],
    ['math/f1/lesson', { area: 'math', floor: 1, step: 'lesson' }],
    ['math/f8/quick-check', { area: 'math', floor: 8, step: 'quick-check' }],
    [
      'frontier/2024-02-29-leap-day/lesson',
      { area: 'frontier', date: '2024-02-29', slug: 'leap-day', step: 'lesson' },
    ],
  ] as const)('%s', (id, ref) => {
    expect(parseExerciseId(id)).toEqual(ref);
    expect(buildExerciseId(ref)).toBe(id);
  });

  test(`all ${ALL_REFS.length} curriculum ids`, () => {
    const ids = ALL_REFS.map((ref) => buildExerciseId(ref));
    expect(new Set(ids).size).toBe(ids.length);
    for (const [i, id] of ids.entries()) expect(parseExerciseId(id)).toEqual(ALL_REFS[i]);
  });
});

describe('bad ids are rejected', () => {
  test.each([
    '',
    'builder',
    'builder/r0/c1',
    'builder/r0/c1/lesson/',
    '/builder/r0/c1/lesson',
    ' builder/r0/c1/lesson',
    'Builder/r0/c1/lesson',
    'wizard/r0/c1/lesson',
    'builder/r9/c1/lesson',
    'builder/r00/c1/lesson',
    'builder/r0/c0/lesson',
    'builder/r0/c13/lesson',
    'builder/r0/c120/lesson',
    'builder/r99/c1/lesson',
    'builder/r0/c01/lesson',
    'builder/r0/c1/boss',
    'builder/r0/boss/lesson',
    'builder/r0/boss',
    'math/r0/c1/lesson',
    'math/f0/lesson',
    'math/f9/lesson',
    'math/f1/challenge',
    'builder/f1/lesson',
    'frontier/2026-10-05-slug/challenge',
    'frontier/2026-10-05/lesson',
    'frontier/2026-10-05-/lesson',
    'frontier/2026-10-05-Bad-Slug/lesson',
    'frontier/2026-10-05-bad--slug/lesson',
    'frontier/2026-13-01-slug/lesson',
    'frontier/2026-02-30-slug/lesson',
    'frontier/2025-02-29-slug/lesson',
    'frontier/26-10-05-slug/lesson',
  ])('%p', (id) => {
    expect(parseExerciseId(id)).toBeNull();
    expect(isExerciseId(id)).toBe(false);
    expect(ExerciseIdSchema.safeParse(id).success).toBe(false);
  });

  test.each([
    { area: 'chapter', track: 'builder', realm: REALMS.length, chapter: 1, step: 'lesson' },
    { area: 'chapter', track: 'builder', realm: -1, chapter: 1, step: 'lesson' },
    { area: 'chapter', track: 'builder', realm: 1.5, chapter: 1, step: 'lesson' },
    { area: 'chapter', track: 'builder', realm: 0, chapter: 0, step: 'lesson' },
    { area: 'boss', track: 'builder', realm: REALMS.length },
    { area: 'math', floor: MATH_FLOOR_COUNT + 1, step: 'lesson' },
    { area: 'frontier', date: '2026-02-30', slug: 'x', step: 'lesson' },
    { area: 'frontier', date: '2026-10-05', slug: 'Not A Slug', step: 'lesson' },
  ] as ExerciseRef[])('build throws for %p', (ref) => {
    expect(() => buildExerciseId(ref)).toThrow(RangeError);
  });

  test('the Zod schema accepts a valid id', () => {
    expect(ExerciseIdSchema.parse('math/f2/lesson')).toBe('math/f2/lesson');
  });
});

/** A track's outline as committed in content/ (creator r1 has 9 chapters; every other realm 6). */
const realOutline = async (track: (typeof TRACKS)[number]) =>
  trackOutlineSchema(track).parse(
    await Bun.file(`${import.meta.dir}/../../${CONTENT_DIR}/${track}/${OUTLINE_FILE}`).json(),
  );

/**
 * The id list before chapter counts came from the outline (fixed 9 × 6):
 * r0..r8, c1..c6 each step, then the boss. Written out by hand on purpose.
 * `grown` lists the realms that grew past 6 chapters since (realm → count);
 * `inserted` lists the specialist realms placed right after a core realm.
 */
const gridIds = (
  track: string,
  grown: Record<number, number> = {},
  inserted: Record<number, number[]> = {},
) =>
  range(0, 9)
    .flatMap((core) => [core, ...(inserted[core] ?? [])])
    .flatMap((realm) => [
      ...range(1, grown[realm] ?? 6).flatMap((chapter) =>
        ['lesson', 'challenge', 'quick-check'].map(
          (step) => `${track}/r${realm}/c${chapter}/${step}`,
        ),
      ),
      `${track}/r${realm}/boss/challenge`,
    ]);

/** Realms grown past 6 chapters in each track's committed outline (realm → chapter count). */
const GROWN: Record<(typeof TRACKS)[number], Record<number, number>> = {
  builder: {},
  strategist: {},
  creator: { 1: 9 },
};

/**
 * Specialist realms in each track's committed outline, by the core realm they
 * follow. Written by hand on purpose: each new specialist realm adds one entry.
 */
const INSERTED: Record<(typeof TRACKS)[number], Record<number, number[]>> = {
  builder: {},
  strategist: {},
  creator: { 2: [10], 5: [9] },
};

describe('trackExerciseIds', () => {
  // A grown realm also needs lib/data/quest.ts to pass the outline count to
  // nextCaseId (it does since creator r1 grew to 9 chapters).
  test.each([...TRACKS])(
    'regression: %s, from its outline, equals the 9 × 6 grid plus its grown chapters and specialist realms',
    async (track) => {
      expect(trackExerciseIds(track, await realOutline(track))).toEqual(
        gridIds(track, GROWN[track], INSERTED[track]),
      );
    },
  );

  test('every chapter step and boss of one track, in map order, all unique', async () => {
    const ids = trackExerciseIds('builder', await realOutline('builder'));
    expect(ids).toHaveLength(CORE_IDS.length * (MIN_CHAPTERS * CHAPTER_STEPS.length + 1));
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids[0]).toBe('builder/r0/c1/lesson');
    expect(ids.at(-1)).toBe(`builder/r${CORE_IDS.at(-1)}/boss/challenge`);
    expect(ids.every((id) => id.startsWith('builder/'))).toBe(true);
  });
});

describe('specialist realms (fixture table: r9 creator, r10 builder)', () => {
  const T = SPECIALIST_REALMS;

  test('an owned specialist realm parses on its owner track only', () => {
    expect(parseExerciseId('creator/r9/c1/lesson', T)).toEqual({
      area: 'chapter',
      track: 'creator',
      realm: 9,
      chapter: 1,
      step: 'lesson',
    });
    expect(parseExerciseId('creator/r9/boss/challenge', T)).toEqual({
      area: 'boss',
      track: 'creator',
      realm: 9,
    });
    expect(parseExerciseId('builder/r10/c12/challenge', T)).toMatchObject({ realm: 10 });
    for (const id of [
      'builder/r9/c1/lesson',
      'strategist/r9/c1/lesson',
      'strategist/r9/boss/challenge',
      'creator/r10/c1/lesson',
      'creator/r11/c1/lesson',
      'creator/r9/c13/lesson',
      'creator/r99/c1/lesson',
    ]) {
      expect(parseExerciseId(id, T)).toBeNull();
    }
  });

  test('r1 and r10 do not clash', () => {
    expect(parseExerciseId('creator/r1/c1/lesson', T)).toMatchObject({ realm: 1 });
    expect(parseExerciseId('builder/r1/c1/lesson', T)).toMatchObject({ realm: 1 });
    expect(parseExerciseId('builder/r10/c1/lesson', T)).toMatchObject({ realm: 10 });
  });

  test('build throws for a realm the track does not have', () => {
    expect(buildExerciseId({ area: 'boss', track: 'creator', realm: 9 }, T)).toBe(
      'creator/r9/boss/challenge',
    );
    expect(() => buildExerciseId({ area: 'boss', track: 'builder', realm: 9 }, T)).toThrow(
      RangeError,
    );
  });

  test('every old id still parses with the fixture table, the same way', () => {
    for (const ref of ALL_REFS) {
      const id = buildExerciseId(ref);
      expect(parseExerciseId(id, T)).toEqual(parseExerciseId(id));
    }
  });

  test.each(REALMS.filter((r) => r.track !== null).map((r) => [r.id, r.track] as const))(
    'with the real REALMS, specialist r%d parses on its owner path (%s) only',
    (realm, owner) => {
      for (const track of TRACKS) {
        expect(parseExerciseId(`${track}/r${realm}/c1/lesson`) !== null).toBe(track === owner);
      }
    },
  );

  test('trackExerciseIds follows the outline order, specialist realm included', () => {
    const ids = trackExerciseIds('creator', fixtureOutline(CREATOR_ORDER), T);
    const realms = ids.map((id) => Number(id.split('/')[1].slice(1)));
    expect([...new Set(realms)]).toEqual(CREATOR_ORDER);
    expect(ids).toContain('creator/r9/c6/quick-check');
    expect(() => trackExerciseIds('builder', fixtureOutline(CREATOR_ORDER), T)).toThrow(RangeError);
  });
});

describe('realmExerciseIds', () => {
  test('one realm: every chapter step, then the boss', () => {
    const ids = realmExerciseIds('strategist', 3, MIN_CHAPTERS);
    expect(ids).toHaveLength(MIN_CHAPTERS * CHAPTER_STEPS.length + 1);
    expect(ids[0]).toBe('strategist/r3/c1/lesson');
    expect(ids.at(-1)).toBe('strategist/r3/boss/challenge');
  });

  test('a 9-chapter realm: c1–c9, then the boss', () => {
    const ids = realmExerciseIds('creator', 1, 9);
    expect(ids).toHaveLength(9 * CHAPTER_STEPS.length + 1);
    expect(ids.at(-2)).toBe('creator/r1/c9/quick-check');
    expect(ids.at(-1)).toBe('creator/r1/boss/challenge');
  });
});

describe('questBackHref', () => {
  test('a realm quest goes back to its realm, a floor to the tower, a Frontier step to the Frontier, anything else to the catalog', () => {
    expect(questBackHref('builder/r1/c2/challenge')).toBe(
      `/realms/${REALMS[1].slug}?track=builder`,
    );
    expect(questBackHref('strategist/r0/boss/challenge')).toBe(
      `/realms/${REALMS[0].slug}?track=strategist`,
    );
    expect(questBackHref('math/f1/lesson')).toBe('/math');
    expect(questBackHref('frontier/2026-10-05-some-slug/lesson')).toBe('/frontier');
    expect(questBackHref('frontier/2026-10-05-some-slug/quick-check')).toBe('/frontier');
    expect(questBackHref('nonsense')).toBe('/realms');
  });
});

describe('frontierExerciseIds', () => {
  test('lesson then quick check per folder, in the order given', () => {
    expect(frontierExerciseIds(['2026-10-06-b', '2026-10-05-a'])).toEqual([
      'frontier/2026-10-06-b/lesson',
      'frontier/2026-10-06-b/quick-check',
      'frontier/2026-10-05-a/lesson',
      'frontier/2026-10-05-a/quick-check',
    ]);
  });

  test('a folder that breaks the grammar has no ids', () => {
    expect(
      frontierExerciseIds(['notes', '2026-02-30-bad-date', '2026-10-05-Bad', '2026-10-05']),
    ).toEqual([]);
  });
});

describe('mathExerciseIds', () => {
  test('lesson then quick check on every floor, in order', () => {
    const ids = mathExerciseIds();
    expect(ids).toHaveLength(MATH_FLOOR_COUNT * SIDE_STEPS.length);
    expect(ids.slice(0, 3)).toEqual(['math/f1/lesson', 'math/f1/quick-check', 'math/f2/lesson']);
  });
});

describe('parseBlogFileName', () => {
  test('date and slug from <YYYY-MM-DD>-<slug>.mdx', () => {
    expect(parseBlogFileName('2026-10-06-be-specific.mdx')).toEqual({
      date: '2026-10-06',
      slug: 'be-specific',
    });
  });

  test('anything else is null', () => {
    for (const name of [
      'be-specific.mdx',
      '2026-10-06-be-specific.md',
      '2026-10-06-Be-Specific.mdx',
      '2026-02-30-impossible.mdx',
      '2026-10-06-.mdx',
      '2026-10-06-x.mdx.bak',
      '2026-10-06-xmdx',
    ]) {
      expect(parseBlogFileName(name)).toBeNull();
    }
  });
});

describe('parseChapterId', () => {
  test('a realm chapter without its step parses', () => {
    expect(parseChapterId('strategist/r1/c3')).toEqual({
      track: 'strategist',
      realm: 1,
      chapter: 3,
    });
  });

  test('a boss, a Math floor, a full exercise id or a bad shape is null', () => {
    for (const id of [
      'builder/r1/boss',
      'math/f1',
      'builder/r1/c1/lesson',
      'builder/r9/c1',
      'builder/r1/c13',
    ]) {
      expect(parseChapterId(id)).toBeNull();
    }
  });
});
