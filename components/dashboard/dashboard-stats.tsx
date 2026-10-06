import { Panel } from '@/components/panel';
import { DASHBOARD_TEXT } from '@/lib/constants';
import type { TowerSummary } from '@/lib/types';

type Props = {
  streak: number;
  levelsCleared: number;
  tower: Pick<TowerSummary, 'cleared' | 'live'>;
};

/**
 * The dashboard STATS panel (design: isDash aside), 2 per row. Only stats we
 * have data for: XP and level are in the HudBar already; first-try pass comes
 * with its feature. MATH FLOORS is cleared live floors / live floors.
 * Styles: realms.css.
 */
export function DashboardStats({ streak, levelsCleared, tower }: Props) {
  const stats = [
    { label: DASHBOARD_TEXT.streak, value: streak.toLocaleString('en'), tone: 'streak' },
    {
      label: DASHBOARD_TEXT.levelsCleared,
      value: levelsCleared.toLocaleString('en'),
      tone: 'cleared',
    },
    {
      label: DASHBOARD_TEXT.mathFloors,
      value: DASHBOARD_TEXT.mathFloorsValue(tower.cleared, tower.live),
      tone: 'math',
    },
  ];
  return (
    <Panel title={DASHBOARD_TEXT.stats} className="pt-8">
      <dl className="dash-stats">
        {stats.map((stat) => (
          <div key={stat.label} className="dash-stat">
            <dt className="dash-stat-label">{stat.label}</dt>
            <dd className="dash-stat-value" data-tone={stat.tone}>
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>
    </Panel>
  );
}
