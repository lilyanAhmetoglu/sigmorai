/**
 * How many XPBar cells are lit for value/max. Same rounding as XPBar.jsx
 * (Math.round), clamped to 0..segments. Bad input (max ≤ 0, NaN) lights none.
 */
export function filledSegments(value: number, max: number, segments: number): number {
  if (!(max > 0) || !(segments > 0) || !Number.isFinite(value)) return 0;
  const ratio = Math.min(1, Math.max(0, value / max));
  return Math.round(ratio * segments);
}
