/* eslint-disable @next/next/no-img-element -- Satori (ImageResponse) draws plain <img>; next/image can't run there. */
import 'server-only';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import type { ReactElement, ReactNode } from 'react';
import sharp from 'sharp';
import {
  LEVEL_ART_LAYERS,
  OG_HERO_ART as HERO_ART,
  OG_LEVEL_ART as LEVEL_ART,
  OG_LEVEL_ART_SCALE as LEVEL_ART_SCALE,
  OG_SIZE,
  SHARE_IMAGE,
  SITE_NAME,
} from '@/lib/constants';

/**
 * Shared parts of every share image (opengraph-image.tsx files): the
 * Pixelify Sans fonts, the logo, the level-art layers and the title panel.
 * Satori can't read CSS variables, so colours are SHARE_IMAGE.colors (token
 * copies, checked by landing-copy.test.ts). Pixel art is scaled with
 * `imageRendering: pixelated` so it stays sharp.
 */

/** Token colour copies for Satori (SHARE_IMAGE.colors; landing-copy.test.ts checks them). */
export const OG_COLORS = SHARE_IMAGE.colors;
const colors = OG_COLORS;

const PUBLIC_DIR = join(process.cwd(), 'public');
const FONT_DIR = join(process.cwd(), 'node_modules', '@fontsource', 'pixelify-sans', 'files');

export const toDataUri = (data: string, mime: string) => `data:${mime};base64,${data}`;

/** A file under public/ (a site path like `/levels/realm-01/sky.png`) as a data URI. */
export async function publicDataUri(path: string, mime: string): Promise<string> {
  return toDataUri(await readFile(join(PUBLIC_DIR, path), 'base64'), mime);
}

/** The logo mark, as a data URI. */
export const loadLogo = () => publicDataUri('/logo/sigmorai-mark.svg', 'image/svg+xml');

/** The four parallax layers of a scene (`base` like `/levels/realm-01`), back to front. */
export const loadSceneLayers = (base: string) =>
  Promise.all(LEVEL_ART_LAYERS.map((layer) => publicDataUri(`${base}/${layer}.png`, 'image/png')));

/** The landing hero's four layers (public/art/hero-<layer>.png), back to front. Site image only. */
export const loadHeroLayers = () =>
  Promise.all(
    LEVEL_ART_LAYERS.map((layer) => publicDataUri(`/art/hero-${layer}.png`, 'image/png')),
  );

/**
 * A blog cover (a public .webp path) cropped to the card size, as a PNG data
 * URI: Satori can't decode WebP. Covers are painted art, not 1× pixel art, so
 * a resize is fine here.
 */
export async function loadCover(path: string): Promise<string> {
  const png = await sharp(join(PUBLIC_DIR, path))
    .resize(OG_SIZE.width, OG_SIZE.height, { fit: 'cover' })
    .png()
    .toBuffer();
  return toDataUri(png.toString('base64'), 'image/png');
}

/** Pixelify Sans 500 + 700 (the display font, design/tokens/typography.css). Satori needs woff, not woff2. */
async function loadFonts() {
  const [regular, bold] = await Promise.all([
    readFile(join(FONT_DIR, 'pixelify-sans-latin-500-normal.woff')),
    readFile(join(FONT_DIR, 'pixelify-sans-latin-700-normal.woff')),
  ]);
  return [
    { name: 'Pixelify Sans', data: regular, weight: 500 as const, style: 'normal' as const },
    { name: 'Pixelify Sans', data: bold, weight: 700 as const, style: 'normal' as const },
  ];
}

/** Render a 1200×630 share image with the brand fonts. */
export async function ogImage(element: ReactElement): Promise<ImageResponse> {
  return new ImageResponse(element, { ...OG_SIZE, fonts: await loadFonts() });
}

/** A level scene's layers at 3×, centred and bottom-aligned, sharp pixels. */
export function SceneArt({ layers }: { layers: string[] }) {
  const width = LEVEL_ART.width * LEVEL_ART_SCALE;
  const height = LEVEL_ART.height * LEVEL_ART_SCALE;
  return (
    <>
      {layers.map((src, i) => (
        <img
          key={LEVEL_ART_LAYERS[i]}
          src={src}
          alt=""
          width={width}
          height={height}
          style={{
            position: 'absolute',
            left: (OG_SIZE.width - width) / 2,
            top: OG_SIZE.height - height,
            imageRendering: 'pixelated',
          }}
        />
      ))}
    </>
  );
}

/** The hero layers at their native 1× (no resampling), centred and bottom-aligned. */
export function HeroArt({ layers }: { layers: string[] }) {
  return (
    <>
      {layers.map((src, i) => (
        <img
          key={LEVEL_ART_LAYERS[i]}
          src={src}
          alt=""
          width={HERO_ART.width}
          height={HERO_ART.height}
          style={{
            position: 'absolute',
            left: (OG_SIZE.width - HERO_ART.width) / 2,
            top: OG_SIZE.height - HERO_ART.height,
          }}
        />
      ))}
    </>
  );
}

/** A full-bleed image already at the card size (a blog cover from loadCover). */
export function CoverArt({ src }: { src: string }) {
  return (
    <img
      src={src}
      alt=""
      width={OG_SIZE.width}
      height={OG_SIZE.height}
      style={{ position: 'absolute', left: 0, top: 0 }}
    />
  );
}

type CardProps = {
  logo: string;
  /** The art behind the panel. Without it the card is a plain outline-colour field. */
  background?: ReactNode;
  /** Small accent line over the title ("REALM 01 · BEGINNER · STRATEGIST PATH"). */
  eyebrow: string;
  title: string;
  /** One plain line under the title (what you learn). */
  line?: string;
};

/**
 * The title panel used by every per-page share image: logo + site name, an
 * eyebrow, the title and one line, on the surface colour with the hard
 * outline and offset shadow of the site's panels.
 */
export function OgCard({ logo, background, eyebrow, title, line }: CardProps) {
  return (
    <div
      style={{
        display: 'flex',
        position: 'relative',
        width: '100%',
        height: '100%',
        background: colors.outline,
      }}
    >
      {background}
      <div
        style={{
          position: 'absolute',
          left: 56,
          top: 56,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          maxWidth: 820,
          padding: 36,
          background: colors.surface,
          border: `4px solid ${colors.outline}`,
          boxShadow: `8px 8px 0 0 ${colors.outline}`,
          color: colors.text,
          fontFamily: 'Pixelify Sans',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img src={logo} alt="" width={40} height={40} />
          <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1 }}>
            {SITE_NAME.toUpperCase()}
          </div>
        </div>
        <div style={{ fontSize: 26, fontWeight: 500, lineHeight: 1.2, color: colors.accent }}>
          {eyebrow}
        </div>
        <div style={{ fontSize: 60, fontWeight: 700, lineHeight: 1.1 }}>{title}</div>
        {line && <div style={{ fontSize: 30, fontWeight: 500, lineHeight: 1.3 }}>{line}</div>}
      </div>
    </div>
  );
}
