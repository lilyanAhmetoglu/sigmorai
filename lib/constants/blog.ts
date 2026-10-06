/**
 * Blog and newsletter constants (not copy: words are in ./blog-copy.ts).
 * A post has no tags field: its topic comes from the realm of its linked
 * lesson (SIG-44), through BLOG_REALM_TOPIC.
 */

/** Topic filters, in the design's order (Sigmorai Blog.dc.html → FILTERS). */
export const BLOG_TOPICS = ['prompting', 'building', 'agents', 'quality', 'math'] as const;

/** The filter chip label of each topic, plus "all". */
export const BLOG_TOPIC_LABELS = {
  all: 'ALL',
  prompting: 'PROMPTING',
  building: 'BUILDING',
  agents: 'AGENTS',
  quality: 'EVALS & PROD',
  math: 'MATH',
} as const;

/**
 * Topic of a post whose lesson is in realm N (index = realm id). From the
 * design's POSTS keys; realm 0 (model basics) is not in the design and
 * sits with prompting, its nearest neighbour. Math Tower posts are `math`;
 * Frontier posts have no topic (they show under ALL only).
 */
export const BLOG_REALM_TOPIC = [
  'prompting', // 0 Bootstrap Village
  'prompting', // 1 Prompt Forest
  'building', // 2 Tool Forge
  'prompting', // 3 Context Library
  'agents', // 4 Agent Citadel
  'agents', // 5 MCP Bridgelands
  'quality', // 6 Eval Arena
  'agents', // 7 Swarm Spire
  'quality', // 8 Production Peaks
] as const;

/** Reading speed for the "N MIN READ" label. */
export const BLOG_WORDS_PER_MINUTE = 200;
/** How many posts "Keep reading" shows. */
export const BLOG_RELATED_COUNT = 3;

/** Resend REST API (resend.com/docs/api-reference). Contacts are global; a segment groups them. */
export const RESEND_API_URL = 'https://api.resend.com';
/** Stop waiting for Resend after this; the form shows the plain error. */
export const NEWSLETTER_TIMEOUT_MS = 8_000;
/** RFC 5321 limit on an email address. */
export const NEWSLETTER_EMAIL_MAX = 254;
/** Form field names: the email, and the honeypot people never see. */
export const NEWSLETTER_FIELDS = { email: 'email', honeypot: 'website' } as const;
