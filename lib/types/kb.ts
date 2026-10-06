import { z } from 'zod';
import { KB_SOURCE_KINDS, KB_TRUST_TIERS } from '@/lib/constants';

/** One entry of content/sources.yaml; mirrors a kb_sources row. */
export const KbSourceSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'id must be a kebab-case slug'),
    kind: z.enum(KB_SOURCE_KINDS),
    title: z.string().min(1),
    url: z.url({ protocol: /^https$/ }),
    owner: z.string().min(1),
    trustTier: z.enum(KB_TRUST_TIERS),
    enabled: z.boolean().default(true),
    // Shape is decided with the fetch job (knowledge-base plan, step 8).
    fetchConfig: z.record(z.string(), z.unknown()).default({}),
  })
  .strict();
export type KbSource = z.infer<typeof KbSourceSchema>;

export const KbSourcesFileSchema = z
  .object({ sources: z.array(KbSourceSchema).min(1) })
  .strict()
  .refine((f) => new Set(f.sources.map((s) => s.id)).size === f.sources.length, {
    message: 'duplicate source id',
  })
  .refine((f) => new Set(f.sources.map((s) => s.url)).size === f.sources.length, {
    message: 'duplicate source url',
  });

// ── Docs-watch state (SIG-23): hashes.json on the docs-watch branch ──────

const IsoTime = z.iso.datetime();

/** The last good hash of one watched URL. `changedAt` is when the hash last moved. */
export const DocsWatchPageSchema = z.object({
  hash: z.string().regex(/^[a-f0-9]{64}$/),
  checkedAt: IsoTime,
  changedAt: IsoTime,
});
export type DocsWatchPage = z.infer<typeof DocsWatchPageSchema>;

/** A change not handled yet. It stays until the docs-changed issue is closed. */
export const DocsWatchPendingSchema = z.object({
  url: z.url(),
  sourceId: z.string().min(1),
  changedAt: IsoTime,
  lessons: z.array(z.string()),
});
export type DocsWatchPending = z.infer<typeof DocsWatchPendingSchema>;

export const DocsWatchStateSchema = z.object({
  pages: z.record(z.string(), DocsWatchPageSchema),
  pending: z.array(DocsWatchPendingSchema),
  issue: z.number().int().positive().nullable(),
});
export type DocsWatchState = z.infer<typeof DocsWatchStateSchema>;

/**
 * One URL to hash. `url` is the state key (what a lesson cites, or the index);
 * `fetchUrl` is what is fetched (the `.md` variant where a host has one).
 * `fallbackUrl` is fetched instead when the first answer is a 404 or empty after
 * normalising (a moved page's `.md`, a repo with no releases). Never on a timeout
 * or a 5xx: switching format on a blip would look like a change.
 */
export type DocsWatchTarget = {
  url: string;
  fetchUrl: string;
  fallbackUrl?: string;
  sourceId: string;
  lessons: string[];
};
