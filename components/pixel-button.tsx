import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import type { ButtonSize, ButtonVariant } from '@/lib/types';
import { cn } from '@/lib/utils';

type BaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Stretch to the container width. */
  full?: boolean;
  icon?: ReactNode;
};

type ButtonProps = BaseProps & ComponentProps<'button'> & { href?: undefined };

/** With `href` it renders a next/link, so a Server Component can navigate without a handler. */
type LinkProps = BaseProps & Omit<ComponentProps<typeof Link>, 'href'> & { href: string };

type Props = ButtonProps | LinkProps;

/** Beveled pixel button for every action. Presses 2px, never scales. Styles: pixel-button.css. */
export function PixelButton({
  variant = 'primary',
  size = 'md',
  full,
  icon,
  className,
  children,
  ...rest
}: Props) {
  const shared = {
    className: cn('pixel-button', className),
    'data-variant': variant,
    'data-size': size,
    'data-full': full || undefined,
  };

  if (rest.href !== undefined) {
    return (
      <Link {...shared} {...rest}>
        {icon}
        {children}
      </Link>
    );
  }

  const { type = 'button', ...buttonRest } = rest;
  return (
    <button type={type} {...shared} {...buttonRest}>
      {icon}
      {children}
    </button>
  );
}
