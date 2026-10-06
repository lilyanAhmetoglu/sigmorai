import Image from 'next/image';
import { LEVEL_ART_LAYERS } from '@/lib/constants';
import { realmArt } from '@/lib/content/curriculum';
import type { RealmId } from '@/lib/types';
import { cn } from '@/lib/utils';

/** A realm's art (by its id), or any other scene's art base path (the Math Tower: MATH_ART). */
type Art = { realm: RealmId; art?: never } | { art: string; realm?: never };

type Props = Art & {
  /**
   * next/image `sizes`. Kept for layout hints only: the art is 1× (one art px per
   * source px), so it is served unoptimized; a resize would blur the pixels.
   */
  sizes: string;
  /** The page hero: load first. Thumbnails stay lazy. */
  preload?: boolean;
  className?: string;
};

/**
 * A realm's (or the Math Tower's) level art: the four parallax layers stacked, static. Decoration
 * only (aria-hidden, empty alt); the realm name next to it carries the
 * meaning. The parent sets the box size. Styles: realms.css.
 */
export function RealmScene({ realm, art, sizes, preload = false, className }: Props) {
  const base = art ?? realmArt(realm!);
  return (
    <div className={cn('realm-scene', className)} aria-hidden="true">
      {LEVEL_ART_LAYERS.map((layer) => (
        <Image
          key={layer}
          src={`${base}/${layer}.png`}
          alt=""
          fill
          sizes={sizes}
          unoptimized
          preload={preload}
          loading={preload ? undefined : 'lazy'}
          className="realm-scene-layer pixel"
          data-layer={layer}
        />
      ))}
    </div>
  );
}
