/**
 * Roving focus for a one-row widget (WAI-ARIA tabs pattern): which index a key
 * moves to. Arrows wrap around; Home/End jump to the ends. Any other key → null.
 */
export function rovingIndex(key: string, current: number, count: number): number | null {
  if (count <= 0) return null;
  switch (key) {
    case 'ArrowRight':
      return (current + 1) % count;
    case 'ArrowLeft':
      return (current - 1 + count) % count;
    case 'Home':
      return 0;
    case 'End':
      return count - 1;
    default:
      return null;
  }
}
