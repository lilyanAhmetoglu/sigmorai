/** `pathname` is `route` or a page under it (`/blog` → `/blog/be-specific`). */
export function isUnderPath(pathname: string, route: string): boolean {
  return pathname === route || pathname.startsWith(`${route}/`);
}
