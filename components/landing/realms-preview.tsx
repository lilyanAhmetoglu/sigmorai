import Link from 'next/link';
import { PixelButton } from '@/components/pixel-button';
import { RealmScene } from '@/components/realms/realm-scene';
import { LANDING_TEXT, REALMS_HREF, REALMS_TEXT, realmHref, realmRow } from '@/lib/constants';
import { realmAccent, realmNumber } from '@/lib/content/curriculum';
import type { TrackOutline } from '@/lib/types';

type Props = {
  /**
   * The beginner path's outline: its realms in map order, one topic line each
   * (same text as the realm page meta).
   */
  outline: TrackOutline;
};

/**
 * "The map" (design: landing → POPULAR REALMS): every realm of the beginner
 * path as a small tile,
 * scene + number + tier + name + topic. The whole tile links to the realm
 * page (public, so visitors can read the chapter list). Not dashboard/RealmTile:
 * that one needs a RealmView with the player's progress. Styles: realms.css
 * (.realm-tile) + landing.css.
 */
export function RealmsPreview({ outline }: Props) {
  return (
    <section className="landing-section" aria-labelledby="realms-title">
      <div className="landing-section-head">
        <p className="landing-kicker">{LANDING_TEXT.realmsEyebrow}</p>
        <h2 id="realms-title" className="landing-h2">
          {LANDING_TEXT.realmsTitle}
        </h2>
        <p className="landing-intro">{LANDING_TEXT.realmsIntro}</p>
      </div>
      <ul className="landing-realms">
        {outline.realms.map(({ id, topic }) => {
          // The outline schema proved every id is a REALMS row.
          const realm = realmRow(id)!;
          return (
            <li key={realm.id}>
              <Link
                href={realmHref(realm.slug)}
                className="realm-tile"
                data-accent={realmAccent(realm.id)}
              >
                <RealmScene realm={realm.id} sizes="256px" className="realm-tile-scene" />
                <span className="realm-tile-body">
                  <span className="landing-realm-tag">
                    {REALMS_TEXT.tag(realmNumber(realm.id), realm.tier)}
                  </span>
                  <h3 className="realm-tile-name m-0">{realm.name}</h3>
                  <span className="landing-realm-topic">{topic}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="landing-cta">
        <PixelButton href={REALMS_HREF} variant="secondary">
          {LANDING_TEXT.realmsAll}
        </PixelButton>
      </div>
    </section>
  );
}
