import { describe, expect, test } from 'bun:test';
import {
  CERT_ACHIEVEMENTS,
  certHref,
  coreRealms,
  MATH_TOWER_ACHIEVEMENT,
  OPEN_TIERS,
  REALMS,
  realmAchievements,
  TRACKS,
} from '@/lib/constants';
import { SPECIALIST_REALMS } from '@/lib/content/__fixtures__/realms';
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
  test('one per open-tier realm per track it is on, plus the Math Tower', () => {
    const core = open.filter((r) => r.track === null);
    const specialist = open.filter((r) => r.track !== null);
    expect(CERT_ACHIEVEMENTS).toHaveLength(TRACKS.length * core.length + specialist.length + 1);
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

describe('achievements per track (path-curriculum spec)', () => {
  test('regression: every old slug is unchanged, same order; open specialist realms join their path', () => {
    const old = (track: string) => [0, 1, 2, 3, 4, 5].map((realm) => `${track}-r${realm}`);
    const owned = (track: string) =>
      open.filter((r) => r.track === track).map((r) => `${track}-r${r.id}`);
    const slugs = CERT_ACHIEVEMENTS.map((a) => a.slug);
    expect(slugs).toEqual([
      ...['builder', 'strategist', 'creator'].flatMap((track) => [...old(track), ...owned(track)]),
      MATH_TOWER_ACHIEVEMENT,
    ]);
    // The pre-specialist list, slug for slug, is still there in the same order.
    const specialist = new Set<number>(open.filter((r) => r.track !== null).map((r) => r.id));
    const coreOnly = CERT_ACHIEVEMENTS.filter(
      (a) => a.kind !== 'realm' || !specialist.has(a.realm),
    );
    expect(coreOnly.map((a) => a.slug)).toEqual([
      ...['builder', 'strategist', 'creator'].flatMap(old),
      MATH_TOWER_ACHIEVEMENT,
    ]);
    expect(slugs).toContain('creator-r9');
    expect(slugs).toContain('creator-r10');
    expect(slugs).toContain('creator-r11');
  });

  test('a specialist realm has a certificate on its owner track only (fixture table)', () => {
    const slugs = realmAchievements(SPECIALIST_REALMS).map((a) => a.slug);
    expect(slugs).toContain('creator-r9');
    expect(slugs).toContain('builder-r10');
    for (const slug of ['builder-r9', 'strategist-r9', 'creator-r10', 'strategist-r10']) {
      expect(slugs).not.toContain(slug);
    }
    const r9 = realmAchievements(SPECIALIST_REALMS).find((a) => a.slug === 'creator-r9')!;
    expect(r9).toMatchObject({ title: 'Fixture Canvas cleared', pathLabel: 'CREATOR PATH' });
  });

  test('the fixture keeps every core slug', () => {
    const core = realmAchievements(coreRealms()).map((a) => a.slug);
    const withSpecialists = realmAchievements(SPECIALIST_REALMS).map((a) => a.slug);
    for (const slug of core) expect(withSpecialists).toContain(slug);
  });
});
