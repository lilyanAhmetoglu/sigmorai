import { Badge } from '@/components/badge';
import { PixelButton } from '@/components/pixel-button';
import { XPBar } from '@/components/xp-bar';
import { HUD_TEXT, ONBOARDING_HREF, TRACK_ACCENTS } from '@/lib/constants';
import type { HudState, HudStats } from '@/lib/types';
import { AccountButton } from './auth-controls';
import { SignedOutActions } from './signed-out-actions';

type Props = { state: HudState };

/**
 * The header's right side: Sign in + Start free for a visitor; hero, level
 * XP, streak and the account button for a player. Presentational: the
 * server (HudSlot) or the client (PublicHud) passes the state.
 * No HP here: HP is per case and lives in the quest panel (quest-actions
 * spec). `data-state` sets the layout (hud-bar.css): a visitor's two buttons
 * stay on the logo row; a player's stats wrap to their own row below md.
 */
export function HudBar({ state }: Props) {
  if (state.status === 'signed-out') {
    return (
      <div className="hud-bar" data-state={state.status}>
        <SignedOutActions />
      </div>
    );
  }
  const ready = state.status === 'ready';
  return (
    <div
      className="hud-bar"
      data-state={state.status}
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
      <AccountButton />
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
