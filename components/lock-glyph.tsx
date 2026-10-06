/**
 * A 7×8 pixel padlock in currentColor, drawn at 2× (14×16 px). The pixel
 * fonts have no lock character (Latin only), so this is SVG, not text.
 * Decoration only: the locked state is also in words next to it.
 */
export function LockGlyph() {
  return (
    <svg
      width="14"
      height="16"
      viewBox="0 0 7 8"
      fill="currentColor"
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M2 0h3v1H2zM1 1h1v2H1zM5 1h1v2H5zM0 3h7v2H0zM0 5h3v2H0zM4 5h3v2H4zM0 7h7v1H0z" />
    </svg>
  );
}
