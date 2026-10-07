import { Panel } from '@/components/panel';
import { PixelButton } from '@/components/pixel-button';
import { DASHBOARD_TEXT, FRONTIER_HREF, questHref } from '@/lib/constants';
import type { FrontierSummary } from '@/lib/types';

/** `null`: the Frontier read failed; the panel says so and the rest of the dashboard stays. */
type Props = { frontier: FrontierSummary | null };

const TEXT = DASHBOARD_TEXT.frontier;

/** The one sentence when no chapter is linked: read failed, all cleared, or none yet. */
function sentence(frontier: FrontierSummary | null): string {
  if (!frontier) return TEXT.error;
  return frontier.state === 'cleared' ? TEXT.cleared : TEXT.empty;
}

/**
 * The dashboard FRONTIER panel (curriculum plan, amendment 2026-10-07
 * SIG-29), the same shape as the Math Tower panel: the newest chapter not
 * cleared yet and an Open button to its playable step. Else one sentence
 * (all cleared, no chapter yet, or the read failed). Every state links to
 * /frontier: the header has no Frontier item. The sentence carries the
 * state, never the colour only. Plain product voice. Styles: realms.css.
 */
export function FrontierPanel({ frontier }: Props) {
  const next = frontier?.next;
  return (
    <Panel title={TEXT.heading} titleAs="h2" accent="neutral" className="tower-panel pt-8">
      {next ? (
        <>
          <p className="frontier-panel-tag">
            <time dateTime={next.date}>{TEXT.date(next.date)}</time>
          </p>
          <p className="tower-panel-text">{TEXT.open(next.title)}</p>
          <PixelButton href={questHref(next.step.exerciseId)} variant="secondary" size="sm">
            {TEXT.openButton}
            <span className="sr-only">{TEXT.openTarget(next.title)}</span>
          </PixelButton>
        </>
      ) : (
        <p className="tower-panel-text">{sentence(frontier)}</p>
      )}
      <PixelButton href={FRONTIER_HREF} variant="secondary" size="sm">
        {TEXT.viewFrontier}
      </PixelButton>
    </Panel>
  );
}
