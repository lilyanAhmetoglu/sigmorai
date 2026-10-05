import { Panel } from '@/components/panel';
import { HUD_TEXT, PROFILE_TEXT } from '@/lib/constants';
import type { HudStats } from '@/lib/types';

type Props = { stats: Pick<HudStats, 'xp' | 'level' | 'streak'> };

/** Total XP, level and streak as tiles (profile). Reflows to one column. */
export function StatTiles({ stats }: Props) {
  const tiles = [
    { label: PROFILE_TEXT.totalXp, value: stats.xp.toLocaleString('en') },
    { label: PROFILE_TEXT.level, value: String(stats.level) },
    { label: HUD_TEXT.streak, value: String(stats.streak), unit: HUD_TEXT.streakUnit },
  ];
  return (
    <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(100%,10rem),1fr))] gap-4 p-0">
      {tiles.map((tile) => (
        <li key={tile.label}>
          <Panel tone="default" padding="sm" className="flex flex-col gap-1">
            <span className="font-display text-h3 text-xp leading-tight">
              {tile.value}
              {tile.unit && <span className="sr-only"> {tile.unit}</span>}
            </span>
            <span className="font-hud text-micro tracking-hud text-text-3">{tile.label}</span>
          </Panel>
        </li>
      ))}
    </ul>
  );
}
