import type { ComponentProps, ReactNode } from 'react';
import type { ButtonSize, ButtonVariant } from '@/lib/types';
import { cn } from '@/lib/utils';

type Props = ComponentProps<'button'> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Stretch to the container width. */
  full?: boolean;
  icon?: ReactNode;
};

/** Beveled pixel button for every action. Presses 2px, never scales. Styles: pixel-button.css. */
export function PixelButton({
  variant = 'primary',
  size = 'md',
  full,
  icon,
  className,
  children,
  type = 'button',
  ...rest
}: Props) {
  return (
    <button
      type={type}
      className={cn('pixel-button', className)}
      data-variant={variant}
      data-size={size}
      data-full={full || undefined}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
