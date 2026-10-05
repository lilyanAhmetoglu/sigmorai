import { AVATAR_GRID, AVATAR_PALETTE_COUNT } from '@/lib/constants';
import { avatarSprite } from '@/lib/sprite/avatar';
import type { Accent, AvatarSize } from '@/lib/types';
import { cn } from '@/lib/utils';

type Props = {
  /** Draws a deterministic sprite when there is no photo (usually the username). */
  seed?: string;
  /** Uploaded photo, shown pixelated. */
  src?: string;
  size?: AvatarSize;
  level?: number;
  /** Frame colour. */
  accent?: Accent;
  className?: string;
};

/** Player portrait: photo or an 8×8 sprite from the seed. Decorative; show the name next to it. Styles: pixel-avatar.css. */
export function PixelAvatar({
  seed = 'player',
  src,
  size = 'md',
  level,
  accent = 'accent',
  className,
}: Props) {
  return (
    <div className={cn('pixel-avatar', className)} data-size={size} data-accent={accent}>
      {src ? (
        // A user upload from blob storage; next/image would need remotePatterns for one tiny pixelated image.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="pixel-avatar-photo" />
      ) : (
        <Sprite seed={seed} />
      )}
      {level != null && <span className="pixel-avatar-level">LV{level}</span>}
    </div>
  );
}

function Sprite({ seed }: { seed: string }) {
  const { palette, cells } = avatarSprite(seed, AVATAR_PALETTE_COUNT);
  return (
    <svg
      viewBox={`0 0 ${AVATAR_GRID} ${AVATAR_GRID}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
      className="pixel-avatar-sprite"
      data-palette={palette}
    >
      {cells.map(({ x, y, tone }) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" data-tone={tone} />
      ))}
    </svg>
  );
}
