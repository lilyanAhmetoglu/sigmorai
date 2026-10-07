import type { Metadata } from 'next';
import { WORLD_MAP_BOX_ID, WORLD_MAP_HINT_ID, WorldMap } from '@/components/map/world-map';
import { ZoomControls } from '@/components/map/zoom-controls';
import { PathList } from '@/components/realms/path-list';
import { SignInNote } from '@/components/realms/sign-in-note';
import { TrackSwitch } from '@/components/realms/track-switch';
import { MAP_HREF, TRACK_PARAM, TRACK_TEXT, WORLD_MAP_TEXT, worldMapHref } from '@/lib/constants';
import { getRealmsPage } from '@/lib/data/realms';
import { worldView } from '@/lib/grading/world-map';

const PATH_HEADING_ID = 'your-path';

// Relative URLs resolve against metadataBase (app/layout.tsx).
export const metadata: Metadata = {
  title: WORLD_MAP_TEXT.metaTitle,
  description: WORLD_MAP_TEXT.description,
  alternates: { canonical: MAP_HREF },
};

/**
 * The world map (docs/plans/world-map-design-plan.md): every realm of one
 * path as a land on one top-down map, the trail between them and the hero on
 * the realm holding the next step. Each land links to its level map
 * (/map/<slug>). Public: a visitor sees the default path with no progress
 * and "START HERE". `?track=` picks the path, like the realm pages.
 * In a route group so this loading.tsx never wraps /map/<slug>, whose layout
 * must 404 a bad slug before anything streams.
 * Not built yet: the Higgsfield art (PR 3); the world is a token placeholder.
 */
export default async function WorldMapPage({ searchParams }: PageProps<'/map'>) {
  const query = await searchParams;
  const { viewer, map, heroName } = await getRealmsPage(query[TRACK_PARAM]);
  // Keep ?track= on the links only when the page got one (as the old redirect did).
  const view = worldView(map, undefined, query[TRACK_PARAM] ? map.track : undefined);
  const tag = heroName ? WORLD_MAP_TEXT.youAreHere : WORLD_MAP_TEXT.startHere;

  return (
    <div className="max-w-app mx-auto flex w-full flex-col gap-6 px-4 py-6">
      <header className="flex flex-col gap-2">
        <p className="page-eyebrow">{WORLD_MAP_TEXT.eyebrow(TRACK_TEXT[map.track].label)}</p>
        <h1 className="page-title">{WORLD_MAP_TEXT.title}</h1>
        <p className="page-intro">{WORLD_MAP_TEXT.intro}</p>
      </header>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <TrackSwitch current={map.track} hrefFor={worldMapHref} />
        {viewer === 'signed-out' && <SignInNote />}
      </div>

      <div className="flex flex-col gap-2">
        <WorldMap view={view} heroName={heroName} tag={tag} />
        <div className="world-map-bar">
          <p id={WORLD_MAP_HINT_ID} className="world-map-hint">
            {WORLD_MAP_TEXT.hint}
          </p>
          <ZoomControls boxId={WORLD_MAP_BOX_ID} />
        </div>
      </div>

      <section aria-labelledby={PATH_HEADING_ID} className="flex flex-col gap-3">
        <h2 id={PATH_HEADING_ID} className="page-eyebrow">
          {viewer === 'ready' ? WORLD_MAP_TEXT.pathHeading : WORLD_MAP_TEXT.pathHeadingVisitor}
        </h2>
        <PathList realms={view.realms} currentTag={tag} labelledBy={PATH_HEADING_ID} />
      </section>
    </div>
  );
}
