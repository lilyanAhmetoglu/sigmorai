import { LEADERBOARD_SIZE, LEADERBOARD_TEXT } from '@/lib/constants';

/** Row-shaped placeholders so the layout doesn't jump. No spinner. */
const PLACEHOLDER_ROWS = Math.min(LEADERBOARD_SIZE, 8);

export default function Loading() {
  return (
    <div aria-busy="true" className="max-w-app mx-auto flex w-full flex-col gap-6 px-4 py-6">
      <span className="sr-only">{LEADERBOARD_TEXT.loading}</span>
      <div className="flex flex-col gap-2" aria-hidden="true">
        <p className="page-eyebrow">{LEADERBOARD_TEXT.eyebrow}</p>
        <p className="page-title">{LEADERBOARD_TEXT.title}</p>
      </div>
      <ul className="board-list" aria-hidden="true">
        {Array.from({ length: PLACEHOLDER_ROWS }, (_, i) => (
          <li key={i} className="board-row">
            <div className="h-12" />
          </li>
        ))}
      </ul>
    </div>
  );
}
