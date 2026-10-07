import {
  DEFAULT_TRACK,
  OG_CONTENT_TYPE,
  OG_SIZE,
  OG_TEXT,
  REALMS,
  REALMS_TEXT,
  TRACK_TEXT,
} from '@/lib/constants';
import { realmArt, realmNumber } from '@/lib/content/curriculum';
import { loadTrackOutline } from '@/lib/content/load';
import { loadLogo, loadSceneLayers, OgCard, ogImage, SceneArt } from '@/lib/og/og-card';

/**
 * A realm's share image: its own level art behind the name, the path and
 * what it teaches. The canonical realm URL has no ?track=, so the card shows
 * the beginner path's topic, like the page's meta description (getRealmMeta).
 * One image per realm, prerendered at build time; crawlers need no session.
 * A route handler doesn't inherit its layout's params, so it re-exports them
 * (layout.tsx). That is also why the alt is one shared line: Next's
 * generateImageMetadata would replace this generateStaticParams with its own.
 */

export const dynamicParams = false;
export { generateStaticParams } from './layout';
export const alt = OG_TEXT.realmCardAlt;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

type Params = { realm: string };

const realmFor = (slug: string) => REALMS.find((r) => r.slug === slug);

async function cardText(slug: string) {
  const realm = realmFor(slug);
  if (!realm) return null;
  const outline = await loadTrackOutline(DEFAULT_TRACK);
  return { realm, topic: outline.realms[realm.id].topic };
}

export default async function Image({ params }: { params: Promise<Params> }) {
  const text = await cardText((await params).realm);
  if (!text) return new Response(null, { status: 404 });
  const { realm, topic } = text;
  const [layers, logo] = await Promise.all([loadSceneLayers(realmArt(realm.id)), loadLogo()]);
  return ogImage(
    <OgCard
      logo={logo}
      background={<SceneArt layers={layers} />}
      eyebrow={OG_TEXT.realmEyebrow(
        REALMS_TEXT.tag(realmNumber(realm.id), realm.tier),
        TRACK_TEXT[DEFAULT_TRACK].label,
      )}
      title={realm.name}
      line={topic}
    />,
  );
}
