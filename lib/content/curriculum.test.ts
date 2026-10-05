import { existsSync } from 'node:fs';
import { describe, expect, test } from 'bun:test';
import {
  MATH_FLOOR_COUNT,
  MATH_FLOORS,
  OPEN_TIERS,
  REALM_COUNT,
  REALMS,
  TIERS,
} from '@/lib/constants';
import { isRealmOpen, realmArt, realmFolder } from './curriculum';

const PUBLIC_DIR = `${import.meta.dir}/../../public`;

describe('curriculum constants', () => {
  test('one realm row per realm, id = position', () => {
    expect(REALMS.map((r): number => r.id)).toEqual([...Array(REALM_COUNT).keys()]);
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
  test.each(TIERS.map((tier) => [tier, (OPEN_TIERS as readonly string[]).includes(tier)]))(
    '%s → %p',
    (tier, open) => {
      expect(isRealmOpen(tier)).toBe(open);
    },
  );

  test('advanced is locked (spec: realms 6–8)', () => {
    expect(isRealmOpen('advanced')).toBe(false);
    expect(REALMS.filter((r) => !isRealmOpen(r.tier)).map((r) => r.id)).toEqual([6, 7, 8]);
  });
});

describe('realm paths', () => {
  test('folder and art for realm 0 and 8', () => {
    expect(realmFolder(0)).toBe('00-bootstrap-village');
    expect(realmFolder(8)).toBe('08-production-peaks');
    expect(realmArt(0)).toBe('/levels/realm-00');
    expect(realmArt(8)).toBe('/levels/realm-08');
  });

  test.each(REALMS.map((r) => r.id))('art folder for realm %d exists in public/', (id) => {
    expect(existsSync(`${PUBLIC_DIR}${realmArt(id)}`)).toBe(true);
  });
});
