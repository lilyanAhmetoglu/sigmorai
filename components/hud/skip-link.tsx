import { MAIN_CONTENT_ID, SHELL_TEXT } from '@/lib/constants';

/** First focusable element: jumps keyboard users past the header to <main>. Styles: app-shell.css. */
export function SkipLink() {
  return (
    <a href={`#${MAIN_CONTENT_ID}`} className="skip-link">
      {SHELL_TEXT.skipLink}
    </a>
  );
}
