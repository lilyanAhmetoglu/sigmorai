import { describe, expect, test } from 'bun:test';
import {
  CONTENT_DIR,
  coreRealms,
  OUTLINE_FILE,
  REALMS,
  TRACKS,
  WORLD_HERO,
  WORLD_MAP,
  WORLD_TERRAIN,
  WORLD_TERRAIN_DEFAULT,
  worldKeepClear,
  ZOOM_STEPS,
} from '@/lib/constants';
import type {
  RealmStatus,
  RealmView,
  Track,
  TrackMap,
  WorldGeometry,
  WorldPlace,
  WorldRect,
} from '@/lib/types';
import {
  coastBands,
  coastline,
  edgeFog,
  growBands,
  pathRealms,
  realmPlace,
  rippleLine,
  shapeSeed,
  terrainGlyphs,
  worldView,
} from './world-map';

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

/** The core realms (r0–r8): every path has them, in id order. */
const CORE = coreRealms();

const step = { step: 'lesson' as const, exerciseId: 'x', status: 'open' as const };

function trackMap(statuses: RealmStatus[], next: number | null): TrackMap {
  return {
    track: 'builder',
    realms: statuses.map((s, id) => realm(id, s, s === 'cleared' ? 7 : 0)),
    next: next === null ? null : { realm: CORE[next].id, chapter: 1, step },
  };
}

const NINE_OPEN: RealmStatus[] = CORE.map(() => 'open');

describe('pathRealms', () => {
  test('rows use the given href builder, in path order, with the current realm marked', () => {
    const rows = pathRealms(trackMap(NINE_OPEN, 2), (slug) => `/realms/${slug}`);
    expect(rows.map((r) => r.id)).toEqual(CORE.map((r) => r.id));
    expect(rows.map((r) => r.href)).toEqual(CORE.map((r) => `/realms/${r.slug}`));
    expect(rows.filter((r) => r.current).map((r) => r.id)).toEqual([CORE[2].id]);
  });
});

describe('specialist realms (real REALMS, each path in its committed outline order)', () => {
  /** A path's map order, as committed in content/<track>/outline.json. */
  const order = async (track: Track): Promise<number[]> => {
    const file = `${import.meta.dir}/../../${CONTENT_DIR}/${track}/${OUTLINE_FILE}`;
    const outline = (await Bun.file(file).json()) as { realms: { id: number }[] };
    return outline.realms.map((r) => r.id);
  };
  const pathMap = async (track: Track): Promise<TrackMap> => ({
    track,
    realms: (await order(track)).map((id) => realm(id, 'open')),
    next: { realm: 0, chapter: 1, step },
  });
  const specialists = REALMS.filter((r) => r.track !== null);

  test('the creator path has at least one specialist realm (r9 Canvas Workshop)', () => {
    expect(specialists.map((r) => r.id)).toContain(9);
  });

  test.each([...TRACKS])(
    '%s: pathRealms carries the owner only on its own specialist rows ("<PATH> ONLY" badge)',
    async (track) => {
      const rows = pathRealms(await pathMap(track), (slug) => `/realms/${slug}`);
      expect(rows.filter((r) => r.track !== null).map((r) => [r.id, r.track])).toEqual(
        rows.filter((r) => REALMS[r.id].track === track).map((r) => [r.id, track]),
      );
    },
  );

  test.each(specialists.map((r) => [r.id, r.track] as const))(
    'r%d (%s) stands on its slot, which is no longer fog; the trail runs through it in outline order',
    async (id, owner) => {
      const ids = await order(owner);
      const view = worldView(await pathMap(owner));
      const slot = WORLD_MAP.slotRealms.find((s) => s.realm === id)!.slot;
      expect(view.realms.find((r) => r.id === id)!.place).toEqual(
        WORLD_MAP.slots.find((s) => s.id === slot)!,
      );
      expect(view.fog.map((s) => s.id)).not.toContain(slot);
      const at = ids.indexOf(id);
      const legs = view.trail.map((s) => [s.from, s.to]);
      if (at > 0) expect(legs).toContainEqual([ids[at - 1], id]);
      if (at < ids.length - 1) expect(legs).toContainEqual([id, ids[at + 1]]);
    },
  );
});

