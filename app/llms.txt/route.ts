import { SITE_URL } from '@/lib/constants';
import { llmsTxt } from '@/lib/content/llms';
import { listBlogPosts } from '@/lib/content/load';

/** Built once at build time, like the sitemap: posts only change with a deploy. */
export const dynamic = 'force-static';

/** /llms.txt: a Markdown guide to the public site for AI tools (llmstxt.org). */
export async function GET() {
  return new Response(llmsTxt(await listBlogPosts(), SITE_URL), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
}
