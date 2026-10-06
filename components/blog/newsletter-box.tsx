'use client';

import Link from 'next/link';
import { useActionState, useEffect, useId, useRef, useState } from 'react';
import { PixelButton } from '@/components/pixel-button';
import { subscribeNewsletter } from '@/lib/actions/newsletter';
import {
  NEWSLETTER_EMAIL_MAX,
  NEWSLETTER_FIELDS,
  NEWSLETTER_TEXT,
  PRIVACY_HREF,
} from '@/lib/constants';

/**
 * DISPATCH FROM LATENTIA (Sigmorai Blog.dc.html → showNewsletter): one email
 * field and Subscribe, wired to subscribeNewsletter. Four states: idle,
 * sending (button busy, aria-disabled so focus stays), success (the form is
 * replaced by the message), error (under the field). The server re-checks
 * everything; the browser decides nothing. No tracking pixel, no third-party
 * script: the email goes to our Server Action only. Styles: blog.css.
 */
export function NewsletterBox() {
  const [state, formAction, pending] = useActionState(subscribeNewsletter, null);
  // Typing after an error hides it until the next submit.
  const [dirty, setDirty] = useState(false);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const id = useId();
  const titleId = `${id}-title`;
  const inputId = `${id}-email`;
  const errorId = `${id}-error`;
  const noteId = `${id}-note`;

  const error = state && 'error' in state && !dirty && !pending ? state.error : null;
  const done = state !== null && 'done' in state;

  // After a result, move focus to the status line: on success the form unmounts, so focus would fall to <body>.
  useEffect(() => {
    if (state && !pending && done) statusRef.current?.focus();
  }, [state, pending, done]);

  return (
    <section className="newsletter-box" aria-labelledby={titleId}>
      <div className="newsletter-box-copy">
        <p className="newsletter-box-eyebrow">{NEWSLETTER_TEXT.eyebrow}</p>
        <h2 id={titleId} className="newsletter-box-title">
          {NEWSLETTER_TEXT.title}
        </h2>
        <p className="newsletter-box-intro">{NEWSLETTER_TEXT.intro}</p>
      </div>

      <div className="newsletter-box-side">
        {/* Live region, always mounted, so the success line is announced. */}
        <p
          ref={statusRef}
          role="status"
          aria-live="polite"
          tabIndex={-1}
          className="newsletter-box-done"
        >
          {done ? NEWSLETTER_TEXT.success : null}
        </p>
        {!done && (
          <form
            action={formAction}
            onSubmit={() => setDirty(false)}
            className="newsletter-form"
            noValidate
          >
            <div className="newsletter-form-row">
              <label htmlFor={inputId} className="sr-only">
                {NEWSLETTER_TEXT.label}
              </label>
              <input
                id={inputId}
                name={NEWSLETTER_FIELDS.email}
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                maxLength={NEWSLETTER_EMAIL_MAX}
                placeholder={NEWSLETTER_TEXT.placeholder}
                className="newsletter-input"
                aria-invalid={error === 'invalid_email' ? true : undefined}
                aria-describedby={error ? `${errorId} ${noteId}` : noteId}
                onChange={() => setDirty(true)}
              />
              {/* Honeypot: off-screen, out of the tab order, hidden from screen readers. */}
              <div className="newsletter-honeypot" aria-hidden="true">
                <label htmlFor={`${id}-hp`}>{NEWSLETTER_TEXT.honeypotLabel}</label>
                <input
                  id={`${id}-hp`}
                  name={NEWSLETTER_FIELDS.honeypot}
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>
              <PixelButton type="submit" aria-disabled={pending}>
                {pending ? NEWSLETTER_TEXT.sending : NEWSLETTER_TEXT.submit}
              </PixelButton>
            </div>
            {error && (
              <p id={errorId} role="alert" className="newsletter-error">
                {NEWSLETTER_TEXT.errors[error]}
              </p>
            )}
          </form>
        )}
        <p id={noteId} className="newsletter-note">
          {NEWSLETTER_TEXT.privacy}{' '}
          <Link href={PRIVACY_HREF} className="newsletter-note-link">
            {NEWSLETTER_TEXT.privacyLink}
          </Link>
        </p>
      </div>
    </section>
  );
}
