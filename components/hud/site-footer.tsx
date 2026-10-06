import Link from 'next/link';
import { PRIVACY_HREF, SHELL_TEXT } from '@/lib/constants';

/**
 * App footer, as in the design, plus the privacy link. The link is always
 * last: far right on a wide screen, its own last row on a phone.
 * Styles: app-shell.css.
 */
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <span>{SHELL_TEXT.footerLeft}</span>
      <span>{SHELL_TEXT.footerRight}</span>
      <nav aria-label={SHELL_TEXT.footerNavLabel}>
        <Link href={PRIVACY_HREF} className="site-footer-link">
          {SHELL_TEXT.footerPrivacy}
        </Link>
      </nav>
    </footer>
  );
}
