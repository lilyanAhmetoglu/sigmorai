import { MATH_TEXT, OG_CONTENT_TYPE, OG_SIZE, OG_TEXT } from '@/lib/constants';
import { MATH_ART } from '@/lib/content/curriculum';
import { loadLogo, loadSceneLayers, OgCard, ogImage, SceneArt } from '@/lib/og/og-card';

/** The Math Tower's share image: its own level art behind the title. Static, no session. */

export const alt = OG_TEXT.mathAlt(MATH_TEXT.eyebrow);
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  const [layers, logo] = await Promise.all([loadSceneLayers(MATH_ART), loadLogo()]);
  return ogImage(
    <OgCard
      logo={logo}
      background={<SceneArt layers={layers} />}
      eyebrow={MATH_TEXT.eyebrow}
      title={MATH_TEXT.title}
      line={OG_TEXT.mathLine}
    />,
  );
}
