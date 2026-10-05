import { Panel } from '@/components/panel';
import { PixelButton } from '@/components/pixel-button';
import { AUDIENCES, AUTH_ROUTES, AUTH_TEXT, LANDING_TEXT } from '@/lib/constants';

/** "Who it is for": one Panel per audience (beginner, business, tech), then a closing Start free. Styles: landing.css. */
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
