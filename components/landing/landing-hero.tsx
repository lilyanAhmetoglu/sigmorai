import { LandingCta } from '@/components/landing/landing-cta';
import { PixelButton } from '@/components/pixel-button';
import {
  AUTH_ROUTES,
  AUTH_TEXT,
  LANDING_TEXT,
  LEVEL_ART_LAYERS as ART_LAYERS,
} from '@/lib/constants';

/**
 * Landing hero: static parallax art (CSS layers; the canvas scene comes later),
 * the legibility fade, then the pitch and the Start free CTA (Continue quest
 * when signed in). The art is decoration (aria-hidden); the heading and text
 * carry the meaning.
 * Styles: landing.css.
 */
export function LandingHero() {
  return (
    <section className="landing-hero" aria-labelledby="landing-title">
      <div className="landing-art" aria-hidden="true">
        {ART_LAYERS.map((layer) => (
          <div key={layer} className="landing-layer" data-layer={layer} />
        ))}
      </div>
      <div className="landing-hero-copy">
        <p className="landing-eyebrow">{LANDING_TEXT.eyebrow}</p>
        <h1 id="landing-title" className="landing-title">
          {LANDING_TEXT.title}
        </h1>
        <p className="landing-lede">{LANDING_TEXT.lede}</p>
        <div>
          <LandingCta size="lg">
            <PixelButton href={AUTH_ROUTES.signUp} size="lg">
              {AUTH_TEXT.startFree}
            </PixelButton>
          </LandingCta>
        </div>
      </div>
    </section>
  );
}
