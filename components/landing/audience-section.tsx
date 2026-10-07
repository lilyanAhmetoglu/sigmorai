import { LandingCta } from '@/components/landing/landing-cta';
import { Panel } from '@/components/panel';
import { PixelButton } from '@/components/pixel-button';
import {
  AUDIENCES,
  AUTH_ROUTES,
  AUTH_TEXT,
  LANDING_TEXT,
  onboardingHref,
  signUpHref,
} from '@/lib/constants';

/**
 * "Who it is for": one Panel per audience (beginner, business, tech, media),
 * each with its own start button, then a closing Start free. A card's button
 * signs up into onboarding with its track chosen; signed in, it goes to
 * onboarding with that track (a player who already has a hero moves on to the
 * dashboard). Styles: landing.css.
 */
export function AudienceSection() {
  return (
    <section className="landing-section" aria-labelledby="audience-title">
      <div className="landing-section-head">
        <p className="landing-kicker">{LANDING_TEXT.audienceEyebrow}</p>
        <h2 id="audience-title" className="landing-h2">
          {LANDING_TEXT.audienceTitle}
        </h2>
        <p className="landing-intro">{LANDING_TEXT.audienceIntro}</p>
      </div>
      <ul className="landing-audiences">
        {AUDIENCES.map((audience) => (
          <li key={audience.id}>
            <Panel title={audience.label} accent={audience.accent} className="landing-audience">
              <h3 className="landing-h3">{audience.title}</h3>
              <p className="landing-audience-body">{audience.body}</p>
              <ul className="landing-points" data-accent={audience.accent}>
                {audience.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <p className="landing-for-who">{audience.forWho}</p>
              <div className="landing-audience-cta">
                <LandingCta size="md" signedInHref={onboardingHref(audience.track)}>
                  <PixelButton href={signUpHref(audience.track)}>{audience.cta}</PixelButton>
                </LandingCta>
              </div>
            </Panel>
          </li>
        ))}
      </ul>
      <div className="landing-cta">
        <PixelButton href={AUTH_ROUTES.signUp} size="lg">
          {AUTH_TEXT.startFree}
        </PixelButton>
      </div>
    </section>
  );
}
