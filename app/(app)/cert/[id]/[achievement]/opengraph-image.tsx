import { CERT_TEXT, OG_CONTENT_TYPE, OG_SIZE } from '@/lib/constants';
import { certificateImage } from '@/lib/og/certificate-image';

/**
 * A certificate's share image (lib/og/certificate-image.tsx; certificate.png
 * serves the same PNG as a download). Per player, so never prerendered or
 * cached. A route handler skips the layout's 404 check; the renderer checks
 * again. The logo and fonts are traced for it in next.config.ts.
 */

export const dynamic = 'force-dynamic';
export const alt = CERT_TEXT.imageAlt;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

type Params = { id: string; achievement: string };

export default async function Image({ params }: { params: Promise<Params> }) {
  const { id, achievement } = await params;
  return certificateImage(id, achievement);
}
