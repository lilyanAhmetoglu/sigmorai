import { LEADERBOARD_TEXT, OG_CONTENT_TYPE, OG_SIZE, OG_TEXT } from '@/lib/constants';
import { loadLogo, OgCard, ogImage } from '@/lib/og/og-card';

/**
 * The leaderboard's share image: a plain branded card (no realm art: that
 * belongs to its realm). No ranks drawn: it is built once, at build time, and
 * a rank would go stale. No session needed.
 */

export const alt = OG_TEXT.leaderboardAlt;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  const logo = await loadLogo();
  return ogImage(
    <OgCard
      logo={logo}
      eyebrow={LEADERBOARD_TEXT.eyebrow}
      title={LEADERBOARD_TEXT.title}
      line={LEADERBOARD_TEXT.description}
    />,
  );
}
