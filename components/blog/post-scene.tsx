import Image from 'next/image';
import { cn } from '@/lib/utils';

type Props = {
  /** The post's own cover (public path). */
  cover: string;
  sizes: string;
  preload?: boolean;
  className?: string;
};

/**
 * A post's scene: its own cover image, cropped to fill the box the parent
 * sets. Decoration only (aria-hidden, empty alt): the title and the realm name
 * next to it carry the meaning. Styles: blog.css.
 */
export function PostScene({ cover, sizes, preload, className }: Props) {
  return (
    <div className={cn('realm-scene', className)} aria-hidden="true">
      <Image
        src={cover}
        alt=""
        fill
        sizes={sizes}
        preload={preload}
        loading={preload ? undefined : 'lazy'}
        className="post-cover"
      />
    </div>
  );
}
