import { Badge } from '@/components/badge';
import { PixelButton } from '@/components/pixel-button';
import { XPBar } from '@/components/xp-bar';
import { HUD_TEXT, ONBOARDING_HREF, TRACK_ACCENTS } from '@/lib/constants';
import type { HudState, HudStats } from '@/lib/types';
import { AuthControls } from './auth-controls';

type Props = { state: HudState };

/**
 * Top HUD: hero, level XP, streak and the account controls. Presentational.
 * No HP here: HP is per challenge and lives in the quest panel (quest-actions
 * spec). Styles: hud-bar.css.
 */
export function HudBar({ state }: Props) {
  const ready = state.status === 'ready';
  return (
    <div
      className="hud-bar"
      role={ready ? 'group' : undefined}
      aria-label={ready ? HUD_TEXT.label : undefined}
    >
      {state.status === 'ready' && <StatsRow stats={state.stats} />}
      {/* A real link, not just a badge: it catches every way in that skipped the
          sign-up redirect (hosted Clerk pages, an abandoned first visit). */}
      {state.status === 'onboarding' && (
        <PixelButton href={ONBOARDING_HREF} variant="xp" size="sm">
          {HUD_TEXT.setUp}
        </PixelButton>
      )}
      <AuthControls />
    </div>
  );
}

function StatsRow({ stats }: { stats: HudStats }) {
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
      <span className="hud-stat">
        {HUD_TEXT.streak} {stats.streak}
        <span className="sr-only"> {HUD_TEXT.streakUnit}</span>
      </span>
    </>
  );
}
