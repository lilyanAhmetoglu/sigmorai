/**
 * Join class names, skipping falsy parts. No clsx / tailwind-merge needed:
 * primitive styles sit in @layer components, so a caller's utility class always
 * wins by layer order, never by class order.
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
