import { Panel } from '@/components/panel';
import { PixelButton } from '@/components/pixel-button';
import { DASHBOARD_TEXT, MATH_HREF, questHref } from '@/lib/constants';
import type { TowerSummary } from '@/lib/types';

type Props = { tower: TowerSummary };

const TEXT = DASHBOARD_TEXT.tower;

/**
 * The dashboard MATH TOWER panel (design: isDash aside): the player's next
 * open floor and a Climb button to its playable step. When nothing is open,
 * a sentence says why (all cleared, or the next floor is not built) and links
 * to /math. The sentence carries the state, never the colour only. Plain
 * product voice. Styles: realms.css.
 */
export function TowerPanel({ tower }: Props) {
  const { next } = tower;
  return (
    <Panel title={TEXT.heading} accent="math" data-accent="math" className="tower-panel pt-8">
      {next ? (
        <>
          <p className="tower-panel-tag">{TEXT.floor(next.floor, next.title)}</p>
          <p className="tower-panel-text">{TEXT.open(next.title)}</p>
          <PixelButton href={questHref(next.step.exerciseId)} size="sm">
            {TEXT.climb}
            <span className="sr-only">{TEXT.climbTarget(next.floor)}</span>
          </PixelButton>
        </>
      ) : (
        <>
          <p className="tower-panel-text">{tower.state === 'cleared' ? TEXT.cleared : TEXT.soon}</p>
          {tower.state === 'cleared' && <p className="tower-panel-hint">{TEXT.clearedHint}</p>}
          <PixelButton href={MATH_HREF} variant="secondary" size="sm">
            {TEXT.viewTower}
          </PixelButton>
        </>
      )}
    </Panel>
  );
}
