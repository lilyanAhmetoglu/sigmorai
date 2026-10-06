import { notFound } from 'next/navigation';
import { RealmSlugSchema } from '@/lib/types';

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