describe('worldView', () => {
  test('one realm per path realm, in path order, each placed, with its link and totals', () => {
    const view = worldView(trackMap(NINE_OPEN, 0));
    expect(view.realms.map((r) => r.id)).toEqual(CORE.map((r) => r.id));
    for (const r of view.realms) {
      expect(r.place).toEqual(WORLD_MAP.realms[r.id]);
      expect(r.href).toBe(`/map/${CORE[r.id].slug}`);
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
    expect(view.trail).toHaveLength(CORE.length - 1);
    expect(view.trail.map((s) => [s.from, s.to])).toEqual(
      CORE.slice(1).map((r, i) => [CORE[i].id, r.id]),
    );
    expect(view.trail.map((s) => s.cleared)).toEqual([true, ...CORE.slice(2).map(() => false)]);
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
        CORE.map(() => 'cleared'),
        null,
      ),
    );
    expect(view.current).toBeNull();
    expect(view.realms.some((r) => r.current)).toBe(false);
    expect(view.trail.every((s) => s.cleared)).toBe(true);
  });

  test('on a path with no specialist realm, every slot is fog', () => {
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
    expect(view.trail).toHaveLength(CORE.length - 2);
  });
});

describe('realmPlace', () => {
  test('core realm → its place; unknown realm → null', () => {
    expect(realmPlace(3)).toEqual(WORLD_MAP.realms[3]);
    expect(realmPlace(42)).toBeNull();
  });
});

describe('coastline', () => {
  const { step } = WORLD_MAP.coast;
  const places = [
    ...Object.values(WORLD_MAP.realms),
    ...WORLD_MAP.slots,
    ...WORLD_MAP.landmarks,
    { x: 100, y: 100, w: 48, h: 48 },
  ];

  test('stays inside its footprint, on whole steps from its edges', () => {
    for (const p of places) {
      for (let seed = 1; seed <= 20; seed++) {
        for (const [x, y] of coastline(p, seed)) {
          expect(x).toBeGreaterThanOrEqual(p.x - p.w / 2);
          expect(x).toBeLessThanOrEqual(p.x + p.w / 2);
          expect(y).toBeGreaterThanOrEqual(p.y - p.h / 2);
          expect(y).toBeLessThanOrEqual(p.y + p.h / 2);
          expect((x - (p.x - p.w / 2)) % step).toBe(0);
          expect((y - (p.y - p.h / 2)) % step === 0 || y === p.y + p.h / 2).toBe(true);
        }
      }
    }
  });

  test('every row keeps the middle column, so the land is one piece', () => {
    for (const p of places)
      for (let seed = 1; seed <= 20; seed++)
        for (const band of coastBands(p, seed)) {
          expect(band.left).toBeLessThanOrEqual(p.x - step);
          expect(band.right).toBeGreaterThanOrEqual(p.x + step);
        }
  });

  test('right angles only, no repeated or in-line points', () => {
    for (const p of places) {
      const ring = coastline(p, shapeSeed(1));
      ring.forEach((a, i) => {
        const b = ring[(i + 1) % ring.length];
        const c = ring[(i + 2) % ring.length];
        expect(a[0] === b[0] || a[1] === b[1]).toBe(true);
        expect(a[0] === b[0] && a[1] === b[1]).toBe(false);
        expect((a[0] === b[0] && b[0] === c[0]) || (a[1] === b[1] && b[1] === c[1])).toBe(false);
      });
    }
  });

  test('a core land is organic, not a box: many corners, and rounded ends', () => {
    for (const [id, p] of Object.entries(WORLD_MAP.realms)) {
      const ring = coastline(p, shapeSeed(Number(id)));
      expect({ id, many: ring.length >= 24 }).toEqual({ id, many: true });
      const bands = coastBands(p, shapeSeed(Number(id)));
      const width = (b: (typeof bands)[number]) => b.right - b.left;
      const widest = Math.max(...bands.map(width));
      expect(width(bands[0])).toBeLessThan(widest);
      expect(width(bands[bands.length - 1])).toBeLessThan(widest);
    }
  });

  test('the same seed gives the same shape; realms differ', () => {
    const p = WORLD_MAP.realms[0];
    expect(coastline(p, shapeSeed(0))).toEqual(coastline(p, shapeSeed(0)));
    const shapes = new Set(
      [0, 1, 2, 3, 4].map((id) => JSON.stringify(coastline(p, shapeSeed(id)))),
    );
    expect(shapes.size).toBe(5);
    expect(shapeSeed('math')).toBe(shapeSeed('math'));
  });
});

