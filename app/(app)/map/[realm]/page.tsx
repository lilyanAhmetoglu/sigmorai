import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DialogBox } from '@/components/dialog-box';
import { LevelMap } from '@/components/map/level-map';
import { PixelButton } from '@/components/pixel-button';
import { RealmActionLabel } from '@/components/realms/realm-action-label';
import { SignInNote } from '@/components/realms/sign-in-note';
import { TrackSwitch } from '@/components/realms/track-switch';
import {
  MAP_TEXT,
  mapHref,
  questHref,
  realmHref,
  REALMS,
  REALMS_TEXT,
  realmsHref,
  TRACK_PARAM,
  WORLD_MAP_TEXT,
  worldMapHref,
} from '@/lib/constants';
import { realmAccent, realmNumber } from '@/lib/content/curriculum';
import { getRealmMeta, getRealmPage } from '@/lib/data/realms';

/** Every realm slug is known up front; layout.tsx gives a bad slug its 404. */
export const dynamicParams = false;
export function generateStaticParams() {
  return REALMS.map((realm) => ({ realm: realm.slug }));
}

/**
 * The map repeats the realm page's content, so its canonical is the realm
 * page (no noindex: that would send search engines a mixed signal).
 * Relative URLs resolve against metadataBase.
 */
export async function generateMetadata({ params }: PageProps<'/map/[realm]'>): Promise<Metadata> {
  const { realm: slug } = await params;
  const meta = await getRealmMeta(slug);
  if (!meta) return {};
  return {
    title: MAP_TEXT.title(meta.name),
    description: MAP_TEXT.description(meta.name),
    alternates: { canonical: realmHref(slug) },
  };
}

/**
 * One realm's level map (Sigmorai App.dc.html → isMap): header with the
 * previous / next realm (in the track's outline order), the track switch
 * (core realms only), the Start / Continue button, the
 * level strip and the realm's NPC. Public; a visitor sees no progress.
 * Not built yet (follow-up ticket): hero walk and Hallucinant ghosts, the
 * selected-level card, the NEW LEVEL banner, the ALL REALMS grid (/realms
 * has it) and the Math Tower map.
 */
export default async function MapRealmPage({ params, searchParams }: PageProps<'/map/[realm]'>) {
  const [{ realm: slug }, query] = await Promise.all([params, searchParams]);
  const page = await getRealmPage(slug, query[TRACK_PARAM]);
  if (!page) notFound();

  // prev / after follow the track's outline order (path-curriculum spec).
  const { viewer, realm, track, next, prev, after } = page;

  return (
    <div
      className="max-w-app mx-auto flex w-full flex-col gap-6 px-4 py-6"
      data-accent={realmAccent(realm.id)}
    >
      <Link href={worldMapHref(query[TRACK_PARAM] ? track : undefined)} className="realm-back">
        <span aria-hidden="true">{WORLD_MAP_TEXT.backIcon}</span>
        {WORLD_MAP_TEXT.back}
      </Link>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-2">
          <p className="realm-tag">{REALMS_TEXT.tag(realmNumber(realm.id), realm.tier)}</p>
          <h1 className="page-title">{realm.name}</h1>
          <p className="text-body leading-body text-text-2 m-0 text-pretty">{realm.topic}</p>
        </div>
        <div className="flex items-center gap-3">
          <p className="map-progress">{MAP_TEXT.progress(realm.cleared, realm.chapters.length)}</p>
          <nav aria-label={MAP_TEXT.realmNav} className="map-realm-nav">
            {prev ? (
              <PixelButton
                href={mapHref(prev.slug, track)}
                variant="secondary"
                aria-label={MAP_TEXT.prevRealm(prev.name)}
              >
                <span aria-hidden="true">{MAP_TEXT.prevIcon}</span>
              </PixelButton>
            ) : (
              <span className="map-realm-slot" />
            )}
            {after ? (
              <PixelButton
                href={mapHref(after.slug, track)}
                variant="secondary"
                aria-label={MAP_TEXT.nextRealm(after.name)}
              >
                <span aria-hidden="true">{MAP_TEXT.nextIcon}</span>
              </PixelButton>
            ) : (
              <span className="map-realm-slot" />
            )}
          </nav>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        {/* A specialist realm is on one path only: no path switch. */}
        {realm.track === null && (
          <TrackSwitch current={track} hrefFor={(t) => mapHref(realm.slug, t)} />
        )}
        {next && (
          <PixelButton href={questHref(next.step.exerciseId)}>
            <RealmActionLabel status={realm.status} name={realm.name} />
          </PixelButton>
        )}
        {viewer === 'signed-out' && <SignInNote />}
      </div>
      {realm.status === 'tier-locked' && (
        <p className="text-body leading-body text-text-2 m-0">{REALMS_TEXT.tierLocked}</p>
      )}

      <div className="flex flex-col gap-2">
        <LevelMap realm={realm} nextId={next?.step.exerciseId} />
        <p className="map-hint">{MAP_TEXT.hint}</p>
      </div>

      <div className="flex flex-wrap items-start gap-6">
        <div className="min-w-0 flex-[2_1_32rem]">
          <DialogBox speaker={realm.npc}>{realm.lore}</DialogBox>
        </div>
        <div className="flex min-w-0 flex-[1_1_16rem] flex-wrap gap-3">
          <PixelButton href={realmsHref(track)} variant="secondary">
            {MAP_TEXT.allRealms}
          </PixelButton>
          <PixelButton href={realmHref(realm.slug, track)} variant="secondary">
            {MAP_TEXT.chapterList}
          </PixelButton>
        </div>
      </div>
    </div>
  );
}
