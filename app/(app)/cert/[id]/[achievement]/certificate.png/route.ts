import { certImageFilename } from '@/lib/constants';
import { certificateImage } from '@/lib/og/certificate-image';

/**
 * "Download PNG": the certificate's share image (same renderer as
 * opengraph-image.tsx) at a stable URL, sent as a file. The share image's own
 * URL carries a build hash, so the page can't link to it. Public, no session,
 * never cached.
 */
export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: RouteContext<'/cert/[id]/[achievement]/certificate.png'>,
) {
  const { id, achievement } = await params;
  const res = await certificateImage(id, achievement);
  // ImageResponse sends public max-age=0; a deleted account's PNG must never be kept anywhere.
  res.headers.set('Cache-Control', 'no-store');
  if (res.ok) {
    res.headers.set(
      'Content-Disposition',
      `attachment; filename="${certImageFilename(achievement)}"`,
    );
  }
  return res;
}
