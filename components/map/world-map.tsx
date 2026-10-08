import Link from 'next/link';
import type { CSSProperties } from 'react';
import { PixelAvatar } from '@/components/pixel-avatar';
import {
  heroSide,
  WORLD_MAP,
  WORLD_MAP_ART,
  WORLD_MAP_TEXT,
  WORLD_TERRAIN,
  WORLD_TERRAIN_DEFAULT,
  worldKeepClear,
} from '@/lib/constants';
import { realmAccent } from '@/lib/content/curriculum';
import { coastline, edgeFog, offsetCoast, shapeSeed, terrainGlyphs } from '@/lib/grading/world-map';
import type {
  Accent,
  RealmStatus,
  WorldGlyphKind,
  WorldPlace,
  WorldRealm,
  WorldRect,
  WorldView,
} from '@/lib/types';
import { ScrollToCurrent } from './scroll-to-current';
import { Compass, Frame, Glyphs, Trail } from './world-map-art';
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

/** Ripple lines in the water around each land: art px out from the coast. */
const RIPPLES = [6, 12] as const;

const toPoints = (pts: readonly [number, number][]) => pts.map((p) => p.join(',')).join(' ');

/** The same edge fog on every request: it depends only on the geometry. */
const EDGE_FOG = edgeFog();

type Placed = WorldRealm & { place: WorldPlace };

/** One land to draw: a placed realm or a landmark. */
type Land = {
  key: string;
  place: WorldPlace;
  seed: number;
  accent: Accent;
  terrain: readonly WorldGlyphKind[];
  status?: RealmStatus;
  /** A specialist realm (only on this path): its coast is dashed. */
  pathOnly?: boolean;
};

/** Every land on this path's map: the placed realms, then the landmarks. */
function landsOf(placed: readonly Placed[]): Land[] {
  return [
    ...placed.map((r): Land => ({
      key: `r${r.id}`,
      place: r.place,
      seed: shapeSeed(r.id),
      accent: realmAccent(r.id),
      terrain: WORLD_TERRAIN[r.id] ?? WORLD_TERRAIN_DEFAULT,
      status: r.status,
      pathOnly: r.track !== null,
    })),
    ...WORLD_MAP.landmarks.map((l): Land => ({
      key: l.id,
      place: l,
      seed: shapeSeed(l.id),
      accent: l.accent,
      terrain: WORLD_TERRAIN[l.id] ?? WORLD_TERRAIN_DEFAULT,
    })),
  ];
}

/** Two outlines in the water that follow a coast (drawn under every land). */
function Ripples({ land }: { land: Land }) {
  const coast = coastline(land.place, land.seed);
  return (
    <>
      {RIPPLES.map((d, i) => (
        <polygon
          key={d}
          className="world-ripple"
          data-ring={i}
          points={toPoints(offsetCoast(coast, d))}
        />
      ))}
    </>
  );
}

type IslandProps = { land: Land; clear: readonly WorldRect[]; art: boolean };

/**
 * One land, like an old printed map: paper land with a light stipple, a band
 * of the realm colour inside the coast (clipped to the land), an inked coast
 * (dashed on a path-only island) and seeded terrain glyphs. An advanced,
 * locked realm is hatched. With the art slot filled, only the inked coast is
 * drawn over the picture.
 */
function Island({ land, clear, art }: IslandProps) {
  const points = toPoints(coastline(land.place, land.seed));
  const clipId = `world-clip-${land.key}`;
  return (
    <g
      className="world-island"
      data-accent={land.accent}
      data-status={land.status}
      data-path-only={land.pathOnly || undefined}
    >
      {!art && (
        <>
          <clipPath id={clipId}>
            <polygon points={points} />
          </clipPath>
          <polygon className="world-land" points={points} />
          <polygon className="world-land-texture" points={points} />
          <polygon className="world-land-band" points={points} clipPath={`url(#${clipId})`} />
          <Glyphs glyphs={terrainGlyphs(land.place, land.seed, land.terrain, clear)} />
        </>
      )}
      <polygon className="world-coast" points={points} />
    </g>
  );
}

