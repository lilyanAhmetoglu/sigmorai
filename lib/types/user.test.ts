import { describe, expect, test } from 'bun:test';
import { HERO_NAME_MAX, HERO_NAME_MIN } from '@/lib/constants';
import { HeroNameSchema, OnboardingSchema, SwitchTrackSchema } from './user';

describe('HeroNameSchema', () => {
  test.each(['Nora', 'nora_builds', 'Zoë', 'Ali 2', "O'Neil", 'a.b-c', '李华'])(
    'accepts %p',
    (n) => {
      expect(HeroNameSchema.safeParse(n).success).toBe(true);
    },
  );

  test('trims before checking length', () => {
    expect(HeroNameSchema.parse('  Nora  ')).toBe('Nora');
    expect(HeroNameSchema.safeParse(' a ').success).toBe(false);
  });

  test('length edges', () => {
    expect(HeroNameSchema.safeParse('a'.repeat(HERO_NAME_MIN)).success).toBe(true);
    expect(HeroNameSchema.safeParse('a'.repeat(HERO_NAME_MIN - 1)).success).toBe(false);
    expect(HeroNameSchema.safeParse('a'.repeat(HERO_NAME_MAX)).success).toBe(true);
    expect(HeroNameSchema.safeParse('a'.repeat(HERO_NAME_MAX + 1)).success).toBe(false);
  });

  test.each(['<script>', 'a@b', 'name\nline', 'emoji 🙂', 'semi;colon', '   ', ''])(
    'rejects %p',
    (n) => {
      expect(HeroNameSchema.safeParse(n).success).toBe(false);
    },
  );
});

describe('OnboardingSchema', () => {
  test('accepts a track and a name', () => {
    expect(OnboardingSchema.parse({ heroName: 'Nora', track: 'strategist' })).toEqual({
      heroName: 'Nora',
      track: 'strategist',
    });
  });

  test('rejects an unknown or missing track', () => {
    expect(OnboardingSchema.safeParse({ heroName: 'Nora', track: 'admin' }).success).toBe(false);
    expect(OnboardingSchema.safeParse({ heroName: 'Nora', track: null }).success).toBe(false);
  });

  test('rejects a missing name (FormData.get returns null)', () => {
    expect(OnboardingSchema.safeParse({ heroName: null, track: 'builder' }).success).toBe(false);
  });

  test('drops extra fields the client sends (xp, id)', () => {
    const parsed = OnboardingSchema.parse({
      heroName: 'Nora',
      track: 'builder',
      xp: 9999,
      id: 'x',
    });
    expect(parsed).toEqual({ heroName: 'Nora', track: 'builder' });
  });

  test('names each bad field in the issue path', () => {
    const r = OnboardingSchema.safeParse({ heroName: '!', track: 'nope' });
    expect(r.success).toBe(false);
    const fields = new Set(r.error?.issues.map((i) => i.path[0]));
    expect(fields).toEqual(new Set(['heroName', 'track']));
  });
});

describe('SwitchTrackSchema', () => {
  test.each(['builder', 'strategist'])('accepts %p', (track) => {
    expect(SwitchTrackSchema.parse({ track })).toEqual({ track });
  });

  test('rejects an unknown, empty or missing track (FormData.get returns null)', () => {
    for (const track of ['admin', '', 'Builder', null, undefined, 1]) {
      expect(SwitchTrackSchema.safeParse({ track }).success).toBe(false);
    }
  });

  test('drops extra fields the client sends (heroName, xp, id)', () => {
    const parsed = SwitchTrackSchema.parse({ track: 'builder', heroName: 'X', xp: 9999, id: 'x' });
    expect(parsed).toEqual({ track: 'builder' });
  });
});
