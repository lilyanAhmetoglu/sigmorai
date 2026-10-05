import { describe, expect, test } from 'bun:test';
import {
  CHAPTER_COUNT,
  CHAPTER_STEPS,
  MATH_FLOOR_COUNT,
  REALM_COUNT,
  REALMS,
  SIDE_STEPS,
  TRACKS,
} from '@/lib/constants';
import { ExerciseIdSchema, type ExerciseRef } from '@/lib/types';
import {
  buildExerciseId,
  isExerciseId,
  parseExerciseId,
  questBackHref,
  realmExerciseIds,
  trackExerciseIds,
} from './ids';

const range = (from: number, count: number) => Array.from({ length: count }, (_, i) => from + i);

/** Every id the current curriculum can produce, plus two Frontier examples. */
const ALL_REFS: ExerciseRef[] = [
  ...TRACKS.flatMap((track) =>
    range(0, REALM_COUNT).flatMap((realm): ExerciseRef[] => [
      ...range(1, CHAPTER_COUNT).flatMap((chapter) =>
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
      'strategist/r2/c3/challenge',
      { area: 'chapter', track: 'strategist', realm: 2, chapter: 3, step: 'challenge' },
    ],
    ['strategist/r3/boss/challenge', { area: 'boss', track: 'strategist', realm: 3 }],
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
    const ids = ALL_REFS.map(buildExerciseId);
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
    'builder/r0/c7/lesson',
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
    { area: 'chapter', track: 'builder', realm: REALM_COUNT, chapter: 1, step: 'lesson' },
    { area: 'chapter', track: 'builder', realm: -1, chapter: 1, step: 'lesson' },
    { area: 'chapter', track: 'builder', realm: 1.5, chapter: 1, step: 'lesson' },
    { area: 'chapter', track: 'builder', realm: 0, chapter: 0, step: 'lesson' },
    { area: 'boss', track: 'builder', realm: REALM_COUNT },
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

describe('trackExerciseIds', () => {
  test('every chapter step and boss of one track, in map order, all unique', () => {
    const ids = trackExerciseIds('builder');
    expect(ids).toHaveLength(REALM_COUNT * (CHAPTER_COUNT * CHAPTER_STEPS.length + 1));
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids[0]).toBe('builder/r0/c1/lesson');
    expect(ids.at(-1)).toBe(`builder/r${REALM_COUNT - 1}/boss/challenge`);
    expect(ids.every((id) => id.startsWith('builder/'))).toBe(true);
  });
});

describe('realmExerciseIds', () => {
  test('one realm: every chapter step, then the boss', () => {
    const ids = realmExerciseIds('strategist', 3);
    expect(ids).toHaveLength(CHAPTER_COUNT * CHAPTER_STEPS.length + 1);
    expect(ids[0]).toBe('strategist/r3/c1/lesson');
    expect(ids.at(-1)).toBe('strategist/r3/boss/challenge');
  });
});

describe('questBackHref', () => {
  test('a realm quest goes back to its realm on its track; anything else to the catalog', () => {
    expect(questBackHref('builder/r1/c2/challenge')).toBe(
      `/realms/${REALMS[1].slug}?track=builder`,
    );
    expect(questBackHref('strategist/r0/boss/challenge')).toBe(
      `/realms/${REALMS[0].slug}?track=strategist`,
    );
    expect(questBackHref('math/f1/lesson')).toBe('/realms');
    expect(questBackHref('nonsense')).toBe('/realms');
  });
});
