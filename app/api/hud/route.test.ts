import { afterAll, beforeEach, describe, expect, mock, spyOn, test } from 'bun:test';

// A fake drizzle chain (as in lib/data/certificates.test.ts): counts queries, returns `rows`.
let rows: Record<string, unknown>[] = [];
let queries = 0;
let dbError: Error | null = null;
const chain = {
  from: () => chain,
  where: () => chain,
  limit: () => chain,
  then: (resolve: (v: unknown) => unknown, reject: (e: unknown) => unknown) =>
    (dbError ? Promise.reject(dbError) : Promise.resolve(rows)).then(resolve, reject),
};
const fakeDb = {
  select: () => {
    queries++;
    return chain;
  },
};

// Clerk's server module can't load under bun test; a stub auth() is enough.
let sessionUserId: string | null = null;
let authError: Error | null = null;
mock.module('@clerk/nextjs/server', () => ({
  auth: async () => {
    if (authError) throw authError;
    return { userId: sessionUserId };
  },
}));

// Keep the real module so the mock does not leak into other test files (bun mocks are global).
const real = { ...(await import('@/db')) };
mock.module('@/db', () => ({ ...real, db: fakeDb }));
const { GET } = await import('./route');

afterAll(() => {
  mock.module('@/db', () => real);
});

const NO_STORE = 'private, no-store';

beforeEach(() => {
  rows = [];
  queries = 0;
  dbError = null;
  sessionUserId = null;
  authError = null;
});

describe('GET /api/hud', () => {
  test('signed out: { status: signed-out }, no DB query, not cached', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'signed-out' });
    expect(queries).toBe(0);
    expect(res.headers.get('Cache-Control')).toBe(NO_STORE);
  });

  test('signed in, no users row: onboarding, not cached', async () => {
    sessionUserId = 'user_1';
    const res = await GET();
    expect(await res.json()).toEqual({ status: 'onboarding' });
    expect(queries).toBe(1);
    expect(res.headers.get('Cache-Control')).toBe(NO_STORE);
  });

  test('signed in with a hero: ready stats, not cached', async () => {
    sessionUserId = 'user_1';
    rows = [{ heroName: 'Ada', track: 'builder', xp: 120, streak: 0, lastActiveAt: null }];
    const res = await GET();
    const body = await res.json();
    expect(body.status).toBe('ready');
    expect(body.stats).toMatchObject({ heroName: 'Ada', track: 'builder', xp: 120, level: 2 });
    expect(res.headers.get('Cache-Control')).toBe(NO_STORE);
  });

  test('a DB or auth() failure is a generic 500, not cached, with no detail', async () => {
    const log = spyOn(console, 'error').mockImplementation(() => {});
    try {
      sessionUserId = 'user_1';
      dbError = Object.assign(new Error('connect ECONNREFUSED 10.0.0.1:5432 user_1'), {
        code: '08006',
      });
      for (const run of [() => GET(), () => ((authError = new TypeError('no session')), GET())]) {
        const res = await run();
        expect(res.status).toBe(500);
        expect(await res.json()).toEqual({ error: 'HUD failed' });
        expect(res.headers.get('Cache-Control')).toBe(NO_STORE);
      }
      // The log names the error type and the DB code only, never the message.
      expect(log.mock.calls[0]).toEqual(['[hud]', 'Error', { code: '08006', constraint: null }]);
      expect(log.mock.calls[1]?.[1]).toBe('TypeError');
      expect(JSON.stringify(log.mock.calls)).not.toContain('ECONNREFUSED');
    } finally {
      log.mockRestore();
    }
  });
});
