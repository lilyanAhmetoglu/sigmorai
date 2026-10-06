import type { ComponentProps } from 'react';
import type { Accent, PanelPadding, PanelTone } from '@/lib/types';
import { cn } from '@/lib/utils';

type Props = ComponentProps<'section'> & {
  tone?: PanelTone;
  /** HUD tab on the top edge. */
  title?: string;
  /**
   * The tab's element. A div by default (a label). Use a heading when the tab
   * names a page section, so the heading order stays right. Looks the same.
   */
  titleAs?: 'div' | 'h2' | 'h3';
  /** Colour of the title tab. */
  accent?: Accent;
  padding?: PanelPadding;
};

/** Notched, hard-shadowed pixel window: the only container shape. Styles: panel.css. */
export function Panel({
  tone = 'default',
  title,
  titleAs: TitleTag = 'div',
  accent = 'accent',
  padding = 'md',
  className,
  children,
  ...rest
}: Props) {
  return (
    <section className={cn('panel', className)} data-tone={tone} data-padding={padding} {...rest}>
      {title && (
        <TitleTag className="panel-title" data-accent={accent}>
          {title}
        </TitleTag>
      )}
      {children}
    </section>
  );
}
