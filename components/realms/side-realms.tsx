import { PixelButton } from '@/components/pixel-button';
import { FRONTIER, FRONTIER_HREF, MATH_HREF, MATH_TOWER, SIDE_REALMS_TEXT } from '@/lib/constants';

const SIDE_REALMS_ID = 'side-realms';
const SIDE_REALM_LINKS = [
  { href: MATH_HREF, name: MATH_TOWER.name },
  { href: FRONTIER_HREF, name: FRONTIER.name },
] as const;

/**
 * "Side realms": a link row to the Math Tower (/math) and the Frontier
 * (/frontier), shared by every path. On the world map, under the map box,
 * so both are one tap away even when their landmarks are scrolled out of
 * view. Moved here from the old /realms catalog. Styles: realms.css.
 */
export function SideRealms() {
  return (
    <section aria-labelledby={SIDE_REALMS_ID} className="side-realms">
      <h2 id={SIDE_REALMS_ID} className="page-eyebrow">
        {SIDE_REALMS_TEXT.heading}
      </h2>
      <ul className="side-realms-list">
        {SIDE_REALM_LINKS.map(({ href, name }) => (
          <li key={href}>
            <PixelButton
              href={href}
              variant="secondary"
              icon={<span aria-hidden="true">{SIDE_REALMS_TEXT.icon}</span>}
            >
              {name}
            </PixelButton>
          </li>
        ))}
      </ul>
    </section>
  );
}
