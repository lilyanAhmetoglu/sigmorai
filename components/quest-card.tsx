import type { ComponentProps } from 'react';
import { QUEST_ACTION_TEXT } from '@/lib/constants';
import type { Accent, QuestStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { PixelButton } from './pixel-button';

type Props = Omit<ComponentProps<'article'>, 'title'> & {
  /** e.g. "REALM 02 · TOOL FORGE". */
  realm?: string;
  title: string;
  summary?: string;
  xp?: number;
  minutes?: number;
  /** Source doc name, e.g. "Anthropic docs". */
  source?: string;
  status?: QuestStatus;
  /** Top bar, realm line and Start button colour, usually the realm. */
  accent?: Accent;
  /** Start/Replay goes to this page. Works from a Server Component. Wins over onStart. */
  href?: string;
  /** Start/Replay as a handler instead of a link. Needs a client parent. */
  onStart?: () => void;
  /** Title heading level, so it fits the page outline. */
  as?: 'h2' | 'h3' | 'h4';
};

/**
 * Quest tile for the quest log, recommendations and search. Locked shows a
 * disabled "Locked" button, so the state is in words, not only colour.
 * Styles: quest-card.css.
 */
export function QuestCard({
  realm,
  title,
  summary,
  xp,
  minutes,
  source,
  status = 'open',
  accent = 'accent',
  href,
  onStart,
  as: Heading = 'h3',
  className,
  ...rest
}: Props) {
  const locked = status === 'locked';

  return (
    <article
      className={cn('quest-card', className)}
      data-status={status}
      data-accent={accent}
      {...rest}
    >
      <div className="quest-card-body">
        {realm && <div className="quest-card-realm">{realm}</div>}
        <Heading className="quest-card-title">{title}</Heading>
        {summary && <p className="quest-card-summary">{summary}</p>}
        <div className="quest-card-meta">
          {xp != null && <span className="quest-card-xp">+{xp} XP</span>}
          {minutes != null && <span>{minutes} MIN</span>}
          {source && <span>SRC · {source}</span>}
        </div>
        {href && !locked && (
          <PixelButton
            href={href}
            size="sm"
            variant={status === 'done' ? 'secondary' : 'primary'}
            className="quest-card-action"
          >
            {QUEST_ACTION_TEXT[status]}
          </PixelButton>
        )}
        {((onStart && !href) || locked) && (
          <PixelButton
            size="sm"
            variant={status === 'done' ? 'secondary' : 'primary'}
            className="quest-card-action"
            disabled={locked}
            onClick={onStart}
          >
            {QUEST_ACTION_TEXT[status]}
          </PixelButton>
        )}
      </div>
    </article>
  );
}
