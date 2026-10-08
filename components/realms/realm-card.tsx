import { PixelButton } from '@/components/pixel-button';
import { XPBar } from '@/components/xp-bar';
import {
  REALM_STATUS_TEXT,
  REALMS_TEXT,
  realmHref,
  TIER_TEXT,
  TRACK_ACCENTS,
} from '@/lib/constants';
import { realmAccent, realmNumber } from '@/lib/content/curriculum';
import { realmChapterCount } from '@/lib/grading/track-map';
import type { RealmView, Track } from '@/lib/types';
import { PathRealmBadge } from './path-realm-badge';
import { RealmActionLabel } from './realm-action-label';
import { RealmScene } from './realm-scene';
import { StatusBadge } from './status-badge';

type Props = {
  realm: RealmView;
  /** Kept in the realm link, so the realm page shows the same track. */
  track?: Track;
};

/**
 * A realm in the catalog (design: isRealms card): scene, realm number and
 * tier, name, "CREATOR ONLY" on a specialist realm, topic, meta, state,
 * button. A specialist realm's bar uses its path colour: its realm accent is
 * still `neutral` (no token yet), which reads as disabled. A tier-locked realm says "locked" once (the note) and still links
 * to its page: learners may read its chapter list (curriculum spec), only the
 * steps stay shut. Styles: realms.css.
 */
export function RealmCard({ realm, track }: Props) {
  const locked = realm.status === 'tier-locked';

  return (
    <article className="realm-card" data-accent={realmAccent(realm.id)} data-status={realm.status}>
      <RealmScene realm={realm.id} sizes="256px" className="realm-card-scene" />
      <div className="realm-card-body">
        <p className="realm-card-head">
          <span className="realm-card-tag">{REALMS_TEXT.number(realmNumber(realm.id))}</span>
          <span>{TIER_TEXT[realm.tier]}</span>
        </p>
        <h2 className="realm-card-name">{realm.name}</h2>
        <PathRealmBadge track={realm.track} />
        <p className="realm-card-topic">{realm.topic}</p>
        <p className="realm-card-meta">{REALMS_TEXT.meta(realmChapterCount(realm))}</p>
        {locked ? (
          <p className="realm-card-note">{REALMS_TEXT.lockedNote}</p>
        ) : (
          <>
            <StatusBadge text={REALM_STATUS_TEXT[realm.status]} />
            <XPBar
              label={REALMS_TEXT.clearedLabel}
              value={realm.cleared}
              max={realm.chapters.length}
              segments={realm.chapters.length}
              accent={realm.track ? TRACK_ACCENTS[realm.track] : realmAccent(realm.id)}
            />
          </>
        )}
        <PixelButton
          href={realmHref(realm.slug, track)}
          size="sm"
          variant={locked ? 'secondary' : 'primary'}
          className="realm-card-action"
        >
          <RealmActionLabel status={realm.status} name={realm.name} />
        </PixelButton>
      </div>
    </article>
  );
}
