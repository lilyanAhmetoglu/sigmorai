import Link from 'next/link';
import type { ComponentProps } from 'react';
import { LEVEL_GLYPHS, LEVEL_STATUS_TEXT } from '@/lib/constants';
import type { Accent, LevelStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { LockGlyph } from './lock-glyph';

type BaseProps = {
  /** Number shown on open and current tiles. */
  index: number | string;
  /** Visible name under the tile and the start of the accessible name. */
  label: string;
  status?: LevelStatus;
  /** Tile colour, usually the realm (e.g. "realm-2"). */
  accent?: Accent;
  /** Realm finale: bigger tile. */
  boss?: boolean;
};

type ButtonProps = BaseProps & ComponentProps<'button'> & { href?: undefined };

/** With `href` it renders a next/link, so a Server Component map can navigate without a handler. */
type LinkProps = BaseProps & Omit<ComponentProps<typeof Link>, 'href'> & { href: string };

type Props = ButtonProps | LinkProps;

/**
 * A stop on a realm's level map (/map/<slug>). Locked stays focusable (aria-disabled) so the
 * lock is announced, and its clicks are ignored. A locked node is never a
 * link, even with `href`. Styles: level-node.css.
 */
export function LevelNode({
  index,
  label,
  status = 'locked',
  accent = 'accent',
  boss,
  className,
  ...rest
}: Props) {
  const locked = status === 'locked';
  const shared = {
    className: cn('level-node', className),
    'data-status': status,
    'data-accent': accent,
    'data-boss': boss || undefined,
    'aria-current': status === 'current' ? ('step' as const) : undefined,
  };
  const content = (
    <>
      <span className="level-node-tile" aria-hidden="true">
        {locked ? <LockGlyph /> : (LEVEL_GLYPHS[status] ?? index)}
      </span>
      <span className="level-node-label">{label}</span>
      <span className="sr-only">, {LEVEL_STATUS_TEXT[status]}</span>
    </>
  );

  if (rest.href !== undefined) {
    if (locked) {
      // Same look as the button path; link-only props are dropped on purpose.
      return (
        <button type="button" {...shared} aria-disabled>
          {content}
        </button>
      );
    }
    return (
      <Link {...shared} {...rest}>
        {content}
      </Link>
    );
  }

  const { type = 'button', onClick, ...buttonRest } = rest;
  return (
    <button
      type={type}
      {...shared}
      aria-disabled={locked || undefined}
      onClick={locked ? undefined : onClick}
      {...buttonRest}
    >
      {content}
    </button>
  );
}
