'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, type KeyboardEvent } from 'react';
import { SHELL_TEXT } from '@/lib/constants';
import { NavLinks } from './nav-links';

/**
 * Nav below lg. A native <details>, so it opens and closes without JS.
 * With JS it also closes on navigation and on Escape.
 */
export function MobileMenu() {
  const ref = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (ref.current) ref.current.open = false;
  }, [pathname]);

  function onKeyDown(event: KeyboardEvent<HTMLDetailsElement>) {
    if (event.key !== 'Escape' || !ref.current?.open) return;
    ref.current.open = false;
    ref.current.querySelector('summary')?.focus();
  }

  return (
    <details ref={ref} className="mobile-menu" onKeyDown={onKeyDown}>
      <summary className="mobile-menu-toggle">
        <span className="mobile-menu-glyph" aria-hidden="true" />
        {SHELL_TEXT.menu}
      </summary>
      <nav className="mobile-menu-panel" aria-label={SHELL_TEXT.navLabel}>
        <NavLinks />
      </nav>
    </details>
  );
}
