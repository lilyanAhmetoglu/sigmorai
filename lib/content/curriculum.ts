/**
 * Pure helpers over the curriculum map. A realm's folder and art path are
 * built only here, from its number, so they can't drift apart.
 */
import { LEVEL_ART_BASE, OPEN_TIERS, REALMS } from '@/lib/constants';
import type { RealmId, Tier } from '@/lib/types';

/** Whether a learner may open lessons and earn XP in a realm of this tier. */
export const isRealmOpen = (tier: Tier): boolean => (OPEN_TIERS as readonly Tier[]).includes(tier);

/** `3` → `03`: the two-digit form used in folder and art names. */
const pad = (id: RealmId) => String(id).padStart(2, '0');

/** Content folder of a realm inside content/<track>/: `0` → `00-bootstrap-village`. */
export const realmFolder = (id: RealmId): string => `${pad(id)}-${REALMS[id].slug}`;

/** Public URL of a realm's art layers: `0` → `/levels/realm-00`. */
export const realmArt = (id: RealmId): string => `${LEVEL_ART_BASE}/realm-${pad(id)}`;
