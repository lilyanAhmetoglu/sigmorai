import { describe, expect, test } from 'bun:test';
import { HERO_NAME_MAX, HERO_NAME_MIN } from '@/lib/constants';
import {
  HeroNameSchema,
  OnboardingSchema,
  RenameHeroSchema,
  SwitchTrackSchema,
  heroNameKey,
  isSingleScript,
} from './user';

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

describe('HeroNameSchema: NFKC', () => {
  test('normalises full-width letters before checking', () => {
    expect(HeroNameSchema.parse('Ｎｏｒａ')).toBe('Nora');
  });

  test('composes a decomposed accent (e + U+0308 → ë)', () => {
    expect(HeroNameSchema.parse('Zoe\u0308')).toBe('Zoë');
  });

  test('checks length after normalising (the ligature "ﬀ" is two letters)', () => {
    expect(HeroNameSchema.parse('\uFB00')).toBe('ff');
  });
});

describe('HeroNameSchema: one script', () => {
  test.each(['Νίκος', 'Мира', 'さくら', 'ハナ子', '김민수', 'Nora 2'])('accepts %p', (n) => {
    expect(HeroNameSchema.safeParse(n).success).toBe(true);
  });

  test.each([
    'p\u0430ypal', // Latin + Cyrillic "а"
    'Nora Мира',
    'Zed Ω',
    'abc李',
  ])('rejects mixed scripts %p', (n) => {
    expect(HeroNameSchema.safeParse(n).success).toBe(false);
  });

  test.each(['ಕನ್ನಡ', 'नमस्ते', 'ខ្មែរ'])(
    'accepts an Indic or unlisted script with marks %p',
    (n) => {
      expect(HeroNameSchema.safeParse(n).success).toBe(true);
    },
  );

  test('refuses Cyrillic "А" + Latin "da"', () => {
    expect(HeroNameSchema.safeParse('\u0410da').success).toBe(false);
  });

  test('isSingleScript ignores digits and separators', () => {
    expect(isSingleScript('2 ._-')).toBe(true);
  });
});

describe('HeroNameSchema: reserved', () => {
  test.each([
    'admin',
    'ADMIN',
    'Sigmorai',
    'sig-morai',
    'Oracle',
    'Hallucinant',
    'Ａｄｍｉｎ',
    'm.o.d',
    'Deleted',
    'anonymous',
    'null',
  ])('rejects %p', (n) => {
    expect(HeroNameSchema.safeParse(n).success).toBe(false);
  });

  test.each(['admiral', 'oracle_fan', 'modest'])('accepts a longer name %p', (n) => {
    expect(HeroNameSchema.safeParse(n).success).toBe(true);
  });

  test('heroNameKey lower-cases and drops separators', () => {
    expect(heroNameKey("Sig_Mo.r'ai-")).toBe('sigmorai');
  });
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
  test.each(['builder', 'strategist', 'creator'])('accepts %p', (track) => {
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

describe('RenameHeroSchema', () => {
  test('uses the onboarding name rules (trim + NFKC)', () => {
    expect(RenameHeroSchema.parse({ heroName: '  Ｎｏｒａ ' })).toEqual({ heroName: 'Nora' });
  });

  test.each(['admin', 'p\u0430ypal', '<b>', 'a', null, undefined, 42])('rejects %p', (heroName) => {
    expect(RenameHeroSchema.safeParse({ heroName }).success).toBe(false);
  });

  test('drops extra fields the client sends (track, xp, id)', () => {
    const parsed = RenameHeroSchema.parse({
      heroName: 'Nora',
      track: 'builder',
      xp: 9999,
      id: 'x',
    });
    expect(parsed).toEqual({ heroName: 'Nora' });
  });
});
