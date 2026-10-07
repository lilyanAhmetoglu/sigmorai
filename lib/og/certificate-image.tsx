/* eslint-disable @next/next/no-img-element -- Satori (ImageResponse) draws plain <img>; next/image can't run there. */
import 'server-only';
import { CERT_TEXT, certificateId, OG_SIZE, SITE_NAME } from '@/lib/constants';
import { getCertificate } from '@/lib/data/certificates';
import type { CertificateView } from '@/lib/types';
import { dateLabel } from '@/lib/utils';
import { loadLogo, OG_COLORS as colors, ogImage } from './og-card';

/**
 * One certificate as a 1200×630 PNG: its share image and its download (one
 * renderer, two routes). Art-free: a framed certificate drawn in the token
 * colours (OG_COLORS), hard edges, no gradient, radius or blur. Per player,
 * so it is rendered on every request and never cached: a deleted account
 * must 404 at once. A miss of any kind is the same 404, like the page.
 *
 * Satori mis-measures maxWidth, so every text box has an explicit width and
 * long titles or hero names wrap inside it.
 */

/** Outer margin to the gold frame, the frame's thickness, and the gap to the thin inner rule. */
const FRAME = { inset: 20, border: 8, gap: 12, rule: 3 } as const;
/** The width every centred text box gets (the canvas minus the frames and padding). */
const TEXT_WIDTH = 960;

export function CertificateCard({ cert, logo }: { cert: CertificateView; logo: string }) {
  const { achievement, heroName, earnedOn, publicId } = cert;
  const center = {
    display: 'flex',
    width: TEXT_WIDTH,
    justifyContent: 'center',
    textAlign: 'center',
  } as const;
  return (
    <div
      style={{
        display: 'flex',
        width: OG_SIZE.width,
        height: OG_SIZE.height,
        padding: FRAME.inset,
        background: colors.outline,
        fontFamily: 'Pixelify Sans',
        color: colors.text,
      }}
    >
      {/* Gold frame, with a hard offset shadow like the site's panels. */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          padding: FRAME.gap,
          background: colors.surface,
          border: `${FRAME.border}px solid ${colors.accent}`,
        }}
      >
        {/* Thin inner rule: the second line of a certificate's double border. */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '28px 40px 22px',
            border: `${FRAME.rule}px solid ${colors.text}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <img src={logo} alt="" width={44} height={44} />
            <div style={{ fontSize: 34, fontWeight: 700, lineHeight: 1 }}>
              {SITE_NAME.toUpperCase()}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                ...center,
                fontSize: 28,
                fontWeight: 700,
                letterSpacing: 6,
                color: colors.accent,
              }}
            >
              {CERT_TEXT.eyebrow}
            </div>
            <div style={{ ...center, fontSize: 76, fontWeight: 700, lineHeight: 1.05 }}>
              {achievement.name}
            </div>
            <div style={{ ...center, fontSize: 26, fontWeight: 500, color: colors.accent }}>
              {achievement.pathLabel}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{ ...center, fontSize: 22, fontWeight: 500, letterSpacing: 4 }}>
              {CERT_TEXT.imageAwardedTo}
            </div>
            <div style={{ ...center, fontSize: 48, fontWeight: 700, lineHeight: 1.1 }}>
              {heroName}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              width: TEXT_WIDTH,
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              gap: 24,
              fontSize: 18,
              fontWeight: 500,
            }}
          >
            <div style={{ display: 'flex' }}>{CERT_TEXT.imageEarned(dateLabel(earnedOn))}</div>
            <div style={{ display: 'flex', textAlign: 'right' }}>
              {CERT_TEXT.imageId(certificateId(publicId, achievement.slug))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function certificateImage(id: string, achievement: string): Promise<Response> {
  const cert = await getCertificate(id, achievement);
  if (!cert) return new Response(null, { status: 404 });
  return ogImage(<CertificateCard cert={cert} logo={await loadLogo()} />);
}
