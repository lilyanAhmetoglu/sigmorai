import { redirect } from 'next/navigation';
import { mapHref, REALMS, TRACK_PARAM } from '@/lib/constants';
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
  const realm = REALMS[map.next?.realm ?? 0];
  redirect(mapHref(realm.slug, query[TRACK_PARAM] ? map.track : undefined));
}
