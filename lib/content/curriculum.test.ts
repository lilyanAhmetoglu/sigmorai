import { existsSync } from 'node:fs';
import { describe, expect, test } from 'bun:test';
import {
  ACCENTS,
  coreRealms,
  DEFAULT_TRACK,
  MATH_FLOOR_COUNT,
  MATH_FLOORS,
  REALMS,
  realmPageTrack,
  realmTracks,
  TRACKS,
  trackRealms,
} from '@/lib/constants';
import { SPECIALIST_REALMS } from './__fixtures__/realms';
import { MATH_ART, isRealmOpen, realmAccent, realmArt, realmFolder } from './curriculum';

const PUBLIC_DIR = `${import.meta.dir}/../../public`;

describe('curriculum constants', () => {
  test('one realm row per realm, id = position (so REALMS[id] is realm id)', () => {
    expect(REALMS.map((r): number => r.id)).toEqual([...Array(REALMS.length).keys()]);
  });

  test('9 core realms (track null), every one with art; specialist rows start at r9', () => {
    expect(coreRealms().map((r) => r.id)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    expect(coreRealms().every((r) => r.scene)).toBe(true);
    expect(REALMS.filter((r) => r.track !== null).every((r) => r.id >= 9)).toBe(true);
  });

  test('r9 Canvas Workshop: creator only, no art yet (flat surface-3 scene)', () => {
    expect(REALMS[9]).toMatchObject({ slug: 'canvas-workshop', track: 'creator', scene: false });
  });

  test('one floor row per floor, n = position + 1', () => {
    expect(MATH_FLOORS.map((f): number => f.n)).toEqual(
      [...Array(MATH_FLOOR_COUNT).keys()].map((i) => i + 1),
    );
  });

  test('slugs are unique', () => {
    for (const rows of [REALMS, MATH_FLOORS]) {
      expect(new Set(rows.map((r) => r.slug)).size).toBe(rows.length);
    }
  });
});

describe('isRealmOpen', () => {
  test('advanced is locked (spec: realms 6–8)', () => {
    expect(isRealmOpen('advanced')).toBe(false);
    expect(REALMS.filter((r) => !isRealmOpen(r.tier)).map((r) => r.id)).toEqual([6, 7, 8]);
  });
});

describe('realm lists per track (fixture table: r9 creator, r10 builder)', () => {
  const T = SPECIALIST_REALMS;

  test('real table: every path has the core realms plus the specialist rows it owns', () => {
    for (const track of TRACKS) {
      expect(trackRealms(track)).toEqual([
        ...coreRealms(),
        ...REALMS.filter((r) => r.track === track),
      ]);
    }
    // r9 Canvas Workshop, r10 Reel Hollow, r11 Pigment Bazaar, r12 Echo Caverns and r13 Pattern Atelier stay creator only.
    expect(trackRealms('creator')).toContain(REALMS[9]);
    expect(trackRealms('creator')).toContain(REALMS[10]);
    expect(trackRealms('creator')).toContain(REALMS[11]);
    expect(trackRealms('creator')).toContain(REALMS[12]);
    expect(trackRealms('creator')).toContain(REALMS[13]);
    // r14 Agent Workshop is the first builder-only realm.
    expect(trackRealms('builder')).toContain(REALMS[14]);
    expect(trackRealms('creator')).not.toContain(REALMS[14]);
    expect(trackRealms('strategist')).not.toContain(REALMS[14]);
    // r15 Guild Hall is the first strategist-only realm.
    expect(trackRealms('strategist')).toContain(REALMS[15]);
    expect(trackRealms('builder')).not.toContain(REALMS[15]);
    expect(trackRealms('creator')).not.toContain(REALMS[15]);
  });

  test('a track gets the core realms plus only the specialist realms it owns', () => {
    const ids = (track: (typeof TRACKS)[number]) => trackRealms(track, T).map((r) => r.id);
    expect(coreRealms(T).map((r) => r.id)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    expect(ids('creator')).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(ids('builder')).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 10]);
    expect(ids('strategist')).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  });

  test('realmTracks: every track for a core realm, the owner for a specialist realm', () => {
    expect(realmTracks(REALMS[1])).toEqual([...TRACKS]);
    expect(realmTracks(T[9])).toEqual(['creator']);
  });

  test('realmPageTrack: a specialist realm ignores ?track= and shows its owner', () => {
    expect(realmPageTrack(T[9], 'builder')).toBe('creator');
    expect(realmPageTrack(T[9], DEFAULT_TRACK)).toBe('creator');
    expect(realmPageTrack(REALMS[1], 'builder')).toBe('builder');
  });
});

describe('realm paths', () => {
  test('folder and art for realm 0 and 8', () => {
    expect(realmFolder(0)).toBe('00-bootstrap-village');
    expect(realmFolder(8)).toBe('08-production-peaks');
    expect(realmArt(0)).toBe('/levels/realm-00');
    expect(realmArt(8)).toBe('/levels/realm-08');
  });

  test('every realm accent is a known accent', () => {
    for (const r of REALMS) expect(ACCENTS).toContain(realmAccent(r.id));
  });

  test('accent: realm-N up to r8, neutral past it (no token yet)', () => {
    expect(realmAccent(0)).toBe('realm-0');
    expect(realmAccent(8)).toBe('realm-8');
    expect(realmAccent(9)).toBe('neutral');
    expect(realmAccent(13)).toBe('neutral');
  });

  test('a realm without art (scene: false) has no art path, never another realm’s', () => {
    expect(realmArt(9, SPECIALIST_REALMS)).toBeNull();
    expect(realmFolder(9, SPECIALIST_REALMS)).toBe('09-fixture-canvas');
    expect(realmFolder(10, SPECIALIST_REALMS)).toBe('10-fixture-yard');
    expect(() => realmFolder(99)).toThrow(RangeError);
  });

  test('Math Tower art folder exists in public/', () => {
    expect(existsSync(`${PUBLIC_DIR}${MATH_ART}`)).toBe(true);
  });

  test.each(REALMS.filter((r) => r.scene).map((r) => r.id))(
    'art folder for realm %d exists in public/',
    (id) => {
      expect(existsSync(`${PUBLIC_DIR}${realmArt(id)}`)).toBe(true);
    },
  );

  test.each(REALMS.filter((r) => !r.scene).map((r) => r.id))(
    'real realm %d has no art yet: no art path, and its own folder',
    (id) => {
      expect(realmArt(id)).toBeNull();
      expect(realmFolder(id)).toBe(`${String(id).padStart(2, '0')}-${REALMS[id].slug}`);
    },
  );

  test('folders of the real realms with no art yet (r9, r10, r11, r12, r13, r14, r15)', () => {
    expect(realmFolder(9)).toBe('09-canvas-workshop');
    expect(realmFolder(10)).toBe('10-reel-hollow');
    expect(realmFolder(11)).toBe('11-pigment-bazaar');
    expect(realmFolder(12)).toBe('12-echo-caverns');
    expect(realmFolder(13)).toBe('13-pattern-atelier');
    expect(realmFolder(14)).toBe('14-agent-workshop');
    expect(realmFolder(15)).toBe('15-guild-hall');
  });
});
