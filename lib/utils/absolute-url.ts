/** A site path as an absolute URL on `siteUrl` (trailing slash or not). Feed and sitemap links. */
export const absoluteUrl = (siteUrl: string, href: string) => new URL(href, siteUrl).toString();
