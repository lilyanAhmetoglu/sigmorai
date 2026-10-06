import type { Metadata } from 'next';
import { RealmCard } from '@/components/realms/realm-card';
import { SignInNote } from '@/components/realms/sign-in-note';
import { TrackSwitch } from '@/components/realms/track-switch';
import { REALMS_HREF, REALMS_TEXT, realmsHref, TRACK_PARAM, TRACK_TEXT } from '@/lib/constants';
import { getRealmsPage } from '@/lib/data/realms';

// Relative URLs resolve against metadataBase (app/layout.tsx).
export const metadata: Metadata = {
  title: `${REALMS_TEXT.title} · Sigmorai`,
  description: REALMS_TEXT.description,
  alternates: { canonical: REALMS_HREF },
};

/**
 * The realms catalog of one track (Sigmorai App.dc.html → isRealms). Public:
 * a visitor sees the map with no progress (curriculum spec). State is
 * computed on the server; the track comes from `?track=`, else the player's
 * own track, else the beginner path.
 * Not built yet: the tier filter row, realm scene art, and the Math Tower and
 * Frontier entries (the tower has its own page, /math; the Frontier comes later).
 */
export default async function RealmsPage({ searchParams }: PageProps<'/realms'>) {
  const params = await searchParams;
  const { viewer, map } = await getRealmsPage(params[TRACK_PARAM]);

  return (
    <div className="max-w-app mx-auto flex w-full flex-col gap-6 px-4 py-6">
      <header className="flex flex-col gap-2">
        <p className="page-eyebrow">{REALMS_TEXT.eyebrow}</p>
        <h1 className="page-title">{REALMS_TEXT.heading(TRACK_TEXT[map.track].label)}</h1>
        <p className="page-intro">{REALMS_TEXT.intro}</p>
      </header>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <TrackSwitch current={map.track} hrefFor={realmsHref} />
        {viewer === 'signed-out' && <SignInNote />}
      </div>
      <ul className="card-grid">
        {map.realms.map((realm) => (
          <li key={realm.id}>
            <RealmCard realm={realm} track={map.track} />
          </li>
        ))}
      </ul>
    </div>
  );
}
