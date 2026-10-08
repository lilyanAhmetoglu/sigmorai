/** How a knowledge-base source is fetched (docs/plans/knowledge-base-design-plan.md). */
export const KB_SOURCE_KINDS = ['docs', 'changelog', 'repo', 'blog'] as const;

/** official = the vendor's own docs or repos; community = vetted third party. */
export const KB_TRUST_TIERS = ['official', 'community'] as const;

/** Registry file name inside content/ (lib/content/load.ts: loadKbSources). */
export const KB_SOURCES_NAME = 'sources.yaml';
/** Registry file mirrored into kb_sources by `bun run seed`. */
export const KB_SOURCES_FILE = `content/${KB_SOURCES_NAME}`;

// ── Docs-watch (SIG-23): daily hash of every cited page; no DB, no model ──

/** Sent with every docs-watch fetch, so a site owner can see who we are. */
export const DOCS_WATCH_USER_AGENT = 'sigmorai-docs-watch/1.0 (+https://sigmorai.com)';
/** One fetch gives up after this long. */
export const DOCS_WATCH_TIMEOUT_MS = 15_000;
/** Where the state lives when DOCS_WATCH_DIR is not set (the docs-watch branch checkout). */
export const DOCS_WATCH_DEFAULT_DIR = './docs-watch';
export const DOCS_WATCH_STATE_FILE = 'hashes.json';
export const DOCS_WATCH_ISSUE_FILE = 'issue-body.md';
/** Label of the one open "docs changed" issue. */
export const DOCS_WATCH_LABEL = 'docs-changed';

/**
 * Hosts that serve a page's Markdown at `<page><suffix>` (cheaper and steadier
 * than HTML: no banners, no build ids). A key is a host, or a host plus a path
 * prefix when only part of the site is docs (`elevenlabs.io/docs`: its
 * `/use-policy` page has no Markdown copy).
 */
export const DOCS_MD_HOSTS: Readonly<Record<string, string>> = {
  'platform.claude.com': '.md',
  'developers.openai.com': '.md',
  'code.claude.com': '.md',
  'modelcontextprotocol.io': '.md',
  'ai.google.dev': '.md.txt',
  'developer.ideogram.ai': '.md',
  'elevenlabs.io/docs': '.md',
  'storybook.js.org/docs': '.md',
  'ui.shadcn.com/docs': '.md',
  'geminicli.com/docs': '.md',
  'support.claude.com': '.md',
};
/**
 * Hosts whose docs base has an `llms.txt` page index (`<base>/llms.txt`). Same
 * key form as DOCS_MD_HOSTS (a host, or a host plus a path prefix).
 */
export const DOCS_LLMS_TXT_HOSTS = [
  'platform.claude.com',
  'developers.openai.com',
  'code.claude.com',
  'huggingface.co',
  'developer.ideogram.ai',
  'elevenlabs.io/docs',
  'storybook.js.org',
  'ui.shadcn.com',
  'geminicli.com',
  'support.claude.com',
] as const;
