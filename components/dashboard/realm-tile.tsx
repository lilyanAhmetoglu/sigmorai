import Link from 'next/link';
import { XPBar } from '@/components/xp-bar';
import { REALM_STATUS_TEXT, realmHref } from '@/lib/constants';
import { realmAccent } from '@/lib/content/curriculum';
import type { RealmView } from '@/lib/types';
import { RealmScene } from '@/components/realms/realm-scene';

type Props = { realm: RealmView };

/**
 * A compact realm on the dashboard (design: isDash → enrolled): scene, name,
 * progress bar labelled with the state. The whole tile is the link.
 * Styles: realms.css.
 */
export function RealmTile({ realm }: Props) {
  const accent = realmAccent(realm.id);
  return (
    <Link href={realmHref(realm.slug)} className="realm-tile" data-accent={accent}>
      <RealmScene realm={realm.id} sizes="256px" className="realm-tile-scene" />
      <span className="realm-tile-body">
        <span className="realm-tile-name">{realm.name}</span>
        <XPBar
          label={REALM_STATUS_TEXT[realm.status].label}
          value={realm.cleared}
          max={realm.chapters.length}
          segments={realm.chapters.length}
          accent={accent}
        />
      </span>
    </Link>
  );
}
