import { describe, expect, test } from 'bun:test';
import { decideClerk, hasClerkSessionHint } from './clerk-cookie';

describe('hasClerkSessionHint', () => {
  test('a sign-in time means a likely session', () => {
    expect(hasClerkSessionHint('__client_uat=1791459873')).toBe(true);
    expect(hasClerkSessionHint('a=1; __client_uat_Xy-9=1791459873; b=2')).toBe(true);
  });

  test('0, no cookie or a look-alike name is no session', () => {
    expect(hasClerkSessionHint('')).toBe(false);
    expect(hasClerkSessionHint('__client_uat=0')).toBe(false);
    expect(hasClerkSessionHint('__client_uat_Xy9=0; theme=dark')).toBe(false);
    expect(hasClerkSessionHint('x__client_uat=1791459873')).toBe(false);
    expect(hasClerkSessionHint('__client_uat=12abc')).toBe(false);
  });
});

describe('decideClerk', () => {
  const PLAYER = '__client_uat=1791459873';

  test('a layout that knows wins, before and after hydration', () => {
    expect(decideClerk(true, false, '')).toBe(true);
    expect(decideClerk(true, true, '')).toBe(true);
    expect(decideClerk(false, false, PLAYER)).toBe(false);
    expect(decideClerk(false, true, PLAYER)).toBe(false);
  });

  test('a public page mounts only after hydration, for a likely player', () => {
    expect(decideClerk(undefined, false, PLAYER)).toBe(false);
    expect(decideClerk(undefined, true, PLAYER)).toBe(true);
    expect(decideClerk(undefined, true, '__client_uat=0')).toBe(false);
    expect(decideClerk(undefined, true, '')).toBe(false);
  });
});
