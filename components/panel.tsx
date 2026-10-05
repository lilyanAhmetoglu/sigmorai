import type { ComponentProps } from 'react';
import type { Accent, PanelPadding, PanelTone } from '@/lib/types';
import { cn } from '@/lib/utils';

type Props = ComponentProps<'section'> & {
  tone?: PanelTone;
  /** HUD tab on the top edge. */
  title?: string;
  /** Colour of the title tab. */
  accent?: Accent;
  padding?: PanelPadding;
};

/** Notched, hard-shadowed pixel window: the only container shape. Styles: panel.css. */
export function Panel({
  tone = 'default',
  title,
  accent = 'accent',
  padding = 'md',
  className,
  children,
  ...rest
}: Props) {
  return (
    <section className={cn('panel', className)} data-tone={tone} data-padding={padding} {...rest}>
      {title && (
        <div className="panel-title" data-accent={accent}>
          {title}
        </div>
      )}
      {children}
    </section>
  );
}
