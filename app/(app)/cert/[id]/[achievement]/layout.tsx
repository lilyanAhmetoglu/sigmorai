import { notFound } from 'next/navigation';
import { getCertificate } from '@/lib/data/certificates';

/**
 * Looks the certificate up before loading.tsx starts streaming, so a bad id,
 * an unknown hero and a realm not cleared all get a real 404 status (a
 * notFound() inside the streamed page can only send 200). The not-found UI
 * is app/(app)/not-found.tsx. getCertificate is cached per request, so the
 * page reuses this read.
 */
export default async function CertLayout({
  children,
  params,
}: LayoutProps<'/cert/[id]/[achievement]'>) {
  const { id, achievement } = await params;
  if (!(await getCertificate(id, achievement))) notFound();
  return children;
}
