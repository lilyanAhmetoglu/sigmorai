import { describe, expect, test } from 'bun:test';
import {
  AUDIENCES,
  CLERK_REDIRECT_PARAM,
  ONBOARDING_HREF,
  TRACKS,
  audienceFor,
  onboardingHref,
  signUpHref,
} from '@/lib/constants';
import { parsePathParam, pathFromRedirect } from './path-param';

describe('parsePathParam', () => {
  test.each([...TRACKS])('accepts %s', (track) => {
    expect(parsePathParam(track)).toBe(track);
  });

  // Wrapped in [] so test.each doesn't spread the array case into arguments.
  test.each([
    [undefined],
    [''],
    ['Creator'],
    ['beginner'],
    ['admin'],
    [['creator', 'builder']],
    [3],
    [null],
  ])('ignores %p', (value: unknown) => {
    expect(parsePathParam(value)).toBeUndefined();
  });
});

describe('pathFromRedirect', () => {
  test.each([...TRACKS])('reads %s from an onboarding URL', (track) => {
    expect(pathFromRedirect(onboardingHref(track))).toBe(track);
    // Clerk may hand the value back as an absolute URL.
    expect(pathFromRedirect(`https://sigmorai.com${onboardingHref(track)}`)).toBe(track);
  });

  test.each([
    [undefined],
    [['/onboarding?path=creator']],
    [ONBOARDING_HREF],
    ['/onboarding?path=hacker'],
    ['/dashboard?path=creator'],
    ['/onboarding/x?path=creator'],
    ['https://evil.example/phish?path=creator'],
    ['javascript:alert(1)'],
  ])('ignores %p', (value: unknown) => {
    expect(pathFromRedirect(value)).toBeUndefined();
  });

  test('round-trips through signUpHref', () => {
    for (const track of TRACKS) {
      const url = new URL(signUpHref(track), 'https://sigmorai.com');
      expect(pathFromRedirect(url.searchParams.get(CLERK_REDIRECT_PARAM))).toBe(track);
    }
  });
});

describe('onboardingHref', () => {
  test('adds ?path= only for a track', () => {
    expect(onboardingHref()).toBe('/onboarding');
    expect(onboardingHref('creator')).toBe('/onboarding?path=creator');
  });
});

describe('landing audience cards', () => {
  test('every track has its own card', () => {
    for (const track of TRACKS) expect(audienceFor(track).track).toBe(track);
  });

  test('every card has its own start label', () => {
    const labels = AUDIENCES.map((a) => a.cta);
    expect(new Set(labels).size).toBe(AUDIENCES.length);
  });
});
