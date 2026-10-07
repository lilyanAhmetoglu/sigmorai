import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { HeroForm } from '@/components/onboarding/hero-form';
import { Panel } from '@/components/panel';
import {
  AFTER_ONBOARDING_HREF,
  AUTH_ROUTES,
  CLERK_REDIRECT_PARAM,
  ONBOARDING_TEXT,
  PATH_PARAM,
  TRACKS,
  audienceFor,
  onboardingHref,
} from '@/lib/constants';
import { loadTrackOutline } from '@/lib/content/load';
import { getHudState } from '@/lib/data/hud';
import type { Track, TrackIntro } from '@/lib/types';
import { parsePathParam } from '@/lib/utils';

export const metadata: Metadata = { title: `${ONBOARDING_TEXT.title} · Sigmorai` };

/** Who each path is for and what its realm 0 teaches, from the track outlines. */
async function trackIntros(): Promise<Record<Track, TrackIntro>> {
  const intros = await Promise.all(
    TRACKS.map(async (track): Promise<[Track, TrackIntro]> => {
      const outline = await loadTrackOutline(track);
      return [track, { audience: audienceFor(track).title, firstTopic: outline.realms[0].topic }];
    }),
  );
  return Object.fromEntries(intros) as Record<Track, TrackIntro>;
}

/**
 * Onboarding: the track picker (Sigmorai App.dc.html → auth screen, "NEW HERO"
 * part). Only for a signed-in player with no users row; everyone else moves on.
 * getHudState is cached per request, so the HUD and this page share one query.
 * `?path=<track>` (from a landing card) preselects a track; anything else is ignored.
 * Signed out, it goes to sign-in with this URL as `redirect_url`, so the track survives.
 */
export default async function OnboardingPage({ searchParams }: PageProps<'/onboarding'>) {
  const [state, query] = await Promise.all([getHudState(), searchParams]);
  const track = parsePathParam(query[PATH_PARAM]);
  // Signed out (e.g. a shared /onboarding?path=x link): sign in, then back here with the track.
  if (state.status === 'signed-out') {
    redirect(
      `${AUTH_ROUTES.signIn}?${CLERK_REDIRECT_PARAM}=${encodeURIComponent(onboardingHref(track))}`,
    );
  }
  if (state.status === 'ready') redirect(AFTER_ONBOARDING_HREF);
  const intros = await trackIntros();

  return (
    <div className="max-w-reading mx-auto flex w-full flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-h1 m-0 leading-tight">{ONBOARDING_TEXT.title}</h1>
        <p className="text-body leading-body text-text-2 m-0">{ONBOARDING_TEXT.intro}</p>
      </div>
      <Panel title={ONBOARDING_TEXT.panel} className="pt-8">
        <HeroForm initialTrack={track} intros={intros} />
      </Panel>
    </div>
  );
}
