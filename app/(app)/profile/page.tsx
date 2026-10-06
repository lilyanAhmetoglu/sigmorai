import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Panel } from '@/components/panel';
import { PixelAvatar } from '@/components/pixel-avatar';
import { DataPanel } from '@/components/profile/data-panel';
import { NamePanel } from '@/components/profile/name-panel';
import { PathPanel } from '@/components/profile/path-panel';
import { StatTiles } from '@/components/stat-tiles';
import { XPBar } from '@/components/xp-bar';
import {
  ONBOARDING_HREF,
  PROFILE_TEXT,
  AUTH_ROUTES,
  TRACK_ACCENTS,
  TRACK_TEXT,
} from '@/lib/constants';
import { getHudState } from '@/lib/data/hud';

export const metadata: Metadata = { title: `${PROFILE_TEXT.title} · Sigmorai` };

/**
 * The player's profile (Sigmorai App.dc.html → profile screen): sprite, hero
 * name, track, level and XP. Reads the same cached query as the HUD.
 * Then "Hero name" (rename; the sprite follows the name), "Your path"
 * (switch path) and "Your data":
 * download and delete (GDPR).
 * Not built yet: photo upload (sprite only for now) and realm progress.
 */
export default async function ProfilePage() {
  const state = await getHudState();
  if (state.status === 'signed-out') redirect(AUTH_ROUTES.signIn);
  if (state.status === 'onboarding') redirect(ONBOARDING_HREF);

  const { heroName, track, xp: totalXp, level, into, span } = state.stats;

  return (
    <div className="max-w-app mx-auto flex w-full flex-col gap-6 px-4 py-6">
      <h1 className="sr-only">{PROFILE_TEXT.title}</h1>
      <Panel title={PROFILE_TEXT.panel} className="flex flex-wrap items-center gap-7 pt-8">
        <PixelAvatar seed={heroName} size="lg" level={level} accent={TRACK_ACCENTS[track]} />
        <span className="sr-only">
          {PROFILE_TEXT.avatarLabel} {heroName}
        </span>
        <div className="flex min-w-0 flex-[1_1_15rem] flex-col gap-4">
          <div className="flex flex-col gap-1">
            <p className="font-display text-h2 m-0 leading-tight break-words">{heroName}</p>
            <p
              className="font-hud text-hud tracking-hud m-0 text-(--tint)"
              data-accent={TRACK_ACCENTS[track]}
            >
              {TRACK_TEXT[track].label} {PROFILE_TEXT.pathSuffix}
            </p>
          </div>
          <XPBar label={`LV ${level} → ${level + 1}`} value={into} max={span} segments={20} />
          {totalXp === 0 && (
            <p className="text-small leading-body text-text-2 m-0">{PROFILE_TEXT.noXp}</p>
          )}
        </div>
      </Panel>

      <StatTiles stats={state.stats} />

      <NamePanel current={heroName} />

      <PathPanel current={track} />

      <DataPanel />
    </div>
  );
}
