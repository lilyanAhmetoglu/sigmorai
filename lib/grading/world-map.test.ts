import { describe, expect, test } from 'bun:test';
import { REALMS, WORLD_MAP } from '@/lib/constants';
import type { RealmStatus, RealmView, TrackMap, WorldGeometry } from '@/lib/types';
import { realmPlace, worldView } from './world-map';

/** A realm view with 6 chapters + boss; only the fields worldView reads matter. */
function realm(id: number, status: RealmStatus, cleared = 0): RealmView {
  const r = REALMS[id];
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    npc: r.npc,
    tier: r.tier,
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
