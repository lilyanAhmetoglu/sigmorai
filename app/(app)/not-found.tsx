import type { Metadata } from 'next';
import { RouteNotFound } from '@/components/route-not-found';
import { MAP_HREF, NOT_FOUND_META, NOT_FOUND_TEXT, WORLD_MAP_TEXT } from '@/lib/constants';

export const metadata: Metadata = {
  title: { absolute: NOT_FOUND_META.title },
};

/**
 * notFound() inside an (app) page (a bad quest id, for example) lands here,
 * inside the (app) layout, so the player keeps the header and HUD. Unknown
 * URLs still get the site-wide app/not-found.tsx. The world map is public, so
 * the link works signed in or out.
 */
export default function AppNotFound() {
  return (
    <RouteNotFound
      title={NOT_FOUND_TEXT.title}
      message={NOT_FOUND_TEXT.appBody}
      back={{ href: MAP_HREF, label: WORLD_MAP_TEXT.back, icon: WORLD_MAP_TEXT.backIcon }}
    />
  );
}
