import type { Metadata } from 'next';
import { Suspense } from 'react';
import {
  WORLD_MAP_BOX_ID,
  WORLD_MAP_HINT_ID,
  WorldMap,
  WorldMapBodySkeleton,
} from '@/components/map/world-map';
import { WorldMapLegend } from '@/components/map/world-map-legend';
import { ZoomControls } from '@/components/map/zoom-controls';
import { PathList } from '@/components/realms/path-list';
import { SignInNote } from '@/components/realms/sign-in-note';
import { TrackSwitch } from '@/components/realms/track-switch';
import { MAP_HREF, TRACK_PARAM, TRACK_TEXT, WORLD_MAP_TEXT, worldMapHref } from '@/lib/constants';
import { getRealmsPage, type RealmsPage } from '@/lib/data/realms';
import { realmNumber } from '@/lib/content/curriculum';
import { worldView } from '@/lib/grading/world-map';

const PATH_HEADING_ID = 'your-path';

// Relative URLs resolve against metadataBase (app/layout.tsx).
export const metadata: Metadata = {
  title: WORLD_MAP_TEXT.metaTitle,
  description: WORLD_MAP_TEXT.description,
  alternates: { canonical: MAP_HREF },
};

/** The page's data, read once and shared by the eyebrow and the body. */
type MapData = { trackParam: string | string[] | undefined; page: RealmsPage };

/**
 * The world map (docs/plans/world-map-design-plan.md): every realm of one
 * path as a land on one top-down map, the trail between them and the hero on
 * the realm holding the next step. Each land links to its level map
 * (/map/<slug>). Public: a visitor sees the default path with no progress
 * and "START HERE". `?track=` picks the path, like the realm pages.
 * In a route group so this loading.tsx never wraps /map/<slug>, whose layout
 * must 404 a bad slug before anything streams.
 * Not built yet: the Higgsfield art (PR 3); the world is drawn as a token
 * cartography map, with an art slot (WORLD_MAP_ART) ready for the PNG.
 *
 * Not async: the title and intro need no data, so they are in the first
 * HTML and paint at once (they are the page's largest text, its LCP). Only
 * the eyebrow (the path name) and the body wait for the data, each in its
 * own Suspense, with placeholders at their final size.
 */
export default function WorldMapPage({ searchParams }: PageProps<'/map'>) {
  const data: Promise<MapData> = searchParams.then(async (query) => ({
    trackParam: query[TRACK_PARAM],
    page: await getRealmsPage(query[TRACK_PARAM]),
  }));

  return (
    <div className="max-w-app mx-auto flex w-full flex-col gap-6 px-4 py-6">
      <header className="flex flex-col gap-2">
        {/* A non-breaking space keeps the line's height while the path loads. */}
        <Suspense fallback={<p className="page-eyebrow">{'\u00a0'}</p>}>
          <Eyebrow data={data} />
        </Suspense>
        <h1 className="page-title">{WORLD_MAP_TEXT.title}</h1>
        <p className="page-intro">{WORLD_MAP_TEXT.intro}</p>
      </header>
      <Suspense fallback={<WorldMapBodySkeleton />}>
        <WorldMapBody data={data} />
      </Suspense>
    </div>
  );
}

/** "BUILDER PATH": the path shown, from the data. */
async function Eyebrow({ data }: { data: Promise<MapData> }) {
  const { page } = await data;
  return <p className="page-eyebrow">{WORLD_MAP_TEXT.eyebrow(TRACK_TEXT[page.map.track].label)}</p>;
}

/** The track switch, the map with its bar and key, and the path list. */
async function WorldMapBody({ data }: { data: Promise<MapData> }) {
  const {
    trackParam,
    page: { viewer, map, heroName },
  } = await data;
  // Keep ?track= on the links only when the page got one (as the old redirect did).
  const view = worldView(map, undefined, trackParam ? map.track : undefined);
  const tag = heroName ? WORLD_MAP_TEXT.youAreHere : WORLD_MAP_TEXT.startHere;
  const here = view.realms.find((r) => r.current);

  return (
    <>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <TrackSwitch current={map.track} hrefFor={worldMapHref} />
        {viewer === 'signed-out' && <SignInNote />}
      </div>

      <div className="flex flex-col gap-2">
        <WorldMap view={view} heroName={heroName} tag={tag} />
        <div className="world-map-bar">
          {here && (
            <p className="world-map-here">
              <span className="world-map-here-tag">{tag}</span>
              {WORLD_MAP_TEXT.here(realmNumber(here.id), here.name)}
            </p>
          )}
          <p id={WORLD_MAP_HINT_ID} className="world-map-hint">
            {WORLD_MAP_TEXT.hint}
          </p>
          <ZoomControls boxId={WORLD_MAP_BOX_ID} />
        </div>
        <WorldMapLegend tag={tag} />
      </div>

      <section aria-labelledby={PATH_HEADING_ID} className="flex flex-col gap-3">
        <h2 id={PATH_HEADING_ID} className="page-eyebrow">
          {viewer === 'ready' ? WORLD_MAP_TEXT.pathHeading : WORLD_MAP_TEXT.pathHeadingVisitor}
        </h2>
        <PathList realms={view.realms} currentTag={tag} labelledBy={PATH_HEADING_ID} />
      </section>
    </>
  );
}
