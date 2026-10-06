import { notFound } from 'next/navigation';
import { RealmSlugSchema } from '@/lib/types';

/**
 * Same guard as the realm page (realms/[realm]/layout.tsx): check the slug
 * before loading.tsx streams, so an unknown realm gets a real 404 status.
 * The not-found UI is ../not-found.tsx.
 */
export default async function MapRealmLayout({ children, params }: LayoutProps<'/map/[realm]'>) {
  const { realm } = await params;
  if (!RealmSlugSchema.safeParse(realm).success) notFound();
  return children;
}