describe('ripples (growBands, rippleLine)', () => {
  const bbox = (pts: [number, number][]) => {
    const xs = pts.map((q) => q[0]);
    const ys = pts.map((q) => q[1]);
    return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
  };

  test('a ripple is the coast pushed d out: its box grows by d on every side', () => {
    for (const [id, p] of Object.entries(WORLD_MAP.realms)) {
      const [l, t, r, b] = bbox(coastline(p, shapeSeed(Number(id))));
      for (const d of [6, 12])
        expect(bbox(rippleLine(p, shapeSeed(Number(id)), d))).toEqual([l - d, t - d, r + d, b + d]);
    }
  });

  test('every grown row holds the land rows it covers, d px wider on each side', () => {
    const bands = coastBands(WORLD_MAP.realms[4], shapeSeed(4));
    const grown = growBands(bands, 6);
    for (const g of grown)
      for (const b of bands.filter((x) => x.top - 6 <= g.top && x.bottom + 6 >= g.bottom)) {
        expect(g.left).toBeLessThanOrEqual(b.left - 6);
        expect(g.right).toBeGreaterThanOrEqual(b.right + 6);
      }
    // Rows stack with no gap.
    grown.slice(1).forEach((g, i) => expect(g.top).toBe(grown[i].bottom));
  });

  test('right angles only, and never in line or repeated', () => {
    const ring = rippleLine(WORLD_MAP.realms[0], shapeSeed(0), 12);
    ring.forEach((p, i) => {
      const q = ring[(i + 1) % ring.length];
      expect(p[0] === q[0] || p[1] === q[1]).toBe(true);
      expect(p[0] === q[0] && p[1] === q[1]).toBe(false);
    });
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

describe('terrainGlyphs', () => {
  /** Every land that can show terrain: core realms, slots, landmarks. */
  const lands: [string, WorldPlace][] = [
    ...Object.entries(WORLD_MAP.realms).map(([id, p]): [string, WorldPlace] => [id, p]),
    ...WORLD_MAP.slots.map((s): [string, WorldPlace] => [s.id, s]),
    ...WORLD_MAP.landmarks.map((l): [string, WorldPlace] => [l.id, l]),
  ];
  /** Where the hero and tag could stand: nowhere, or on any realm or slot. */
  const currents = [null, ...Object.values(WORLD_MAP.realms), ...WORLD_MAP.slots];

  const hit = (a: WorldRect, b: WorldRect) =>
    a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

  /**
   * Every pin's 28px box and name plate at every zoom, in art px (worked out
   * apart from worldKeepClear). The name shows from zoom 1.
   */
  const said = ZOOM_STEPS.flatMap((z) =>
    [...Object.values(WORLD_MAP.realms), ...WORLD_MAP.slots].flatMap((p) => {
      const half = WORLD_HERO.pin / 2 / z;
      const [l, t, r, b] = WORLD_HERO.detail.map((v) => v / z);
      return [
        { z, x: p.x - half, y: p.y - half, w: 2 * half, h: 2 * half },
        ...(z >= 1 ? [{ z, x: p.x + l, y: p.y + t, w: r - l, h: b - t }] : []),
      ];
    }),
  );
  /** Does a glyph show at zoom z? A `fromZoom: 1` glyph is hidden at ½. */
  const shows = (g: { fromZoom?: 1 }, z: number) => z >= (g.fromZoom ?? 0);

  /** As world-map.tsx: a slot with a realm takes that realm's seed and terrain. */
  const glyphsOf = (key: string, place: WorldPlace, current: WorldPlace | null) => {
    const realm = WORLD_MAP.slotRealms.find((s) => s.slot === key)?.realm;
    const id = realm !== undefined ? String(realm) : key;
    const seed = shapeSeed(/^\d+$/.test(id) ? Number(id) : id);
    const kinds = WORLD_TERRAIN[id] ?? WORLD_TERRAIN_DEFAULT;
    return terrainGlyphs(place, seed, kinds, worldKeepClear(current));
  };

  test('never covers a pin or a name at a zoom where it shows, wherever the hero stands', () => {
    const clashes: string[] = [];
    for (const current of currents)
      for (const [key, place] of lands)
        for (const g of glyphsOf(key, place, current))
          if (said.some((p) => shows(g, p.z) && hit(g, p)))
            clashes.push(`${key} ${g.kind}@${g.x},${g.y}`);
    expect(clashes).toEqual([]);
  });

  test('a fromZoom glyph is one that would touch something at ½; the rest show at ½', () => {
    const half = worldKeepClear(null).filter((c) => c.zoom === 0.5);
    for (const [key, place] of lands)
      for (const g of glyphsOf(key, place, null)) {
        const atHalf = half.some((c) => hit(g, c));
        expect({ key, g, atHalf }).toEqual({ key, g, atHalf: g.fromZoom === 1 });
      }
  });

  test('every land on a map, specialist islands too, shows terrain from zoom 1', () => {
    const used = new Set(WORLD_MAP.slotRealms.map((s) => s.slot));
    const bare = lands
      .filter(([key]) => !key.startsWith('s') || used.has(key))
      .filter(([key, place]) => glyphsOf(key, place, null).length === 0)
      .map(([key]) => key);
    expect(bare).toEqual([]);
  });

  test('stays inside its footprint, and glyphs never touch each other', () => {
    for (const current of currents)
      for (const [key, place] of lands) {
        const glyphs = glyphsOf(key, place, current);
        for (const g of glyphs) {
          expect(g.x).toBeGreaterThanOrEqual(place.x - place.w / 2);
          expect(g.y).toBeGreaterThanOrEqual(place.y - place.h / 2);
          expect(g.x + g.w).toBeLessThanOrEqual(place.x + place.w / 2);
          expect(g.y + g.h).toBeLessThanOrEqual(place.y + place.h / 2);
        }
        glyphs.forEach((a, i) => glyphs.slice(i + 1).forEach((b) => expect(hit(a, b)).toBe(false)));
      }
  });

  test('never covers the current tag or the hero (or anything else kept clear) where it shows', () => {
    for (const current of Object.values(WORLD_MAP.realms)) {
      const own = worldKeepClear(current);
      for (const [key, place] of lands)
        for (const g of glyphsOf(key, place, current))
          expect(own.some((c) => (c.zoom === null || shows(g, c.zoom)) && hit(g, c))).toBe(false);
    }
  });

  test('the same land gets the same terrain; every core realm shows some', () => {
    const p = WORLD_MAP.realms[1];
    expect(glyphsOf('1', p, null)).toEqual(glyphsOf('1', p, null));
    for (const [id, place] of Object.entries(WORLD_MAP.realms))
      expect({ id, some: glyphsOf(id, place, null).length > 0 }).toEqual({ id, some: true });
  });

  test('no kinds, no glyphs', () => {
    expect(terrainGlyphs(WORLD_MAP.realms[0], 1, [], [])).toEqual([]);
  });
});
