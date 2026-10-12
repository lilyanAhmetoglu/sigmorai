import Link from 'next/link';
import type { CSSProperties } from 'react';
import { Panel } from '@/components/panel';
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
import { coastline, edgeFog, rippleLine, shapeSeed, terrainGlyphs } from '@/lib/grading/world-map';
import type {
  Accent,
  RealmStatus,
  WorldGlyphKind,
  WorldPlace,
  WorldRealm,
  WorldClearBox,
  WorldGlyph,
  WorldView,
} from '@/lib/types';
import { ScrollToCurrent } from './scroll-to-current';
import { Compass, Frame, Glyphs, LandmarkPip, Trail } from './world-map-art';
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

/** The ripple line in the water around each land: art px out from the coast (a 4 px multiple, crisp at ½). */
const RIPPLE = 8;

const toPoints = (pts: readonly [number, number][]) => pts.map((p) => p.join(',')).join(' ');

/**
 * The same edge fog on every request: it depends only on the geometry. One
 * path of all its rects (about 200), not one node each. Same look: every
 * rect runs the same way round and the fog is one fill, so overlaps stay filled.
 */
const EDGE_FOG = edgeFog()
  .map((r) => `M${r.x} ${r.y}h${r.w}v${r.h}h${-r.w}z`)
  .join('');

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

/** The drawn shapes of one land: coast and ripple points, and its terrain. */
type LandArt = { coast: string; ripple: string; glyphs: WorldGlyph[] };

/**
 * Land shapes are pure geometry (about 29 ms for a whole map), so they are
 * worked out once per server process and kept here. The key covers every
 * input: `land.key` fixes the place, seed and terrain (all read from the
 * WORLD_MAP / WORLD_TERRAIN constants by realm or landmark id), and the
 * current realm's id fixes the keep-clear boxes (worldKeepClear(current
 * place)). Status, accent and path-only change only CSS, not shapes. At
 * most (lands × possible current realms) entries, a few hundred.
 */
const LAND_ART = new Map<string, LandArt>();
const CLEAR = new Map<string, WorldClearBox[]>();

function landArt(land: Land, current: Placed | undefined): LandArt {
  const currentKey = current ? `r${current.id}` : 'none';
  const key = `${land.key}:${currentKey}`;
  let found = LAND_ART.get(key);
  if (!found) {
    let clear = CLEAR.get(currentKey);
    if (!clear) {
      // Terrain keeps off every pin, name and label, and off the tag and
      // hero where they really stand (the current realm).
      clear = worldKeepClear(current?.place ?? null);
      CLEAR.set(currentKey, clear);
    }
    found = {
      coast: toPoints(coastline(land.place, land.seed)),
      ripple: toPoints(rippleLine(land.place, land.seed, RIPPLE)),
      glyphs: terrainGlyphs(land.place, land.seed, land.terrain, clear),
    };
    LAND_ART.set(key, found);
  }
  return found;
}

/** An outline in the water that follows a coast (drawn under every land). */
function Ripple({ shape }: { shape: LandArt }) {
  return <polygon className="world-ripple" points={shape.ripple} />;
}

type IslandProps = { land: Land; shape: LandArt; art: boolean };

/**
 * One land, like an old printed map: paper land with a light stipple, a band
 * of the realm colour inside the coast (clipped to the land), an inked coast
 * (dashed on a path-only island) and seeded terrain glyphs. An advanced,
 * locked realm is hatched. With the art slot filled, only the inked coast is
 * drawn over the picture.
 */
