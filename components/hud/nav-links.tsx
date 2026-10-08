'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LIVE_NAV_ITEMS } from '@/lib/constants';
import { isUnderPath } from '@/lib/utils';

/**
 * The live nav items as links, aria-current on the current one.
 * Client only for usePathname (layouts don't re-render on navigation).
 */
export function NavLinks() {
  const pathname = usePathname();
  return (
    <ul className="nav-list">
      {LIVE_NAV_ITEMS.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            className="nav-link"
            aria-current={isUnderPath(pathname, item.href) ? 'page' : undefined}
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
