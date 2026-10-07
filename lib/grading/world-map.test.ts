import { describe, expect, test } from 'bun:test';
import { REALMS, WORLD_MAP } from '@/lib/constants';
import type { RealmStatus, RealmView, TrackMap, WorldGeometry } from '@/lib/types';
import { coastline, edgeFog, pathRealms, realmPlace, shapeSeed, worldView } from './world-map';

/** A realm view with 6 chapters + boss; only the fields worldView reads matter. */
function realm(id: number, status: RealmStatus, cleared = 0): RealmView {
  // Spread the row, so fields REALMS gains later (track, scene) come along.
  return {
    ...REALMS[id],
    topic: '',
    lore: '',
    status,
    cleared,
    chapters: Array.from({ length: 7 }, (_, i) => ({
      chapter: i < 6 ? i + 1 : null,
      title: `c${i + 1}`,
      status: 'open',
      steps: [],
    })),
  };
}

const step = { step: 'lesson' as const, exerciseId: 'x', status: 'open' as const };

function trackMap(statuses: RealmStatus[], next: number | null): TrackMap {
  return {
    track: 'builder',
    realms: statuses.map((s, id) => realm(id, s, s === 'cleared' ? 7 : 0)),
    next: next === null ? null : { realm: REALMS[next].id, chapter: 1, step },
  };
}

const NINE_OPEN: RealmStatus[] = REALMS.map(() => 'open');

describe('pathRealms', () => {
  test('rows use the given href builder, in path order, with the current realm marked', () => {
    const rows = pathRealms(trackMap(NINE_OPEN, 2), (slug) => `/realms/${slug}`);
    expect(rows.map((r) => r.id)).toEqual(REALMS.map((r) => r.id));
    expect(rows.map((r) => r.href)).toEqual(REALMS.map((r) => `/realms/${r.slug}`));
    expect(rows.filter((r) => r.current).map((r) => r.id)).toEqual([REALMS[2].id]);
  });
});

describe('worldView', () => {
  test('one realm per path realm, in path order, each placed, with its link and totals', () => {
    const view = worldView(trackMap(NINE_OPEN, 0));
    expect(view.realms.map((r) => r.id)).toEqual(REALMS.map((r) => r.id));
    for (const r of view.realms) {
      expect(r.place).toEqual(WORLD_MAP.realms[r.id]);
      expect(r.href).toBe(`/map/${REALMS[r.id].slug}`);
      expect(r.total).toBe(7);
    }
  });

  test('links keep ?track= only when the page got one', () => {
    const view = worldView(trackMap(NINE_OPEN, 0), WORLD_MAP, 'creator');
    expect(view.realms[1].href).toBe('/map/prompt-forest?track=creator');
  });

  test('the trail joins neighbours in path order: solid after a cleared realm, dashed ahead', () => {
    const statuses: RealmStatus[] = [...NINE_OPEN];
    statuses[0] = 'cleared';
    statuses[1] = 'in-progress';
    const view = worldView(trackMap(statuses, 1));
    expect(view.trail).toHaveLength(REALMS.length - 1);
    expect(view.trail.map((s) => [s.from, s.to])).toEqual(
      REALMS.slice(1).map((r, i) => [REALMS[i].id, r.id]),
    );
    expect(view.trail.map((s) => s.cleared)).toEqual([true, ...REALMS.slice(2).map(() => false)]);
    expect(view.trail[0].a).toEqual(WORLD_MAP.realms[0]);
    expect(view.trail[0].b).toEqual(WORLD_MAP.realms[1]);
  });

  test('a visitor (no clears): every segment dashed, current = the first open realm', () => {
    const view = worldView(trackMap(NINE_OPEN, 0));
    expect(view.trail.every((s) => !s.cleared)).toBe(true);
    expect(view.current).toBe(0);
    expect(view.realms.filter((r) => r.current).map((r) => r.id)).toEqual([0]);
  });

  test('no next step → no current realm', () => {
    const view = worldView(
      trackMap(
        REALMS.map(() => 'cleared'),
        null,
      ),
    );
    expect(view.current).toBeNull();
    expect(view.realms.some((r) => r.current)).toBe(false);
    expect(view.trail.every((s) => s.cleared)).toBe(true);
  });

  test('every slot is fog while no specialist realm uses one', () => {
    const view = worldView(trackMap(NINE_OPEN, 0));
    expect(view.fog).toEqual([...WORLD_MAP.slots]);
  });

  test('a slot used by a realm on this path is not fog; one used by another path is', () => {
    // Fixture: realm 4 stands on s1 (as a specialist would), realm 99 (not on the path) on s2.
    const geometry = {
      ...WORLD_MAP,
      realms: Object.fromEntries(Object.entries(WORLD_MAP.realms).filter(([id]) => id !== '4')),
      slotRealms: [
        { slot: 's1', realm: 4 },
        { slot: 's2', realm: 99 },
      ],
    } as WorldGeometry;
    const view = worldView(trackMap(NINE_OPEN, 0), geometry);
    expect(view.realms[4].place).toEqual(WORLD_MAP.slots[0]);
    expect(view.fog.map((s) => s.id)).not.toContain('s1');
    expect(view.fog.map((s) => s.id)).toContain('s2');
  });

  test('a realm with no place stays in the list, and the trail skips it', () => {
    const geometry = {
      ...WORLD_MAP,
      realms: Object.fromEntries(Object.entries(WORLD_MAP.realms).filter(([id]) => id !== '1')),
    } as WorldGeometry;
    const view = worldView(trackMap(NINE_OPEN, 0), geometry);
    expect(view.realms[1].place).toBeNull();
    expect(view.trail[0]).toMatchObject({ from: 0, to: 2 });
    expect(view.trail).toHaveLength(REALMS.length - 2);
  });
});

