import Link from 'next/link';
import type { CSSProperties } from 'react';
import { PixelAvatar } from '@/components/pixel-avatar';
import { WORLD_MAP, WORLD_MAP_TEXT } from '@/lib/constants';
import { realmAccent } from '@/lib/content/curriculum';
import type { WorldPlace, WorldRealm, WorldView } from '@/lib/types';
import { ScrollToCurrent } from './scroll-to-current';
import { anchorStyle, WorldMarker } from './world-marker';

/** The current realm's marker: centred in the box on load. */
const CURRENT_SELECTOR = '.world-marker[aria-current="location"]';

type Props = {
  view: WorldView;
  /** The player's hero name (sprite seed), or null for a visitor: then no hero. */
  heroName: string | null;
};

/** id of the scroll box: the zoom buttons set data-zoom on it. */
export const WORLD_MAP_BOX_ID = 'world-map';

/** Grid size for world-map.css (box height and stage = grid × zoom). */
const STAGE_STYLE = {
  '--world-w': `${WORLD_MAP.width}px`,
  '--world-h': `${WORLD_MAP.height}px`,
} as CSSProperties;

/** Art px: the notch cut from each corner (one 16px tile) and the width of the edge fog. */
const NOTCH = WORLD_MAP.tile;
const EDGE_FOG = 24;

/**
 * A footprint as a rectangle with one-tile notches cut from its corners,
 * `grow` art px bigger on every side (the shallows ring). SVG points.
 */
function notched({ x, y, w, h }: WorldPlace, grow = 0): string {
  const l = x - w / 2 - grow;
  const r = x + w / 2 + grow;
  const t = y - h / 2 - grow;
  const b = y + h / 2 + grow;
  const n = NOTCH;
  return [
    [l + n, t],
    [r - n, t],
    [r - n, t + n],
    [r, t + n],
    [r, b - n],
    [r - n, b - n],
    [r - n, b],
    [l + n, b],
    [l + n, b - n],
    [l, b - n],
    [l, t + n],
    [l + n, t + n],
  ]
    .map((p) => p.join(','))
    .join(' ');
}

type Placed = WorldRealm & { place: WorldPlace };

/**
 * The world map (world-map spec): one top-down world in a native scroll box,
 * like the level map. Until the Higgsfield art lands (PR 3), the world is a
 * token-coloured placeholder drawn from the geometry constant: flat sea,
 * shallows, notched continents, dithered fog. No realm art is reused.
 *
 * Layers: the SVG (sea, lands, fog, trail) scales with the zoom; markers,
 * landmarks and the hero do not (world-map.css positions them by anchor ×
 * zoom), so they stay 44px targets. Everything drawn is decoration
 * (aria-hidden); the markers are the links, and the "Your path" list under
 * the box is the text view. ZoomControls sets data-zoom on the box and
 * world-map.css does the rest; with no JS the box shows the overview. On
 * load the box centres the current realm (ScrollToCurrent).
 */
export function WorldMap({ view, heroName }: Props) {
  const placed = view.realms.filter((r): r is Placed => r.place !== null);
  const current = placed.find((r) => r.current);
  const tag = heroName ? WORLD_MAP_TEXT.youAreHere : WORLD_MAP_TEXT.startHere;
  const { width, height } = WORLD_MAP;

  return (
    <section
      id={WORLD_MAP_BOX_ID}
      aria-label={WORLD_MAP_TEXT.mapLabel}
      className="world-map"
      style={STAGE_STYLE}
      // Focusable, so arrow keys scroll it like any scroll box.
      tabIndex={0}
    >
      <div className="world-map-stage">
        <svg
          className="world-map-art"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          shapeRendering="crispEdges"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            {/* 2×2 art px checker: the placeholder's dithered fog. */}
            <pattern id="world-fog" width="4" height="4" patternUnits="userSpaceOnUse">
              <rect className="world-fog-dot" width="2" height="2" />
              <rect className="world-fog-dot" x="2" y="2" width="2" height="2" />
            </pattern>
          </defs>
          <rect className="world-sea" width={width} height={height} />
          {[...placed.map((r) => r.place), ...WORLD_MAP.landmarks].map((p, i) => (
            <polygon key={i} className="world-shallows" points={notched(p, NOTCH)} />
          ))}
          {placed.map((r) => (
            <polygon
              key={r.id}
              className="world-land"
              data-accent={realmAccent(r.id)}
              data-status={r.status}
              points={notched(r.place)}
            />
          ))}
          {WORLD_MAP.landmarks.map((l) => (
            <polygon key={l.id} className="world-land" data-accent={l.accent} points={notched(l)} />
          ))}
          {view.fog.map((slot) => (
            <polygon key={slot.id} className="world-fog" points={notched(slot)} />
          ))}
          <path
            className="world-fog"
            fillRule="evenodd"
            d={`M0 0H${width}V${height}H0Z M${EDGE_FOG} ${EDGE_FOG}V${height - EDGE_FOG}H${width - EDGE_FOG}V${EDGE_FOG}Z`}
          />
          {view.trail.map((s) => (
            <g
              key={`${s.from}-${s.to}`}
              className="world-trail"
              data-cleared={s.cleared || undefined}
            >
              <line className="world-trail-under" x1={s.a.x} y1={s.a.y} x2={s.b.x} y2={s.b.y} />
              <line className="world-trail-line" x1={s.a.x} y1={s.a.y} x2={s.b.x} y2={s.b.y} />
            </g>
          ))}
        </svg>

        {current && heroName && (
          <div className="world-hero" style={anchorStyle(current.place)} aria-hidden="true">
            <PixelAvatar seed={heroName} size="sm" accent="xp" />
          </div>
        )}

        <ol className="world-markers">
          {placed.map((realm) => (
            <li key={realm.id}>
              <WorldMarker realm={realm} tag={realm.current ? tag : undefined} />
            </li>
          ))}
        </ol>
        <ul className="world-landmarks">
          {WORLD_MAP.landmarks.map((l) => (
            <li key={l.id}>
              <Link
                href={l.href}
                className="world-landmark"
                data-accent={l.accent}
                style={anchorStyle(l)}
              >
                {l.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      {/* Keyed on the current realm: a new one re-runs the centring. */}
      <ScrollToCurrent
        key={current?.id ?? 'none'}
        scrollerId={WORLD_MAP_BOX_ID}
        selector={CURRENT_SELECTOR}
      />
    </section>
  );
}

/** The empty box at its final size, for loading.tsx (no layout jump). */
export function WorldMapSkeleton() {
  return (
    <div className="world-map" style={STAGE_STYLE}>
      <div className="world-map-stage" />
    </div>
  );
}
