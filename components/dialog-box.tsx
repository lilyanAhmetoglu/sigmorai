import type { ComponentProps, ReactNode } from 'react';
import { DIALOG_NEXT_TEXT } from '@/lib/constants';
import { cn } from '@/lib/utils';

type Props = ComponentProps<'section'> & {
  /** NPC name, normal case ("Archivist Vela"); CSS shows it in caps. Also names the region. */
  speaker?: string;
  /** Usually a decorative <PixelAvatar />. */
  portrait?: ReactNode;
  /** Shows the next button. Needs a client parent (it's a handler). */
  onNext?: () => void;
  nextLabel?: string;
};

/**
 * Parchment RPG dialog for story beats and NPC guides. The ONLY place NPC lore
 * and the story voice may appear; everything else is plain product voice.
 * Styles: dialog-box.css.
 */
export function DialogBox({
  speaker,
  portrait,
  onNext,
  nextLabel = DIALOG_NEXT_TEXT,
  className,
  children,
  ...rest
}: Props) {
  return (
    <section className={cn('dialog-box', className)} aria-label={speaker} {...rest}>
      {portrait && <div className="dialog-box-portrait">{portrait}</div>}
      <div className="dialog-box-body">
        {speaker && <div className="dialog-box-speaker">{speaker}</div>}
        <div className="dialog-box-text">{children}</div>
        {onNext && (
          <button type="button" className="dialog-box-next" onClick={onNext}>
            {nextLabel}
          </button>
        )}
      </div>
    </section>
  );
}
