import { redirect } from 'next/navigation';
import { mapHref, REALMS, realmRow, TRACK_PARAM } from '@/lib/constants';
import { getRealmsPage } from '@/lib/data/realms';

/**
 * /map has no page of its own: it sends the player to the realm holding their
 * next step, else the first realm. A visitor goes to the first realm. A valid
 * `?track=` is kept. No loading.tsx here, so this is a real 307, not a
 * streamed client redirect.
 */
export default async function MapPage({ searchParams }: PageProps<'/map'>) {
  const query = await searchParams;
  const { map } = await getRealmsPage(query[TRACK_PARAM]);
  // The next step's realm, else the first realm on this path's map.
  const realm = realmRow(map.next?.realm ?? map.realms[0]?.id ?? 0) ?? REALMS[0];
  redirect(mapHref(realm.slug, query[TRACK_PARAM] ? map.track : undefined));
}
