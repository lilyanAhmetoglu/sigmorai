import { Panel } from '@/components/panel';
import { PixelButton } from '@/components/pixel-button';
import { DASHBOARD_TEXT, FRONTIER_HREF, questHref } from '@/lib/constants';
import type { FrontierSummary } from '@/lib/types';

type Props = { frontier: FrontierSummary };

const TEXT = DASHBOARD_TEXT.frontier;

/**
 * The dashboard FRONTIER panel (curriculum plan, amendment 2026-10-07
 * SIG-29), the same shape as the Math Tower panel: the newest chapter not
 * cleared yet and an Open button to its playable step. Else one sentence
 * (all cleared, or no chapter yet). Every state links to /frontier: the
 * header has no Frontier item. The sentence carries the state, never the
 * colour only. Plain product voice. Styles: realms.css.
 */
export function FrontierPanel({ frontier }: Props) {
  const { next } = frontier;
  return (
    <Panel title={TEXT.heading} titleAs="h2" accent="neutral" className="tower-panel pt-8">
      {next ? (
        <>
          <p className="frontier-panel-tag">{TEXT.date(next.date)}</p>
          <p className="tower-panel-text">{TEXT.open(next.title)}</p>
          <PixelButton href={questHref(next.step.exerciseId)} variant="primary" size="sm">
            {TEXT.openButton}
            <span className="sr-only">{TEXT.openTarget(next.title)}</span>
          </PixelButton>
        </>
      ) : (
        <p className="tower-panel-text">
          {frontier.state === 'cleared' ? TEXT.cleared : TEXT.empty}
        </p>
      )}
      <PixelButton href={FRONTIER_HREF} variant="secondary" size="sm">
        {TEXT.viewFrontier}
      </PixelButton>
    </Panel>
  );
}
