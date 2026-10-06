import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { LANDING_TEXT, LEVEL_ART_LAYERS, SHARE_IMAGE, SITE_NAME } from '@/lib/constants';

/**
 * The share image for the public pages (Open Graph; Twitter falls back to it).
 * It lives in (marketing), not app/, because a file here beats the landing
 * page's own `openGraph` object; at the root that object would drop it.
 * The hero art layers are drawn at their native 1920×640 (1×, so no resampling
 * and no blur), centred and bottom-aligned in the 1200×630 frame. No request
 * data, so Next renders it once at build time.
 */

export const alt = SHARE_IMAGE.alt;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** Native size of public/art/hero-*.png. */
const ART = { width: 1920, height: 640 };
const { colors } = SHARE_IMAGE;

// Paths are spelled out under fixed folders so the build traces only these
// files, not the whole project.
const toDataUri = (data: string, mime: string) => `data:${mime};base64,${data}`;

export default async function Image() {
  const [layers, logo, regular, bold] = await Promise.all([
    Promise.all(
      LEVEL_ART_LAYERS.map((layer) =>
        readFile(join(process.cwd(), 'public', 'art', `hero-${layer}.png`), 'base64'),
      ),
    ),
    readFile(join(process.cwd(), 'public', 'logo', 'sigmorai-mark.svg'), 'base64'),
    // Pixelify Sans is the display font (design/tokens/typography.css). Satori needs woff/ttf, not woff2.
    readFile(
      join(
        process.cwd(),
        'node_modules',
        '@fontsource',
        'pixelify-sans',
        'files',
        'pixelify-sans-latin-500-normal.woff',
      ),
    ),
    readFile(
      join(
        process.cwd(),
        'node_modules',
        '@fontsource',
        'pixelify-sans',
        'files',
        'pixelify-sans-latin-700-normal.woff',
      ),
    ),
  ]);

  return new ImageResponse(
    <div style={{ display: 'flex', position: 'relative', width: '100%', height: '100%' }}>
      {layers.map((src, i) => (
        <img
          key={LEVEL_ART_LAYERS[i]}
          src={toDataUri(src, 'image/png')}
          alt=""
          width={ART.width}
          height={ART.height}
          style={{
            position: 'absolute',
            left: (size.width - ART.width) / 2,
            top: size.height - ART.height,
          }}
        />
      ))}
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
          background: colors.surface,
          border: `4px solid ${colors.outline}`,
          boxShadow: `8px 8px 0 0 ${colors.outline}`,
          color: colors.text,
          fontFamily: 'Pixelify Sans',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <img src={toDataUri(logo, 'image/svg+xml')} alt="" width={64} height={64} />
          <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1 }}>
            {SITE_NAME.toUpperCase()}
          </div>
        </div>
        <div style={{ fontSize: 48, fontWeight: 500, lineHeight: 1.1, color: colors.accent }}>
          {LANDING_TEXT.title}
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: 'Pixelify Sans', data: regular, weight: 500, style: 'normal' },
        { name: 'Pixelify Sans', data: bold, weight: 700, style: 'normal' },
      ],
    },
  );
}
