import { LANDING_TEXT, OG_CONTENT_TYPE, OG_SIZE, SHARE_IMAGE, SITE_NAME } from '@/lib/constants';
import { HeroArt, loadHeroLayers, loadLogo, OG_COLORS, ogImage } from '@/lib/og/og-card';

/**
 * The share image for the public pages (Open Graph; Twitter falls back to it).
 * It lives in (marketing), not app/, because a file here beats the landing
 * page's own `openGraph` object; at the root that object would drop it.
 * The hero art layers are drawn at their native 1920×640 (1×, so no resampling
 * and no blur), centred and bottom-aligned in the 1200×630 frame. No request
 * data, so Next renders it once at build time. Blog posts have their own
 * (blog/[slug]/opengraph-image.tsx). Fonts, colours and art: lib/og/og-card.tsx.
 */

export const alt = SHARE_IMAGE.alt;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  const [layers, logo] = await Promise.all([loadHeroLayers(), loadLogo()]);

  return ogImage(
    <div style={{ display: 'flex', position: 'relative', width: '100%', height: '100%' }}>
      <HeroArt layers={layers} />
      <div
        style={{
          position: 'absolute',
          left: 64,
          top: 64,
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          width: 800,
          padding: 40,
          background: OG_COLORS.surface,
          border: `4px solid ${OG_COLORS.outline}`,
          boxShadow: `8px 8px 0 0 ${OG_COLORS.outline}`,
          color: OG_COLORS.text,
          fontFamily: 'Pixelify Sans',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <img src={logo} alt="" width={64} height={64} />
          <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1 }}>
            {SITE_NAME.toUpperCase()}
          </div>
        </div>
        <div style={{ fontSize: 48, fontWeight: 500, lineHeight: 1.1, color: OG_COLORS.accent }}>
          {LANDING_TEXT.title}
        </div>
      </div>
    </div>,
  );
}
