/**
 * Test fixture for specialist realms (path-curriculum spec, PR 1b). The
 * engine is tested against this table, not the real one (which ships r9
 * Canvas Workshop): today's core realms plus two specialist rows owned by
 * one track each, with no art. Never imported by app code.
 */
import { coreRealms, MIN_CHAPTERS } from '@/lib/constants';
import type { RealmTable, TrackOutline } from '@/lib/types';

/** r9: creator only, intermediate, no art. r10: builder only, beginner, no art. */
export const SPECIALIST_REALMS: RealmTable = [
  ...coreRealms(),
  {
    id: 9,
    slug: 'fixture-canvas',
    name: 'Fixture Canvas',
    npc: 'Fixture Guide',
    tier: 'intermediate',
    track: 'creator',
    scene: false,
  },
  {
    id: 10,
    slug: 'fixture-yard',
    name: 'Fixture Yard',
    npc: 'Fixture Smith',
    tier: 'beginner',
    track: 'builder',
    scene: false,
  },
];

/** The core realm ids, in order: r0–r8. */
export const CORE_IDS = coreRealms().map((r) => r.id);

/** One outline entry: realm `id` with `chapters` chapters (c1 … cN). */
export const realmOutline = (id: number, chapters = MIN_CHAPTERS) => ({
  id,
  topic: `topic ${id}`,
  lore: `lore ${id}`,
  chapters: Array.from({ length: chapters }, (_, i) => ({
    id: `c${i + 1}`,
    title: `Chapter ${i + 1}`,
  })),
  boss: {},
});

/** An outline listing these realm ids in this (map) order, MIN_CHAPTERS each. */
export const fixtureOutline = (ids: readonly number[]): TrackOutline => ({
  realms: ids.map((id) => realmOutline(id)),
});

/** The creator fixture path: r9 sits between r1 and r2 (outline order ≠ id order). */
export const CREATOR_ORDER = [0, 1, 9, 2, 3, 4, 5, 6, 7, 8];
