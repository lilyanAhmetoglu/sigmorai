import type { SHARE_COPY_SOURCE, SHARE_NATIVE_SOURCE, SHARE_NETWORKS } from '@/lib/constants';

/** A network with a share link (LinkedIn, X, Facebook). */
export type ShareNetwork = (typeof SHARE_NETWORKS)[number];

/** utm_source of a shared link: a network, or the copy / native-share button. */
export type ShareSource = ShareNetwork | typeof SHARE_COPY_SOURCE | typeof SHARE_NATIVE_SOURCE;

/** What a share button row shares: a site path or an absolute URL, and its prefilled text. */
export type ShareTarget = { url: string; text: string };