function Island({ land, shape, art }: IslandProps) {
  const points = shape.coast;
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
          <Glyphs glyphs={shape.glyphs} />
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
 * targets. A landmark (Math Tower, the Frontier) stands like a realm marker:
 * a pin with a diamond pip and its name plate, shown at every zoom.
 * Everything drawn is decoration (aria-hidden); the markers are the links,
 * and the realm cards and side-realm links under the box are the text view. ZoomControls sets
 * data-zoom on the box and world-map.css does the rest; with no JS the box
 * shows zoom 1. On load the box centres the current realm
 * (ScrollToCurrent).
 */
export function WorldMap({ view, heroName, tag }: Props) {
  const placed = view.realms.filter((r): r is Placed => r.place !== null);
  const current = placed.find((r) => r.current);
  const { width, height } = WORLD_MAP;
  const art = WORLD_MAP_ART.ready;
  const lands = landsOf(placed);
  const shapes = new Map(lands.map((land) => [land.key, landArt(land, current)]));

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
            {/* Fine details are 4 art px (2 screen px at ½), never a half pixel. */}
            {/* Land stipple: two 4×4 dots per 32×32, offset. */}
            <pattern id="world-stipple" width="32" height="32" patternUnits="userSpaceOnUse">
              <rect className="world-stipple-dot" x="4" y="4" width="4" height="4" />
              <rect className="world-stipple-dot" x="20" y="20" width="4" height="4" />
            </pattern>
            {/* Locked land: stepped diagonal hatching (4 art px dots). */}
            <pattern id="world-hatch" width="16" height="16" patternUnits="userSpaceOnUse">
              <rect className="world-hatch-dot" x="0" y="12" width="4" height="4" />
              <rect className="world-hatch-dot" x="4" y="8" width="4" height="4" />
              <rect className="world-hatch-dot" x="8" y="4" width="4" height="4" />
              <rect className="world-hatch-dot" x="12" y="0" width="4" height="4" />
            </pattern>
            {/* The Hallucinant's fog: an uneven 4 art px dither (a fixed 8×8 mask, about 40% full). */}
            <pattern id="world-fog" width="32" height="32" patternUnits="userSpaceOnUse">
              <path
                className="world-fog-dot"
                d="M24 0h4v4h-4zM12 4h4v4h-4zM20 4h4v4h-4zM0 8h12v4h-12zM20 8h4v4h-4zM28 8h4v4h-4zM4 12h8v4h-8zM16 12h8v4h-8zM0 16h4v4h-4zM16 16h4v4h-4zM4 20h24v4h-24zM0 24h4v4h-4zM8 24h8v4h-8zM24 24h4v4h-4zM4 28h4v4h-4zM12 28h4v4h-4zM24 28h4v4h-4z"
              />
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
                <Ripple key={land.key} shape={shapes.get(land.key)!} />
              ))}
            </>
          )}
          <path className="world-fog" d={EDGE_FOG} />
          {lands.map((land) => (
            <Island key={land.key} land={land} shape={shapes.get(land.key)!} art={art} />
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
                // Like the markers: no prefetch of every place in view on load.
                prefetch={false}
                className="world-landmark"
                data-accent={l.accent}
                data-align={l.align}
                aria-label={WORLD_MAP_TEXT.landmark(l.name)}
                style={{ ...anchorStyle(l), '--half-w': `${l.w / 2}px` } as CSSProperties}
              >
                {/* A pin like a realm's, with the side-realm diamond for its pip. */}
                <span className="world-marker-pin">
                  <span className="world-marker-pip">
                    <LandmarkPip />
                  </span>
                </span>{' '}
                <span className="world-landmark-name">{l.name}</span>
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

/** The empty box at its final size (no layout jump). */
export function WorldMapSkeleton() {
  return (
    <div className="world-map" style={STAGE_STYLE}>
      <div className="world-map-stage" />
    </div>
  );
}

/**
 * Everything under the /map header while the data loads, at its final
 * size: track switch, map box, hint + zoom row, side-realm buttons, realm
 * cards. No spinner. A fragment, so the page's own gap spaces it. For the
 * page's Suspense and its loading.tsx.
 */
export function WorldMapBodySkeleton() {
  return (
    <>
      <span role="status" className="sr-only">
        {WORLD_MAP_TEXT.loading}
      </span>
      <div className="bg-surface-2 h-11 w-60" />
      <WorldMapSkeleton />
      {/* Hint + zoom row */}
      <div className="bg-surface-2 h-11" />
      {/* Side realms: heading + two buttons */}
      <div className="flex flex-col gap-3">
        <div className="bg-surface-2 h-4 w-32" />
        <div className="flex flex-wrap gap-3">
          <div className="bg-surface-2 h-11 w-44" />
          <div className="bg-surface-2 h-11 w-44" />
        </div>
      </div>
      {/* Realm cards */}
      <div className="card-grid">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Panel key={i} tone="sunken">
            <div className="h-48" />
          </Panel>
        ))}
      </div>
    </>
  );
}
