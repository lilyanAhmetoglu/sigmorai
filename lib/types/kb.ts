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
