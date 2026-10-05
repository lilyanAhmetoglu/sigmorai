import { QUEST_TEXT } from '@/lib/constants';

/**
 * "LEVEL CLEARED · +150 XP" after a first-time pass. Product voice only: the
 * design's lore line is not used outside a DialogBox. The XP shown is the
 * server's `awarded`, never a client constant. Continue sits in the Submit slot.
 */
export function ClearedPanel({ xp }: { xp: number }) {
  return (
    <section className="quest-cleared">
      <h2 className="quest-cleared-title">{QUEST_TEXT.cleared(xp)}</h2>
      <p className="quest-cleared-body">{QUEST_TEXT.clearedBody}</p>
    </section>
  );
}
