import { afterAll, beforeEach, describe, expect, mock, test } from 'bun:test';

// A fake drizzle chain: records the selected fields and the call count, returns `rows`.
let rows: Record<string, unknown>[] = [];
let selected: string[] = [];
let queries = 0;
const chain = {
  from: () => chain,
  innerJoin: () => chain,
  leftJoin: () => chain,
  where: () => chain,
  limit: () => chain,
  then: (resolve: (v: unknown) => unknown, reject: (e: unknown) => unknown) =>
    Promise.resolve(rows).then(resolve, reject),
};
const fakeDb = {
  select: (fields: Record<string, unknown>) => {
    queries++;
    selected = Object.keys(fields);
    return chain;
  },
};

// Clerk's server module can't load under bun test (it pulls next/navigation's client
// context), so no test can import the real one; a stub auth() is enough here.
let sessionUserId: string | null = null;
mock.module('@clerk/nextjs/server', () => ({ auth: async () => ({ userId: sessionUserId }) }));

// Keep the real module so the mock does not leak into other test files (bun mocks are global).
const real = { ...(await import('@/db')) };
mock.module('@/db', () => ({ ...real, db: fakeDb }));
const { getCertificate, getMyAchievements, getOwnCertificates } = await import('./certificates');

afterAll(() => {
  mock.module('@/db', () => real);
});

const UUID = '0b6f3c1e-9a4d-4c2b-8f1e-2d3c4b5a6978';
const PRIVATE = ['id', 'userId', 'email', 'xp', 'streak', 'level', 'lastActiveAt', 'avatarUrl'];

beforeEach(() => {
  rows = [];
  selected = [];
  queries = 0;
  sessionUserId = null;
});

describe('getCertificate', () => {
  test('bad id, unknown hero and not cleared are all the same null', async () => {
    // Bad id and locked/unknown achievement: refused before any query.
    expect(await getCertificate('user_2abc', 'builder-r0')).toBeNull();
    expect(await getCertificate(UUID, 'builder-r8')).toBeNull();
    expect(queries).toBe(0);
    // Unknown hero and a hero who has not cleared it: the join finds no row.
    rows = [];
    expect(await getCertificate(UUID, 'builder-r0')).toBeNull();
    expect(await getCertificate(UUID, 'math-tower')).toBeNull();
    expect(queries).toBe(2);
  });

  test('selects and returns no private field', async () => {
    rows = [{ heroName: 'Ada', completedAt: new Date('2026-10-06T22:00:00Z') }];
    const view = await getCertificate(UUID, 'strategist-r1');
    expect(selected.sort()).toEqual(['completedAt', 'heroName']);
    expect(view).toEqual({
      publicId: UUID,
      achievement: expect.objectContaining({ slug: 'strategist-r1' }),
      heroName: 'Ada',
      earnedOn: '2026-10-06',
    });
    for (const key of PRIVATE) expect(view).not.toHaveProperty(key);
  });
});

describe('getMyAchievements', () => {
  test('no users row → empty', async () => {
    expect(await getMyAchievements('user_x')).toEqual([]);
  });

  test('a player with no clears → empty; clears → links on the public id', async () => {
    rows = [{ publicId: UUID, exerciseId: null, completedAt: null }];
    expect(await getMyAchievements('user_x')).toEqual([]);

    rows = [
      {
        publicId: UUID,
        exerciseId: 'builder/r0/boss/challenge',
        completedAt: new Date('2026-10-01T10:00:00Z'),
      },
    ];
    const earned = await getMyAchievements('user_x');
    expect(earned.map((e) => e.href)).toEqual([`/cert/${UUID}/builder-r0`]);
    expect(selected.sort()).toEqual(['completedAt', 'exerciseId', 'publicId']);
  });
});

describe('getOwnCertificates', () => {
  test('signed out → empty, no query', async () => {
    expect(await getOwnCertificates()).toEqual([]);
    expect(queries).toBe(0);
  });

  test('signed in → reads that session user only', async () => {
    sessionUserId = 'user_me';
    rows = [{ publicId: UUID, exerciseId: null, completedAt: null }];
    expect(await getOwnCertificates()).toEqual([]);
    expect(queries).toBe(1);
  });
});
