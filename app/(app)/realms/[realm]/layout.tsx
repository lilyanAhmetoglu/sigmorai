import { notFound } from 'next/navigation';
import { REALMS } from '@/lib/constants';
import { RealmSlugSchema } from '@/lib/types';

/**
 * Every realm slug is known up front. Here, not in page.tsx, so the child
 * routes get them too: the share image (opengraph-image.tsx) is prerendered
 * once per realm. The page reads searchParams, so it still renders per request.
 */
export const dynamicParams = false;
export function generateStaticParams() {
  return REALMS.map((realm) => ({ realm: realm.slug }));
}

/**
 * Checks the slug before any loading.tsx starts streaming, so an unknown
 * realm gets a real 404 status (a notFound() inside the streamed page can only
 * send 200 + noindex). That is also why the catalog's loading.tsx lives in the
 * (catalog) group: at /realms level it would wrap this layout too.
 * The not-found UI is ../not-found.tsx (a layout's notFound() goes to the
 * parent segment's boundary).
 */
export default async function RealmLayout({ children, params }: LayoutProps<'/realms/[realm]'>) {
  const { realm } = await params;
  if (!RealmSlugSchema.safeParse(realm).success) notFound();
  return children;
}
