import Image from 'next/image';
import { LEVEL_ART_LAYERS } from '@/lib/constants';
import { realmArt } from '@/lib/content/curriculum';
import { cn } from '@/lib/utils';

/** A realm's art (by its id), or any other scene's art base path (the Math Tower: MATH_ART). */
type Art = { realm: number; art?: never } | { art: string; realm?: never };

/** The layers a hero scene preloads: the ones in front, which cover most of it. */
const FRONT_LAYERS: ReadonlySet<string> = new Set(['mid', 'near']);

type Props = Art & {
  /**
   * next/image `sizes`. Kept for layout hints only: the art is 1× (one art px per
   * source px), so it is served unoptimized; a resize would blur the pixels.
   */
  sizes: string;
  /**
   * The page hero: load first. Only the front layers (mid, near) are
   * preloaded; sky and far are behind them and load normally. Thumbnails stay lazy.
   */
  preload?: boolean;
  className?: string;
};

/**
 * A realm's (or the Math Tower's) level art: the four parallax layers stacked, static. Decoration
 * only (aria-hidden, empty alt); the realm name next to it carries the
 * meaning. The parent sets the box size. Styles: realms.css.
 * A realm with no art yet (`scene: false`) is a flat dark surface fill
 * (surface-3), never another realm's art (path-curriculum spec).
 */
export function RealmScene({ realm, art, sizes, preload = false, className }: Props) {
  const base = art ?? realmArt(realm!);
  if (!base) {
    return <div className={cn('realm-scene', className)} data-flat="" aria-hidden="true" />;
  }
  return (
    <div className={cn('realm-scene', className)} aria-hidden="true">
      {LEVEL_ART_LAYERS.map((layer) => {
        const first = preload && FRONT_LAYERS.has(layer);
        return (
          <Image
            key={layer}
            src={`${base}/${layer}.png`}
            alt=""
            fill
            sizes={sizes}
            unoptimized
            preload={first}
            // A hero's back layers are not preloaded but still load at once (no lazy wait).
            loading={first ? undefined : preload ? 'eager' : 'lazy'}
            className="realm-scene-layer pixel"
            data-layer={layer}
          />
        );
      })}
    </div>
  );
}
