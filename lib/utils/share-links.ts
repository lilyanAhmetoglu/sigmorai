import { SHARE_ENDPOINTS, SHARE_NETWORKS, SHARE_UTM } from '@/lib/constants';
import type { ShareNetwork, ShareSource } from '@/lib/types';
import { absoluteUrl } from './absolute-url';

/**
 * `path` (a site path, or an absolute URL) as an absolute URL on `siteUrl` with the share UTM tags:
 * utm_source=<source>&utm_medium=social&utm_campaign=share. Existing query
 * params (`?track=`, `?range=`) are kept; old utm_* values are replaced.
 */
export function withUtm(siteUrl: string, path: string, source: ShareSource): string {
  const url = new URL(absoluteUrl(siteUrl, path));
  url.searchParams.set('utm_source', source);
  url.searchParams.set('utm_medium', SHARE_UTM.medium);
  url.searchParams.set('utm_campaign', SHARE_UTM.campaign);
  return url.toString();
}

/** The network's own share page for `url`. Only X takes the prefilled text. */
export function networkShareHref(network: ShareNetwork, url: string, text: string): string {
  const href = new URL(SHARE_ENDPOINTS[network]);
  switch (network) {
    case 'linkedin':
      href.searchParams.set('url', url);
      break;
    case 'x':
      href.searchParams.set('text', text);
      href.searchParams.set('url', url);
      break;
    case 'facebook':
      href.searchParams.set('u', url);
      break;
  }
  return href.toString();
}

/** One link per network (all of them by default), each with its own utm_source, in button order. */
export function shareLinks(
  siteUrl: string,
  path: string,
  text: string,
  networks: readonly ShareNetwork[] = SHARE_NETWORKS,
): { network: ShareNetwork; href: string }[] {
  return networks.map((network) => ({
    network,
    href: networkShareHref(network, withUtm(siteUrl, path, network), text),
  }));
}
