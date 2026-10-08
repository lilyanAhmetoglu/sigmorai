/**
 * Pure helpers over the curriculum map. A realm's folder and art path are
 * built only here, from its number, so they can't drift apart.
 */
import { ACCENTS, LEVEL_ART_BASE, MATH_AREA, OPEN_TIERS, REALMS, realmRow } from '@/lib/constants';
import type { Accent, RealmTable, Tier, TrackOutline } from '@/lib/types';

/** Whether a learner may open lessons and earn XP in a realm of this tier. */
export const isRealmOpen = (tier: Tier): boolean => (OPEN_TIERS as readonly Tier[]).includes(tier);

/** `3` → `03`: the two-digit form used in folder and art names. */
export const realmNumber = (id: number) => String(id).padStart(2, '0');

/**
 * How many chapters a realm has on a track: the length of its entry in that
 * track's outline (MIN_CHAPTERS to MAX_CHAPTERS). Null when the realm is not
 * in the outline.
 */
export const outlineChapterCount = (outline: TrackOutline, realm: number): number | null =>
  outline.realms.find((r) => r.id === realm)?.chapters.length ?? null;

/** The REALMS row of a realm number; throws on an unknown one (a bug, not input). */
function knownRealm(id: number, table: RealmTable) {
  const row = realmRow(id, table);
  if (!row) throw new RangeError(`Unknown realm r${id}`);
  return row;
}

/** Content folder of a realm inside content/<track>/: `0` → `00-bootstrap-village`. */
export const realmFolder = (id: number, table: RealmTable = REALMS): string =>
  `${realmNumber(id)}-${knownRealm(id, table).slug}`;

/**
 * Public URL of a realm's art layers: `0` → `/levels/realm-00`. Null when
 * the realm has no art yet (`scene: false`): the caller draws a flat
 * `neutral` scene, never another realm's art (path-curriculum spec).
 */
export const realmArt = (id: number, table: RealmTable = REALMS): string | null =>
  knownRealm(id, table).scene ? `${LEVEL_ART_BASE}/realm-${realmNumber(id)}` : null;

/**
 * Accent of a realm, for `data-accent`: `3` → `realm-3`. A realm with no
 * accent token yet (a specialist realm, past r8) is `neutral` until a
 * Claude Design pass adds its token; code never invents a colour.
 */
export function realmAccent(id: number): Accent {
  const accent = `realm-${id}`;
  return (ACCENTS as readonly string[]).includes(accent) ? (accent as Accent) : 'neutral';
}

/** Public URL of the Math Tower art layers: `/levels/math`. */
export const MATH_ART = `${LEVEL_ART_BASE}/${MATH_AREA}`;
