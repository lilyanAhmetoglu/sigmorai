import Link from 'next/link';
import { Badge } from '@/components/badge';
import { MAP_TEXT, REALM_STATUS_TEXT } from '@/lib/constants';
import { realmAccent, realmNumber } from '@/lib/content/curriculum';
import type { PathRealm } from '@/lib/types';
import { PathRealmBadge } from './path-realm-badge';
import { StatusBadge } from './status-badge';

type Props = {
  realms: readonly PathRealm[];
  /** The tag on the current realm's row ("YOU ARE HERE" or "START HERE"). */
  currentTag: string;
  /** id of the heading that names the list. */
  labelledBy: string;
};

/**
 * "Your path": every realm of a path, in path order, as one link per row
 * (number, name and "CREATOR ONLY" on a specialist realm; then state as
 * icon + word, cleared / total, tag). The world map's text view, also with no JS; the
 * dashboard reuses it (per-path PR 2).
 * Rows are at least 44px. Styles: realms.css.
 */
export function PathList({ realms, currentTag, labelledBy }: Props) {
  return (
    <ol className="path-list" aria-labelledby={labelledBy}>
      {realms.map((realm) => (
        <li key={realm.id}>
          <Link
            href={realm.href}
            className="path-list-row"
            data-accent={realmAccent(realm.id)}
            data-status={realm.status}
            aria-current={realm.current ? 'location' : undefined}
          >
            <span className="path-list-number" aria-hidden="true">
              {realmNumber(realm.id)}
            </span>
            <span className="path-list-name">{realm.name}</span>
            <PathRealmBadge track={realm.track} />
            <span className="path-list-meta">
              <StatusBadge text={REALM_STATUS_TEXT[realm.status]} />
              <span className="path-list-count">
                {MAP_TEXT.progress(realm.cleared, realm.total)}
              </span>
              {realm.current && <Badge accent="xp">{currentTag}</Badge>}
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
