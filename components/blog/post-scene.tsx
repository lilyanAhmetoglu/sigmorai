import { RealmScene } from '@/components/realms/realm-scene';
import type { BlogPlace } from '@/lib/types';
import { cn } from '@/lib/utils';

type Props = {
  place: BlogPlace;
  sizes: string;
  preload?: boolean;
  className?: string;
};

/**
 * A post's scene: the art of its lesson's realm (RealmScene), or a plain
 * ink box when the area has none (the Frontier). Decoration only: the realm
 * name next to it carries the meaning. The parent sets the box size.
 */
export function PostScene({ place, sizes, preload, className }: Props) {
  if (!place.art) return <div className={cn('realm-scene', className)} aria-hidden="true" />;
  return <RealmScene art={place.art} sizes={sizes} preload={preload} className={className} />;
}
