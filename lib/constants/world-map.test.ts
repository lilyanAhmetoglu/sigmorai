import { describe, expect, test } from 'bun:test';
import type { WorldPlace } from '@/lib/types';
import { REALMS } from './curriculum';
import { WORLD_MAP_TEXT } from './realms-copy';
import { WORLD_MAP, WORLD_MIN_ANCHOR_GAP, WORLD_OVERVIEW_MIN_WIDTH, ZOOM_STEPS } from './world-map';

// The geometry rules of the world-map spec (→ Geometry). The art is made to
// fit these numbers, so a broken rule here means overlapping lands or markers.

const places: [string, WorldPlace][] = [
  ...Object.entries(WORLD_MAP.realms).map(([id, p]): [string, WorldPlace] => [`r${id}`, p]),
  ...WORLD_MAP.slots.map((s): [string, WorldPlace] => [s.id, s]),
  ...WORLD_MAP.landmarks.map((l): [string, WorldPlace] => [l.id, l]),
];

const pairs = places.flatMap((a, i) => places.slice(i + 1).map((b) => [a, b] as const));

const overlap = (a: WorldPlace, b: WorldPlace) =>
  Math.abs(a.x - b.x) < (a.w + b.w) / 2 && Math.abs(a.y - b.y) < (a.h + b.h) / 2;

describe('WORLD_MAP geometry', () => {
  test('every footprint is inside the grid', () => {
    for (const [name, p] of places) {
      const inside =
        p.x - p.w / 2 >= 0 &&
        p.y - p.h / 2 >= 0 &&
        p.x + p.w / 2 <= WORLD_MAP.width &&
        p.y + p.h / 2 <= WORLD_MAP.height;
      expect({ name, inside }).toEqual({ name, inside: true });
    }
  });

  test('no two footprints overlap', () => {
    const clashes = pairs
      .filter(([a, b]) => overlap(a[1], b[1]))
      .map(([a, b]) => `${a[0]}+${b[0]}`);
    expect(clashes).toEqual([]);
  });

  test(`anchors are at least ${WORLD_MIN_ANCHOR_GAP} art px apart`, () => {
    const close = pairs
      .filter(([a, b]) => Math.hypot(a[1].x - b[1].x, a[1].y - b[1].y) < WORLD_MIN_ANCHOR_GAP)
      .map(([a, b]) => `${a[0]}+${b[0]}`);
    expect(close).toEqual([]);
  });

  test('every realm in REALMS has a place (core) or a slot (specialist)', () => {
    const slotted = new Set(WORLD_MAP.slotRealms.map((s) => s.realm));
    const missing = REALMS.filter((r) => !WORLD_MAP.realms[r.id] && !slotted.has(r.id));
    expect(missing.map((r) => r.slug)).toEqual([]);
  });

  test('slot ids are unique; each assignment names a real slot, used once', () => {
    const ids = WORLD_MAP.slots.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    const used = WORLD_MAP.slotRealms.map((s) => s.slot);
    expect(new Set(used).size).toBe(used.length);
    for (const slot of used) expect(ids).toContain(slot);
  });
});

describe('ZOOM_STEPS', () => {
  test('½, 1 and 2 only (whole-number scales of world-512.png and world.png)', () => {
    expect([...ZOOM_STEPS]).toEqual([0.5, 1, 2]);
  });

  test('world-map.css has a data-zoom rule for each step, and no other', async () => {
    const css = await Bun.file(
      `${import.meta.dir}/../../app/styles/components/world-map.css`,
    ).text();
    const found = [...css.matchAll(/\[data-zoom='([^']+)'\]/g)].map((m) => Number(m[1]));
    expect([...new Set(found)].sort()).toEqual([...ZOOM_STEPS].sort());
  });
});

describe('world-map.css', () => {
  test('the overview breakpoint matches WORLD_OVERVIEW_MIN_WIDTH', async () => {
    const css = await Bun.file(
      `${import.meta.dir}/../../app/styles/components/world-map.css`,
    ).text();
    const rems = [...css.matchAll(/@media \(width >= ([\d.]+)rem\)/g)].map((m) => Number(m[1]));
    expect(rems.length).toBeGreaterThan(0);
    for (const rem of rems) expect(rem * 16).toBe(WORLD_OVERVIEW_MIN_WIDTH);
  });
});

describe('WORLD_MAP_TEXT.marker', () => {
  test('starts with the visible number and name, drops the "·", adds the tag', () => {
    expect(WORLD_MAP_TEXT.marker('01', 'Prompt Forest', 'IN PROGRESS', 2, 7, 'YOU ARE HERE')).toBe(
      '01 Prompt Forest, in progress, 2 of 7 cleared, you are here',
    );
    expect(WORLD_MAP_TEXT.marker('06', 'Eval Arena', 'ADVANCED · LOCKED', 0, 7)).toBe(
      '06 Eval Arena, advanced locked, 0 of 7 cleared',
    );
  });
});
