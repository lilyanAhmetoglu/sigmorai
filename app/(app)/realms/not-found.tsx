import { RouteNotFound } from '@/components/route-not-found';
import { NOT_FOUND_TEXT, REALMS_HREF, REALMS_TEXT } from '@/lib/constants';

/** A bad realm slug: say so plainly and link back to the catalog. */
export default function RealmNotFound() {
  return (
    <RouteNotFound
      title={NOT_FOUND_TEXT.title}
      message={REALMS_TEXT.notFound}
      back={{ href: REALMS_HREF, label: REALMS_TEXT.back, icon: REALMS_TEXT.backIcon }}
    />
  );
}
