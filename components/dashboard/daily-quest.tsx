import { Panel } from '@/components/panel';
import { DASHBOARD_TEXT } from '@/lib/constants';

type Props = { streak: number; activeToday: boolean };

const TEXT = DASHBOARD_TEXT.dailyQuest;

/** Which note to show: today done, streak alive but nothing today, or no streak. */
function pickNote({ streak, activeToday }: Props) {
  if (activeToday) return { state: 'done', ...TEXT.done } as const;
  if (streak > 0) return { state: 'alive', ...TEXT.alive } as const;
  return { state: 'none', ...TEXT.none } as const;
}

/**
 * The dashboard DAILY QUEST note (design: isDash aside). Layout from the
 * design, words from DASHBOARD_TEXT: a broken streak is just "start a
 * streak", never a loss. The icon is decorative; the sentence says the state.
 * Styles: realms.css.
 */
export function DailyQuest(props: Props) {
  const note = pickNote(props);
  return (
    <Panel title={TEXT.heading} titleAs="h2" className="pt-8">
      <p className="daily-quest" data-state={note.state}>
        <span className="daily-quest-icon" aria-hidden="true">
          {note.icon}
        </span>
        {note.text(props.streak)}
      </p>
    </Panel>
  );
}
