import { ShareButtons } from '@/components/share-buttons';
import { QUEST_TEXT, SHARE_TEXT } from '@/lib/constants';
import type { ShareTarget } from '@/lib/types';

type Props = {
  xp: number;
  /** Defaults to the case line, "LEVEL CLEARED · +150 XP". A lesson passes its own. */
  title?: string;
  /** Null hides the line (the lesson panel says it in its live note instead). */
  body?: string | null;
  /** Share buttons for this clear (the realm or tower page and an "I cleared" line). */
  share?: ShareTarget;
};

/**
 * "LEVEL CLEARED · +150 XP" after a first-time pass. Product voice only: the
 * design's lore line is not used outside a DialogBox. The XP shown is the
 * server's `awarded`, never a client constant. Continue sits in the Submit slot.
 */
export function ClearedPanel({
  xp,
  title = QUEST_TEXT.cleared(xp),
  body = QUEST_TEXT.clearedBody,
  share,
}: Props) {
  return (
    <section className="quest-cleared">
      <h2 className="quest-cleared-title">{title}</h2>
      {body && <p className="quest-cleared-body">{body}</p>}
      {share && <ShareButtons target={share} heading={SHARE_TEXT.clearedHeading} as="h3" />}
    </section>
  );
}
