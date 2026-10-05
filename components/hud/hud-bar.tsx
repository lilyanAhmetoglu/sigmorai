import { Badge } from '@/components/badge';
import { XPBar } from '@/components/xp-bar';
import { HUD_TEXT, TRACK_ACCENTS } from '@/lib/constants';
import type { HpValue, HudState, HudStats } from '@/lib/types';
import { AuthControls } from './auth-controls';

type Props = {
  state: HudState;
  /** Only a challenge page knows HP (it is per challenge). Leave it out elsewhere. */
  hp?: HpValue;
};

/** Top HUD: hero, level XP, HP, streak and the account controls. Presentational. Styles: hud-bar.css. */
export function HudBar({ state, hp }: Props) {
  const ready = state.status === 'ready';
  return (
    <div
      className="hud-bar"
      role={ready ? 'group' : undefined}
      aria-label={ready ? HUD_TEXT.label : undefined}
    >
      {state.status === 'ready' && <StatsRow stats={state.stats} hp={hp} />}
      {state.status === 'onboarding' && <Badge accent="neutral">{HUD_TEXT.notSetUp}</Badge>}
      <AuthControls />
    </div>
  );
}

function StatsRow({ stats, hp }: { stats: HudStats; hp?: HpValue }) {
  return (
    <>
      {/* No PixelAvatar here: Clerk's UserButton is the one "me" picture (it owns
          sign-out). The hero avatar comes back as the link to /profile. */}
      <div className="hud-hero-text">
        <span className="hud-hero-name" title={stats.heroName}>
          {stats.heroName}
        </span>
        <Badge accent={TRACK_ACCENTS[stats.track]}>{stats.track}</Badge>
      </div>
      <XPBar
        className="hud-xp"
        label={`LV ${stats.level}`}
        value={stats.into}
        max={stats.span}
        segments={10}
      />
      <HpStat hp={hp} />
      <span className="hud-stat">
        {HUD_TEXT.streak} {stats.streak}
        <span className="sr-only"> {HUD_TEXT.streakUnit}</span>
      </span>
    </>
  );
}

/** Filled and empty squares, so HP never relies on colour. No value = an empty slot. */
function HpStat({ hp }: { hp?: HpValue }) {
  if (!hp) {
    return (
      <span className="hud-stat" data-empty>
        {HUD_TEXT.hp} <span aria-hidden="true">{HUD_TEXT.hpEmpty}</span>
        <span className="sr-only">{HUD_TEXT.hpEmptyHint}</span>
      </span>
    );
  }
  const max = Math.max(0, Math.floor(hp.max));
  const value = Math.min(max, Math.max(0, Math.floor(hp.value)));
  return (
    <span className="hud-stat">
      {HUD_TEXT.hp}{' '}
      <span aria-hidden="true">
        {'■'.repeat(value)}
        {'□'.repeat(max - value)}
      </span>
      <span className="sr-only">
        {value} of {max}
      </span>
    </span>
  );
}
