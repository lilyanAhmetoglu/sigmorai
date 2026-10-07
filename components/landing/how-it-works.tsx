import { LANDING_TEXT } from '@/lib/constants';

/**
 * "How you clear a level" (design: landing → HOW YOU PASS A LEVEL): the
 * lesson → case → quick check → boss loop in four numbered steps. The
 * numbers come from the ordered list (CSS counter), so the text stands
 * alone. Plain product voice. Styles: landing.css.
 */
export function HowItWorks() {
  return (
    <section className="landing-section" aria-labelledby="how-title">
      <div className="landing-section-head">
        <p className="landing-kicker">{LANDING_TEXT.howEyebrow}</p>
        <h2 id="how-title" className="landing-h2">
          {LANDING_TEXT.howTitle}
        </h2>
      </div>
      <ol className="landing-steps">
        {LANDING_TEXT.howSteps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </section>
  );
}
