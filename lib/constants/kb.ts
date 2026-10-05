/** How a knowledge-base source is fetched (docs/plans/knowledge-base-design-plan.md). */
export const KB_SOURCE_KINDS = ['docs', 'changelog', 'repo', 'blog'] as const;

/** official = the vendor's own docs or repos; community = vetted third party. */
export const KB_TRUST_TIERS = ['official', 'community'] as const;

/** Registry file name inside content/ (lib/content/load.ts: loadKbSources). */
export const KB_SOURCES_NAME = 'sources.yaml';
/** Registry file mirrored into kb_sources by `bun run seed`. */
export const KB_SOURCES_FILE = `content/${KB_SOURCES_NAME}`;
