import { describe, expect, test } from 'bun:test';
import type { WorldPlace } from '@/lib/types';
import { REALMS } from './curriculum';
import { WORLD_MAP_TEXT } from './realms-copy';
import {
  HERO_SIDES,
  heroClear,
  heroSide,
  WORLD_HERO,
  WORLD_MAP,
  WORLD_MIN_ANCHOR_GAP,
  WORLD_OVERVIEW_MIN_WIDTH,
  ZOOM_STEPS,
} from './world-map';

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

describe('heroSide', () => {
  // Every place the hero can stand on: each core realm, and each slot as if
  // a specialist realm stood there.
  const stands = places.filter(([name]) => !WORLD_MAP.landmarks.some((l) => l.id === name));

  test('every core realm and slot has a side that is clear at every zoom', () => {
    const blocked = stands
      .filter(([, p]) => {
        const side = heroSide(p);
        return !side || !ZOOM_STEPS.every((z) => heroClear(p, side, z));
      })
      .map(([name]) => name);
    expect(blocked).toEqual([]);
  });

  test('core realms keep the hero on the left, unless the left truly collides', () => {
    const moved = Object.fromEntries(
      Object.entries(WORLD_MAP.realms)
        .map(([id, p]) => [`r${id}`, heroSide(p)] as const)
        .filter(([, side]) => side !== 'left'),
    );
    // r3 Context Library: at ½ the left hides the Math Tower label, the right slot s4.
    expect(moved).toEqual({ r3: 'above' });
  });

  test('a side is skipped when it is not clear (r3: left and right)', () => {
    const r3 = WORLD_MAP.realms[3];
    expect(heroClear(r3, 'left', 0.5)).toBe(false);
    expect(heroClear(r3, 'right', 0.5)).toBe(false);
  });

  test('world-map.css places the hero with the WORLD_HERO.sides offsets', async () => {
    const css = await Bun.file(
      `${import.meta.dir}/../../app/styles/components/world-map.css`,
    ).text();
    const px = (sign: string, n: string) => (sign === '-' ? -1 : 1) * Number(n) * 4;
    for (const side of HERO_SIDES) {
      const rule = css.match(
        new RegExp(`\\.world-hero\\[data-side='${side}'\\] \\{([^}]*)\\}`),
      )?.[1];
      const left = rule?.match(
        /left: max\(0px, calc\(var\(--hero-x\) ([+-]) --spacing\(([\d.]+)\)\)\)/,
      );
      const top = rule?.match(
        /top: max\(0px, calc\(var\(--hero-y\) ([+-]) --spacing\(([\d.]+)\)\)\)/,
      );
      expect({ side, at: left && top && [px(left[1], left[2]), px(top[1], top[2])] }).toEqual({
        side,
        at: [...WORLD_HERO.sides[side]],
      });
    }
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
