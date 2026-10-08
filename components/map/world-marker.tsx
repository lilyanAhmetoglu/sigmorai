import Link from 'next/link';
import type { CSSProperties } from 'react';
import { REALMS_TEXT, TRACK_TEXT, WORLD_MAP_TEXT, WORLD_MARKER_STATUS_TEXT } from '@/lib/constants';
import { realmAccent, realmNumber } from '@/lib/content/curriculum';
import type { WorldPlace, WorldRealm } from '@/lib/types';
import { filledSegments } from '@/lib/xp/segments';
import { StatusPip } from './world-map-art';

type Props = {
  realm: WorldRealm & { place: WorldPlace };
  /** "YOU ARE HERE" / "START HERE" on the current realm, else nothing. */
  tag?: string;
};

/** Anchor in art px, for world-map.css (it multiplies by the zoom). */
export const anchorStyle = ({ x, y }: WorldPlace) =>
  ({ '--x': `${x}px`, '--y': `${y}px` }) as CSSProperties;

/** The status row's state: the realm's own, or "soon" while nothing in it is built. */
const markerState = (realm: WorldRealm) =>
  realm.soon && realm.status !== 'tier-locked' ? 'soon' : realm.status;

/**
 * One realm on the world map: a link to its level map, standing on the
 * realm's anchor (clear-maps amendment). The link is a transparent 44px
 * target; inside it, a small visible pin with a state pip (a shape per
 * state, explained in the map key), so the land shows around it. The tag
 * sits above it and, from zoom 1, a small label plate below it, so most
 * of the land shows: the name; the realm number as a small tag with the
 * status as icon + word; and a thin segmented bar, one cell per chapter and
 * the boss, lit when cleared (XPBar's cell logic, filledSegments). The
 * numbers ("2 of 7 cleared") are in the accessible name and the path list:
 * "2/7" did not fit the 148px plate next to IN PROGRESS.
 * It does not scale with the zoom; WORLD_HERO.detail is its box. The
 * accessible name starts with the visible text in screen order (WCAG
 * 2.5.3): tag, name, number, state, then cleared of total. A specialist
 * realm adds "creator only" after its name. No prefetch: a map has many
 * markers in view at once, and each would fetch its realm on load (the path
 * list under the map links the same realms). Styles: world-map.css.
 */
export function WorldMarker({ realm, tag }: Props) {
  const state = WORLD_MARKER_STATUS_TEXT[markerState(realm)];
  const number = realmNumber(realm.id);
  const label = WORLD_MAP_TEXT.marker(
    number,
    realm.name,
    state.label,
    realm.cleared,
    realm.total,
    tag,
    realm.track ? REALMS_TEXT.pathRealm(TRACK_TEXT[realm.track].label) : undefined,
  );
  // One cell per chapter and the boss.
  const lit = filledSegments(realm.cleared, realm.total, realm.total);
  return (
    <Link
      href={realm.href}
      prefetch={false}
      className="world-marker"
      data-accent={realmAccent(realm.id)}
      data-status={realm.status}
      aria-current={realm.current ? 'location' : undefined}
      aria-label={label}
      style={anchorStyle(realm.place)}
    >
      {/* The {' '} keep the visible text "YOU ARE HERE PROMPT FOREST 01 …"
          apart, as in the label. The grid and flex drop them from layout. */}
      {tag && (
        <>
          <span className="world-marker-tag">{tag}</span>{' '}
        </>
      )}
      <span className="world-marker-pin">
        <span className="world-marker-pip">
          <StatusPip status={realm.status} />
        </span>
      </span>{' '}
      <span className="world-marker-label">
        <span className="world-marker-name">{realm.name}</span>{' '}
        <span className="world-marker-state">
          <span className="world-marker-number">{number}</span>{' '}
          <span aria-hidden="true">{state.icon}</span> {state.label}
        </span>{' '}
        <span className="world-marker-bar" aria-hidden="true">
          {Array.from({ length: realm.total }, (_, i) => (
            <span key={i} className="world-marker-cell" data-lit={i < lit || undefined} />
          ))}
        </span>
      </span>
    </Link>
  );
}
