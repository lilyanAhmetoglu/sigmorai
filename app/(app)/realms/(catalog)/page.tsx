import type { Metadata } from 'next';
import { PixelButton } from '@/components/pixel-button';
import { RealmCard } from '@/components/realms/realm-card';
import { SignInNote } from '@/components/realms/sign-in-note';
import { TrackSwitch } from '@/components/realms/track-switch';
import {
  FRONTIER,
  FRONTIER_HREF,
  MATH_HREF,
  MATH_TOWER,
  REALMS_HREF,
  REALMS_TEXT,
  realmsHref,
  SIDE_REALMS_TEXT,
  TRACK_PARAM,
  TRACK_TEXT,
} from '@/lib/constants';
import { getRealmsPage } from '@/lib/data/realms';

const SIDE_REALMS_ID = 'side-realms';
const SIDE_REALM_LINKS = [
  { href: MATH_HREF, name: MATH_TOWER.name },
  { href: FRONTIER_HREF, name: FRONTIER.name },
] as const;

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
 * After the realms, a "Side realms" link row: the Math Tower (/math) and the
 * Frontier (/frontier), shared by every path.
 * Not built yet: the tier filter row and realm scene art.
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
      <section aria-labelledby={SIDE_REALMS_ID} className="side-realms">
        <h2 id={SIDE_REALMS_ID} className="page-eyebrow">
          {SIDE_REALMS_TEXT.heading}
        </h2>
        <ul className="side-realms-list">
          {SIDE_REALM_LINKS.map(({ href, name }) => (
            <li key={href}>
              <PixelButton
                href={href}
                variant="secondary"
                size="sm"
                icon={<span aria-hidden="true">{SIDE_REALMS_TEXT.icon}</span>}
              >
                {name}
              </PixelButton>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
