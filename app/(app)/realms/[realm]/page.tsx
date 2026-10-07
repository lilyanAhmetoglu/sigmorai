import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DialogBox } from '@/components/dialog-box';
import { Panel } from '@/components/panel';
import { PixelButton } from '@/components/pixel-button';
import { ChapterList } from '@/components/realms/chapter-list';
import { RealmActionLabel } from '@/components/realms/realm-action-label';
import { RealmScene } from '@/components/realms/realm-scene';
import { SignInNote } from '@/components/realms/sign-in-note';
import { ShareButtons } from '@/components/share-buttons';
import { StatusBadge } from '@/components/realms/status-badge';
import { TrackSwitch } from '@/components/realms/track-switch';
import {
  MAP_TEXT,
  mapHref,
  questHref,
  REALM_STATUS_TEXT,
  realmHref,
  REALMS_TEXT,
  realmsHref,
  SHARE_TEXT,
  SITE_NAME,
  TRACK_PARAM,
} from '@/lib/constants';
import { realmAccent, realmNumber } from '@/lib/content/curriculum';
import { getRealmMeta, getRealmPage } from '@/lib/data/realms';
import { socialMetadata } from '@/lib/og/metadata';

const CHAPTERS_ID = 'realm-chapters';

// dynamicParams + generateStaticParams live in layout.tsx, so the share image route gets them too.

/**
 * Unique title, description and canonical per realm; noindex until one of its
 * chapters is live (curriculum spec → SEO). Relative URLs resolve against
 * metadataBase (app/layout.tsx).
 */
export async function generateMetadata({
  params,
}: PageProps<'/realms/[realm]'>): Promise<Metadata> {
  const { realm: slug } = await params;
  const meta = await getRealmMeta(slug);
  if (!meta) return {};
  const title = `${meta.name} · ${SITE_NAME}`;
  return {
    title,
    description: meta.description,
    alternates: { canonical: realmHref(slug) },
    ...socialMetadata({ title, description: meta.description, url: realmHref(slug) }),
    robots: meta.indexable ? undefined : { index: false },
  };
}

/**
 * One realm (Sigmorai App.dc.html → isDetail): scene hero, its chapters and
 * boss with lesson / case / quick-check steps and their state, linking to the
 * quest page for what can be played. Public; a tier-locked realm still shows
 * its chapter titles but no step opens.
 * Not built yet: the "Built from" sources (they come with the lessons, SIG-11).
 */
export default async function RealmPage({ params, searchParams }: PageProps<'/realms/[realm]'>) {
  const [{ realm: slug }, query] = await Promise.all([params, searchParams]);
  const page = await getRealmPage(slug, query[TRACK_PARAM]);
  if (!page) notFound();

  const { viewer, realm, track, next } = page;
  const locked = realm.status === 'tier-locked';
  const nothingLive = realm.chapters.every((c) => c.status === 'soon');

  return (
    <div
      className="max-w-app mx-auto flex w-full flex-col gap-6 px-4 py-6"
      data-accent={realmAccent(realm.id)}
    >
      <Link href={realmsHref(track)} className="realm-back">
        <span aria-hidden="true">{REALMS_TEXT.backIcon}</span>
        {REALMS_TEXT.back}
      </Link>

      <header className="realm-hero">
        <RealmScene realm={realm.id} sizes="(min-width: 768px) 768px, 100vw" preload />
        <div className="realm-hero-copy">
          <p className="realm-tag">{REALMS_TEXT.tag(realmNumber(realm.id), realm.tier)}</p>
          <h1 className="page-title">{realm.name}</h1>
          <p className="realm-hero-topic">{realm.topic}</p>
          <StatusBadge text={REALM_STATUS_TEXT[realm.status]} />
          {locked && <p className="realm-hero-topic">{REALMS_TEXT.tierLocked}</p>}
          <div className="flex flex-wrap gap-3">
            {next && (
              <PixelButton href={questHref(next.step.exerciseId)}>
                <RealmActionLabel status={realm.status} name={realm.name} />
              </PixelButton>
            )}
            <PixelButton href={mapHref(realm.slug, track)} variant="secondary">
              {MAP_TEXT.viewOnMap}
            </PixelButton>
          </div>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <TrackSwitch current={track} hrefFor={(t) => realmHref(realm.slug, t)} />
        {viewer === 'signed-out' && <SignInNote />}
      </div>

      <div className="flex flex-wrap items-start gap-6">
        <section
          aria-labelledby={CHAPTERS_ID}
          className="flex min-w-0 flex-[2_1_32rem] flex-col gap-3"
        >
          <h2 id={CHAPTERS_ID} className="page-eyebrow">
            {REALMS_TEXT.chapters}
          </h2>
          {nothingLive && (
            <Panel tone="sunken">
              <p className="text-body leading-body m-0">{REALMS_TEXT.nothingLive}</p>
            </Panel>
          )}
          <ChapterList chapters={realm.chapters} nextId={next?.step.exerciseId} />
        </section>
        <aside className="flex min-w-0 flex-[1_1_16rem] flex-col gap-4">
          <DialogBox speaker={realm.npc}>{realm.lore}</DialogBox>
          <ShareButtons
            target={{
              url: realmHref(realm.slug, track),
              text: SHARE_TEXT.realm(realm.name, realm.topic),
            }}
          />
        </aside>
      </div>
    </div>
  );
}
