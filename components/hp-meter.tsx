import type { ComponentProps } from 'react';
import { HUD_TEXT } from '@/lib/constants';
import type { HpValue } from '@/lib/types';
import { cn } from '@/lib/utils';

type Props = ComponentProps<'span'> & { hp: HpValue };

/**
 * `HP ■■□`: filled and empty squares plus "2 of 3" for screen readers, so HP
 * never relies on colour. Shown in the quest challenge panel (HP is per
 * challenge). Uses the HUD stat style (hud-bar.css).
 */
export function HpMeter({ hp, className, ...rest }: Props) {
  const max = Math.max(0, Math.floor(hp.max));
  const value = Math.min(max, Math.max(0, Math.floor(hp.value)));
  return (
    <span className={cn('hud-stat', className)} {...rest}>
      {HUD_TEXT.hp}{' '}
      <span aria-hidden="true">
        {'■'.repeat(value)}
        {'□'.repeat(max - value)}
      </span>
      <span className="sr-only">
        {value} of {max}
      </span>
    </span>
  );
}
