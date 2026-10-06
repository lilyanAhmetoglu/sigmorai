import Link from 'next/link';
import { BLOG_HREF, PRIVACY_HREF, SHELL_TEXT } from '@/lib/constants';

/**
 * App footer, as in the design, plus the site links (blog, privacy). They are
 * always last: far right on a wide screen, their own last row on a phone.
 * Styles: app-shell.css.
 */
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <span>{SHELL_TEXT.footerLeft}</span>
      <span>{SHELL_TEXT.footerRight}</span>
      <nav aria-label={SHELL_TEXT.footerNavLabel} className="flex flex-wrap gap-x-4">
        <Link href={BLOG_HREF} className="site-footer-link">
          {SHELL_TEXT.footerBlog}
        </Link>
        <Link href={PRIVACY_HREF} className="site-footer-link">
          {SHELL_TEXT.footerPrivacy}
        </Link>
      </nav>
    </footer>
  );
}
