import { Panel } from '@/components/panel';
import { DASHBOARD_TEXT } from '@/lib/constants';

type Props = { streak: number; levelsCleared: number };

/**
 * The dashboard STATS panel (design: isDash aside), 2 per row. Only stats we
 * have data for: XP and level are in the HudBar already; Math floors and
 * first-try pass come with their features. Styles: realms.css.
 */
export function DashboardStats({ streak, levelsCleared }: Props) {
  const stats = [
    { label: DASHBOARD_TEXT.streak, value: streak, tone: 'streak' },
    { label: DASHBOARD_TEXT.levelsCleared, value: levelsCleared, tone: 'cleared' },
  ];
  return (
    <Panel title={DASHBOARD_TEXT.stats} className="pt-8">
      <dl className="dash-stats">
        {stats.map((stat) => (
          <div key={stat.label} className="dash-stat">
            <dt className="dash-stat-label">{stat.label}</dt>
            <dd className="dash-stat-value" data-tone={stat.tone}>
              {stat.value.toLocaleString('en')}
            </dd>
          </div>
        ))}
      </dl>
    </Panel>
  );
}
