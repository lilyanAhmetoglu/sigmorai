import Link from 'next/link';
import type { CSSProperties } from 'react';
import { StatusBadge } from '@/components/realms/status-badge';
import { REALM_STATUS_TEXT, WORLD_MAP_TEXT } from '@/lib/constants';
import { realmAccent, realmNumber } from '@/lib/content/curriculum';
import type { WorldPlace, WorldRealm } from '@/lib/types';

type Props = {
  realm: WorldRealm & { place: WorldPlace };
  /** "YOU ARE HERE" / "START HERE" on the current realm, else nothing. */
  tag?: string;
};

/** Anchor in art px, for world-map.css (it multiplies by the zoom). */
export const anchorStyle = ({ x, y }: WorldPlace) =>
  ({ '--x': `${x}px`, '--y': `${y}px` }) as CSSProperties;

/**
 * One realm on the world map: a link to its level map, standing on the
 * realm's anchor. The link is a 44px pin (realm number + state icon); the
 * tag sits above it and, from zoom 1, the name and the state as a word
 * (StatusBadge) below it. It does not scale with the
 * zoom, so it stays a 44px target. The accessible name says it all: name,
 * state, cleared of total, and the tag. Styles: world-map.css.
 */
export function WorldMarker({ realm, tag }: Props) {
  const state = REALM_STATUS_TEXT[realm.status];
  return (
    <Link
      href={realm.href}
      className="world-marker"
      data-accent={realmAccent(realm.id)}
      data-status={realm.status}
      aria-current={realm.current ? 'location' : undefined}
      aria-label={WORLD_MAP_TEXT.marker(realm.name, state.label, realm.cleared, realm.total, tag)}
      style={anchorStyle(realm.place)}
    >
      {realmNumber(realm.id)}
      <span className="world-marker-icon" aria-hidden="true">
        {state.icon}
      </span>
      {tag && <span className="world-marker-tag">{tag}</span>}
      <span className="world-marker-detail">
        <span className="world-marker-name">{realm.name}</span>
        <StatusBadge text={state} />
      </span>
    </Link>
  );
}
