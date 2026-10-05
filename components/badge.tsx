import type { ComponentProps } from 'react';
import type { Accent } from '@/lib/types';
import { cn } from '@/lib/utils';

type Props = ComponentProps<'span'> & {
  /** Chip colour. The design's "new" badge is accent="accent". */
  accent?: Accent;
};

/** Tiny HUD chip for status, rewards and source tags. The label carries the meaning. Styles: badge.css. */
export function Badge({ accent = 'neutral', className, ...rest }: Props) {
  return <span className={cn('badge', className)} data-accent={accent} {...rest} />;
}
