import { SHELL_TEXT } from '@/lib/constants';

/** App footer, as in the design. Styles: app-shell.css. */
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <span>{SHELL_TEXT.footerLeft}</span>
      <span>{SHELL_TEXT.footerRight}</span>
    </footer>
  );
}
