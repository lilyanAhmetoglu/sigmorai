/**
 * Pure helpers over the curriculum map. A realm's folder and art path are
 * built only here, from its number, so they can't drift apart.
 */
import { LEVEL_ART_BASE, MATH_AREA, OPEN_TIERS, REALMS } from '@/lib/constants';
import type { Accent, RealmId, Tier, TrackOutline } from '@/lib/types';

/** Whether a learner may open lessons and earn XP in a realm of this tier. */
export const isRealmOpen = (tier: Tier): boolean => (OPEN_TIERS as readonly Tier[]).includes(tier);

/** `3` → `03`: the two-digit form used in folder and art names. */
export const realmNumber = (id: RealmId) => String(id).padStart(2, '0');

/**
 * How many chapters a realm has on a track: the length of its entry in that
 * track's outline (MIN_CHAPTERS to MAX_CHAPTERS). Null when the realm is not
 * in the outline.
 */
export const outlineChapterCount = (outline: TrackOutline, realm: number): number | null =>
  outline.realms.find((r) => r.id === realm)?.chapters.length ?? null;

/** Content folder of a realm inside content/<track>/: `0` → `00-bootstrap-village`. */
export const realmFolder = (id: RealmId): string => `${realmNumber(id)}-${REALMS[id].slug}`;

/** Public URL of a realm's art layers: `0` → `/levels/realm-00`. */
export const realmArt = (id: RealmId): string => `${LEVEL_ART_BASE}/realm-${realmNumber(id)}`;

/** Accent of a realm, for `data-accent`: `3` → `realm-3`. */
export const realmAccent = (id: RealmId): Accent => `realm-${id}`;

/** Public URL of the Math Tower art layers: `/levels/math`. */
export const MATH_ART = `${LEVEL_ART_BASE}/${MATH_AREA}`;
