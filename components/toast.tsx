import type { ComponentProps } from 'react';
import { TOAST_DISMISS_TEXT } from '@/lib/constants';
import type { Accent } from '@/lib/types';
import { cn } from '@/lib/utils';

type Props = Omit<ComponentProps<'div'>, 'title'> & {
  /** Stripe and title colour: xp, success, info or danger. */
  accent?: Accent;
  title: string;
  /** Shows a dismiss button. The toast host owns the open state and the timer. */
  onDismiss?: () => void;
};

/**
 * Short HUD notice: XP gained, level unlocked, errors. Presentational only: a
 * client toast host decides when it shows, where, and for how long.
 * No live-region role here: a role on a freshly mounted node is often not read.
 * The future toast host mounts one persistent role="status" aria-live="polite"
 * region and one persistent role="alert" region (for danger), and puts toasts
 * inside them. Styles: toast.css.
 */
export function Toast({ accent = 'info', title, onDismiss, className, children, ...rest }: Props) {
  return (
    <div className={cn('toast', className)} data-accent={accent} {...rest}>
      <div className="toast-body">
        <span className="toast-title">{title}</span>
        {children && <span className="toast-text">{children}</span>}
      </div>
      {onDismiss && (
        <button
          type="button"
          className="toast-dismiss"
          aria-label={TOAST_DISMISS_TEXT}
          onClick={onDismiss}
        >
          <span aria-hidden="true">×</span>
        </button>
      )}
    </div>
  );
}
