'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS, SHELL_TEXT } from '@/lib/constants';

function isCurrent(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * The NAV_ITEMS list. Live items are links (aria-current on the current one);
 * items whose route isn't built yet are text with a "Soon" tag, never a link.
 * Client only for usePathname (layouts don't re-render on navigation).
 */
export function NavLinks() {
  const pathname = usePathname();
  return (
    <ul className="nav-list">
      {NAV_ITEMS.map((item) => (
        <li key={item.href}>
          {item.live ? (
            <Link
              href={item.href}
              className="nav-link"
              aria-current={isCurrent(pathname, item.href) ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ) : (
            <span className="nav-link" data-soon>
              {item.label}
              <span className="nav-soon">{SHELL_TEXT.soon}</span>
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