/**
 * The world map (world-map spec): one top-down world in a native scroll box,
 * like the level map. Until the Higgsfield art lands (PR 3), the world is
 * drawn as an old pixel cartography map from the geometry constant: a paper
 * sea with wave marks, paper lands with an inked, seeded coast, ripple lines
 * and themed terrain glyphs, the path's route with arrows, a compass rose, a
 * framed border and a ragged edge of Hallucinant fog. When
 * WORLD_MAP_ART.ready, the art PNG replaces the drawn sea, land and terrain.
 * Slot fog patches wait for the art too: an empty slot is plain sea.
 *
 * Layers: the SVG scales with the zoom; markers, landmarks and the hero do
 * not (world-map.css positions them by anchor × zoom), so they stay 44px
 * targets. Everything drawn is decoration (aria-hidden); the markers are the
 * links, and the path list under the box is the text view. ZoomControls sets
 * data-zoom on the box and world-map.css does the rest; with no JS the box
 * shows the overview. On load the box centres the current realm
 * (ScrollToCurrent).
 */
export function WorldMap({ view, heroName, tag }: Props) {
  const placed = view.realms.filter((r): r is Placed => r.place !== null);
  const current = placed.find((r) => r.current);
  const { width, height } = WORLD_MAP;
  const art = WORLD_MAP_ART.ready;
  const lands = landsOf(placed);
  // Terrain keeps off every pin, name and label, and off the tag and hero
  // where they really stand (the current realm).
  const clear = worldKeepClear(current?.place ?? null);

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
            {/* Wave marks: two small stepped zigzags per 64×48 of sea. */}
            <pattern id="world-waves" width="64" height="48" patternUnits="userSpaceOnUse">
              <path className="world-wave" d="M8 10h4v2h-4zM12 12h4v2h-4zM16 10h4v2h-4z" />
              <path className="world-wave" d="M40 34h4v2h-4zM44 36h4v2h-4zM48 34h4v2h-4z" />
            </pattern>
            {/* Land stipple: two 2×2 dots per 16×16, offset. */}
            <pattern id="world-stipple" width="16" height="16" patternUnits="userSpaceOnUse">
              <rect className="world-stipple-dot" x="2" y="2" width="2" height="2" />
              <rect className="world-stipple-dot" x="10" y="10" width="2" height="2" />
            </pattern>
            {/* Locked land: stepped diagonal hatching (2 art px dots). */}
            <pattern id="world-hatch" width="8" height="8" patternUnits="userSpaceOnUse">
              <rect className="world-hatch-dot" x="0" y="6" width="2" height="2" />
              <rect className="world-hatch-dot" x="2" y="4" width="2" height="2" />
              <rect className="world-hatch-dot" x="4" y="2" width="2" height="2" />
              <rect className="world-hatch-dot" x="6" y="0" width="2" height="2" />
            </pattern>
            {/* 2×2 art px checker: the Hallucinant's dithered fog. */}
            <pattern id="world-fog" width="4" height="4" patternUnits="userSpaceOnUse">
              <rect className="world-fog-dot" width="2" height="2" />
              <rect className="world-fog-dot" x="2" y="2" width="2" height="2" />
            </pattern>
          </defs>
          {art ? (
            <image
              className="world-art-image"
              href={WORLD_MAP_ART.src}
              width={width}
              height={height}
              preserveAspectRatio="none"
            />
          ) : (
            <>
              <rect className="world-sea" width={width} height={height} />
              <rect className="world-waves" width={width} height={height} />
              {lands.map((land) => (
                <Ripples key={land.key} land={land} />
              ))}
            </>
          )}
          {EDGE_FOG.map((r, i) => (
            <rect key={i} className="world-fog" x={r.x} y={r.y} width={r.w} height={r.h} />
          ))}
          {lands.map((land) => (
            <Island key={land.key} land={land} clear={clear} art={art} />
          ))}
          <Trail trail={view.trail} />
          <Compass />
          <Frame />
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
