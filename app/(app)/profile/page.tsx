import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Panel } from '@/components/panel';
import { PixelAvatar } from '@/components/pixel-avatar';
import { XPBar } from '@/components/xp-bar';
import {
  HUD_TEXT,
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
 * Not built yet: photo upload (sprite only for now) and realm progress.
 */
export default async function ProfilePage() {
  const state = await getHudState();
  if (state.status === 'signed-out') redirect(AUTH_ROUTES.signIn);
  if (state.status === 'onboarding') redirect(ONBOARDING_HREF);

  const { heroName, track, xp: totalXp, level, into, span, streak } = state.stats;
  const tiles = [
    { label: PROFILE_TEXT.totalXp, value: totalXp.toLocaleString('en') },
    { label: PROFILE_TEXT.level, value: String(level) },
    { label: HUD_TEXT.streak, value: String(streak), unit: HUD_TEXT.streakUnit },
  ];

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

      <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(100%,10rem),1fr))] gap-4 p-0">
        {tiles.map((tile) => (
          <li key={tile.label}>
            <Panel tone="default" padding="sm" className="flex flex-col gap-1.5">
              <span className="font-display text-h3 text-xp leading-tight">
                {tile.value}
                {tile.unit && <span className="sr-only"> {tile.unit}</span>}
              </span>
              <span className="font-hud text-micro tracking-hud text-text-3">{tile.label}</span>
            </Panel>
          </li>
        ))}
      </ul>
    </div>
  );
}
