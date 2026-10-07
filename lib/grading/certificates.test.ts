import { describe, expect, test } from 'bun:test';
import {
  CERT_ACHIEVEMENTS,
  certHref,
  MATH_TOWER_ACHIEVEMENT,
  OPEN_TIERS,
  REALMS,
  TRACKS,
} from '@/lib/constants';
import {
  achievementToExerciseId,
  earnedAchievements,
  ELIGIBLE_EXERCISE_IDS,
  parseAchievement,
  parseCertificateRequest,
  utcDayString,
} from './certificates';

const UUID = '0b6f3c1e-9a4d-4c2b-8f1e-2d3c4b5a6978';
const open = REALMS.filter((r) => (OPEN_TIERS as readonly string[]).includes(r.tier));
const locked = REALMS.filter((r) => !(OPEN_TIERS as readonly string[]).includes(r.tier));

describe('achievements', () => {
  test('one per open-tier realm per track, plus the Math Tower', () => {
    expect(CERT_ACHIEVEMENTS).toHaveLength(TRACKS.length * open.length + 1);
    expect(new Set(CERT_ACHIEVEMENTS.map((a) => a.slug)).size).toBe(CERT_ACHIEVEMENTS.length);
  });

  test('locked-tier realms have no certificate', () => {
    expect(locked.length).toBeGreaterThan(0);
    for (const track of TRACKS) {
      for (const realm of locked) expect(parseAchievement(`${track}-r${realm.id}`)).toBeNull();
    }
  });

  test('a realm maps to its boss challenge, the tower to floor 8 quick check', () => {
    expect(achievementToExerciseId(parseAchievement('builder-r0')!)).toBe(
      'builder/r0/boss/challenge',
    );
    expect(achievementToExerciseId(parseAchievement('creator-r5')!)).toBe(
      'creator/r5/boss/challenge',
    );
    expect(achievementToExerciseId(parseAchievement(MATH_TOWER_ACHIEVEMENT)!)).toBe(
      'math/f8/quick-check',
    );
    expect(ELIGIBLE_EXERCISE_IDS).toHaveLength(CERT_ACHIEVEMENTS.length);
  });

  test('unknown or odd slugs are refused', () => {
    for (const bad of ['', 'builder', 'builder-r9', 'BUILDER-R0', 'wizard-r0', 'math', null, 3]) {
      expect(parseAchievement(bad)).toBeNull();
    }
  });
});

describe('parseCertificateRequest', () => {
  test('a uuid and a known slug pass, upper-case ids are lowered', () => {
    const req = parseCertificateRequest(UUID.toUpperCase(), 'strategist-r2');
    expect(req?.publicId).toBe(UUID);
    expect(req?.exerciseId).toBe('strategist/r2/boss/challenge');
  });

  test('a bad id or a bad achievement is null before any DB read', () => {
    expect(parseCertificateRequest('user_2abc', 'builder-r0')).toBeNull();
    expect(parseCertificateRequest(`${UUID}x`, 'builder-r0')).toBeNull();
    expect(parseCertificateRequest(['a'], 'builder-r0')).toBeNull();
    expect(parseCertificateRequest(UUID, 'builder-r8')).toBeNull();
    expect(parseCertificateRequest(UUID, '../x')).toBeNull();
  });
});

describe('earnedAchievements', () => {
  test('only cleared achievements, in list order, dated by UTC day', () => {
    const cleared = new Map<string, Date>([
      ['math/f8/quick-check', new Date('2026-10-05T23:59:59Z')],
      ['builder/r1/boss/challenge', new Date('2026-10-06T00:00:01Z')],
      ['builder/r1/c1/challenge', new Date('2026-10-06T00:00:01Z')],
      ['builder/r7/boss/challenge', new Date('2026-10-06T00:00:01Z')],
    ]);
    const earned = earnedAchievements(cleared, (a) => certHref(UUID, a.slug));
    expect(earned.map((e) => e.achievement.slug)).toEqual(['builder-r1', MATH_TOWER_ACHIEVEMENT]);
    expect(earned.map((e) => e.earnedOn)).toEqual(['2026-10-06', '2026-10-05']);
    expect(earned[0].href).toBe(`/cert/${UUID}/builder-r1`);
  });

  test('nothing cleared → empty', () => {
    expect(earnedAchievements(new Map(), () => '')).toEqual([]);
  });

  test('utcDayString never shifts a day', () => {
    expect(utcDayString(new Date('2026-10-07T00:00:00Z'))).toBe('2026-10-07');
    expect(utcDayString(new Date('2026-10-07T23:59:59.999Z'))).toBe('2026-10-07');
  });
});