describe('realmPlace', () => {
  test('core realm → its place; unknown realm → null', () => {
    expect(realmPlace(3)).toEqual(WORLD_MAP.realms[3]);
    expect(realmPlace(42)).toBeNull();
  });
});

describe('coastline', () => {
  const places = [
    ...Object.values(WORLD_MAP.realms),
    ...WORLD_MAP.landmarks,
    { x: 100, y: 100, w: 48, h: 48 },
  ];

  test('stays inside its footprint, on whole tiles from its edges', () => {
    for (const p of places) {
      for (let seed = 1; seed <= 20; seed++) {
        for (const [x, y] of coastline(p, seed)) {
          expect(x).toBeGreaterThanOrEqual(p.x - p.w / 2);
          expect(x).toBeLessThanOrEqual(p.x + p.w / 2);
          expect(y).toBeGreaterThanOrEqual(p.y - p.h / 2);
          expect(y).toBeLessThanOrEqual(p.y + p.h / 2);
          expect((x - (p.x - p.w / 2)) % WORLD_MAP.tile === 0 || x === p.x + p.w / 2).toBe(true);
        }
      }
    }
  });

  test('keeps at least one tile per row', () => {
    for (const p of places) {
      const pts = coastline(p, 3);
      const half = pts.length / 2;
      for (let i = 0; i < half; i += 2) {
        const right = pts[i][0];
        const left = pts[pts.length - 1 - i][0];
        expect(right - left).toBeGreaterThanOrEqual(WORLD_MAP.tile);
      }
    }
  });

  test('the same seed gives the same shape; realms differ', () => {
    const p = WORLD_MAP.realms[0];
    expect(coastline(p, shapeSeed(0))).toEqual(coastline(p, shapeSeed(0)));
    const shapes = new Set(
      [0, 1, 2, 3, 4].map((id) => JSON.stringify(coastline(p, shapeSeed(id)))),
    );
    expect(shapes.size).toBeGreaterThan(1);
    expect(shapeSeed('math')).toBe(shapeSeed('math'));
  });
});

describe('edgeFog', () => {
  test('covers every edge tile, min–max deep on whole tiles, the same every time', () => {
    const rects = edgeFog();
    const { width, height, tile, edgeFog: fog } = WORLD_MAP;
    expect(rects).toHaveLength(2 * (width / tile) + 2 * (height / tile));
    for (const r of rects) {
      const depth = Math.min(r.w, r.h) === tile ? Math.max(r.w, r.h) : Math.min(r.w, r.h);
      expect(depth).toBeGreaterThanOrEqual(fog.min);
      expect(depth).toBeLessThanOrEqual(fog.max);
      expect(depth % tile).toBe(0);
    }
    expect(edgeFog()).toEqual(rects);
    expect(new Set(rects.map((r) => Math.max(r.w, r.h))).size).toBeGreaterThan(1);
  });
});
