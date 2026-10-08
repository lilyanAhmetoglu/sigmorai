import Link from 'next/link';
import type { CSSProperties } from 'react';
import { PixelAvatar } from '@/components/pixel-avatar';
import { heroSide, WORLD_MAP, WORLD_MAP_TEXT } from '@/lib/constants';
import { realmAccent } from '@/lib/content/curriculum';
import { coastline, edgeFog, shapeSeed } from '@/lib/grading/world-map';
import type { Accent, RealmStatus, WorldPlace, WorldRealm, WorldView } from '@/lib/types';
import { ScrollToCurrent } from './scroll-to-current';
import { anchorStyle, WorldMarker } from './world-marker';

/** The current realm's marker: centred in the box on load. */
const CURRENT_SELECTOR = '.world-marker[aria-current="location"]';

type Props = {
  view: WorldView;
  /** The player's hero name (sprite seed), or null for a visitor: then no hero. */
  heroName: string | null;
  /** On the current realm: "YOU ARE HERE" (a player) or "START HERE" (a visitor). */
  tag: string;
};

/** id of the scroll box: the zoom buttons set data-zoom on it. */
export const WORLD_MAP_BOX_ID = 'world-map';
/** id of the hint under the box (the box's aria-describedby). */
export const WORLD_MAP_HINT_ID = 'world-map-hint';

/** Grid size for world-map.css (box height and stage = grid × zoom). */
const STAGE_STYLE = {
  '--world-w': `${WORLD_MAP.width}px`,
  '--world-h': `${WORLD_MAP.height}px`,
} as CSSProperties;

/** Land sits one tile inside its footprint; the beach ring fills the tile around it. */
const shrink = (p: WorldPlace): WorldPlace => ({
  ...p,
  w: p.w - 2 * WORLD_MAP.tile,
  h: p.h - 2 * WORLD_MAP.tile,
});

const toPoints = (pts: [number, number][]) => pts.map((p) => p.join(',')).join(' ');

/** The same edge fog on every request: it depends only on the geometry. */
const EDGE_FOG = edgeFog();

type Placed = WorldRealm & { place: WorldPlace };

type IslandProps = { place: WorldPlace; seed: number; accent: Accent; status?: RealmStatus };

/** One island: a beach ring (the footprint's coastline) with the land one tile inside it. */
function Island({ place, seed, accent, status }: IslandProps) {
  return (
    <g data-accent={accent} data-status={status}>
      <polygon className="world-beach" points={toPoints(coastline(place, seed))} />
      <polygon className="world-land" points={toPoints(coastline(shrink(place), seed))} />
    </g>
  );
}

/**
 * The world map (world-map spec): one top-down world in a native scroll box,
 * like the level map. Until the Higgsfield art lands (PR 3), the world is a
 * token-coloured placeholder drawn from the geometry constant: sea with
 * sparse waves, islands with a seeded uneven coast (beach, land, a coastline
 * in the realm colour) and a ragged edge of fog. No realm art is reused.
 * Slot fog patches wait for the art too: in PR 1 an empty slot is plain sea.
 *
 * Layers: the SVG (sea, fog, islands, trail) scales with the zoom; markers,
 * landmarks and the hero do not (world-map.css positions them by anchor ×
 * zoom), so they stay 44px targets. Everything drawn is decoration
 * (aria-hidden); the markers are the links, and the path list under the box
 * is the text view. ZoomControls sets data-zoom on the box and world-map.css
 * does the rest; with no JS the box shows the overview. On load the box
 * centres the current realm (ScrollToCurrent).
 */
export function WorldMap({ view, heroName, tag }: Props) {
  const placed = view.realms.filter((r): r is Placed => r.place !== null);
  const current = placed.find((r) => r.current);
  const { width, height } = WORLD_MAP;

  return (
    <section
      id={WORLD_MAP_BOX_ID}
      aria-label={WORLD_MAP_TEXT.mapLabel}
      aria-describedby={WORLD_MAP_HINT_ID}
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
            {/* Sparse waves: two 2×1 art px dashes per 32px of sea. */}
            <pattern id="world-waves" width="32" height="32" patternUnits="userSpaceOnUse">
              <rect className="world-wave" x="6" y="9" width="2" height="1" />
              <rect className="world-wave" x="22" y="25" width="2" height="1" />
            </pattern>
            {/* 2×2 art px checker: the placeholder's dithered fog. */}
            <pattern id="world-fog" width="4" height="4" patternUnits="userSpaceOnUse">
              <rect className="world-fog-dot" width="2" height="2" />
              <rect className="world-fog-dot" x="2" y="2" width="2" height="2" />
            </pattern>
          </defs>
          <rect className="world-sea" width={width} height={height} />
          <rect className="world-waves" width={width} height={height} />
          {EDGE_FOG.map((r, i) => (
            <rect key={i} className="world-fog" x={r.x} y={r.y} width={r.w} height={r.h} />
          ))}
          {placed.map((r) => (
            <Island
              key={r.id}
              place={r.place}
              seed={shapeSeed(r.id)}
              accent={realmAccent(r.id)}
              status={r.status}
            />
          ))}
          {WORLD_MAP.landmarks.map((l) => (
            <Island key={l.id} place={l} seed={shapeSeed(l.id)} accent={l.accent} />
          ))}
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
          <div
            className="world-hero"
            // The first side of the pin that hides no other pin or label (heroSide).
            data-side={heroSide(current.place) ?? 'left'}
            style={anchorStyle(current.place)}
            aria-hidden="true"
          >
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
                data-align={l.align}
                style={
                  {
                    ...anchorStyle(l),
                    '--half-w': `${l.w / 2}px`,
                    '--half-h': `${l.h / 2}px`,
                  } as CSSProperties
                }
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
