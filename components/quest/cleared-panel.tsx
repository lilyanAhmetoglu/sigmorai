import { QUEST_TEXT } from '@/lib/constants';

type Props = {
  xp: number;
  /** Defaults to the case line, "LEVEL CLEARED · +150 XP". A lesson passes its own. */
  title?: string;
  /** Null hides the line (the lesson panel says it in its live note instead). */
  body?: string | null;
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
}: Props) {
  return (
    <section className="quest-cleared">
      <h2 className="quest-cleared-title">{title}</h2>
      {body && <p className="quest-cleared-body">{body}</p>}
    </section>
  );
}
