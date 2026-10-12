import { RouteNotFound } from '@/components/route-not-found';
import { MAP_HREF, NOT_FOUND_TEXT, REALMS_TEXT, WORLD_MAP_TEXT } from '@/lib/constants';

/** A bad realm slug: say so plainly and link back to the world map (it lists every realm). */
export default function RealmNotFound() {
  return (
    <RouteNotFound
      title={NOT_FOUND_TEXT.title}
      message={REALMS_TEXT.notFound}
      back={{ href: MAP_HREF, label: WORLD_MAP_TEXT.back, icon: WORLD_MAP_TEXT.backIcon }}
    />
  );
}
