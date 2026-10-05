import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { HeroForm } from '@/components/onboarding/hero-form';
import { Panel } from '@/components/panel';
import { AFTER_ONBOARDING_HREF, ONBOARDING_TEXT, SIGN_IN_HREF } from '@/lib/constants';
import { getHudState } from '@/lib/data/hud';

export const metadata: Metadata = { title: `${ONBOARDING_TEXT.title} · Sigmorai` };

/**
 * Onboarding: the track picker (Sigmorai App.dc.html → auth screen, "NEW HERO"
 * part). Only for a signed-in player with no users row; everyone else moves on.
 * getHudState is cached per request, so the HUD and this page share one query.
 */
export default async function OnboardingPage() {
  const state = await getHudState();
  if (state.status === 'signed-out') redirect(SIGN_IN_HREF);
  if (state.status === 'ready') redirect(AFTER_ONBOARDING_HREF);

  return (
    <div className="max-w-reading mx-auto flex w-full flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-h1 m-0 leading-tight">{ONBOARDING_TEXT.title}</h1>
        <p className="text-body leading-body text-text-2 m-0">{ONBOARDING_TEXT.intro}</p>
      </div>
      <Panel title={ONBOARDING_TEXT.panel} className="pt-8">
        <HeroForm />
      </Panel>
    </div>
  );
}
