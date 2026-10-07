import { OG_CONTENT_TYPE, OG_SIZE, OG_TEXT } from '@/lib/constants';
import { ContentError, loadBlogPost } from '@/lib/content/load';
import { CoverArt, loadCover, loadLogo, OgCard, ogImage } from '@/lib/og/og-card';

/**
 * A blog post's share image: the post's own cover (content/CLAUDE.md: every
 * post has a unique one) behind its title. Overrides the site image from
 * app/(marketing)/opengraph-image.tsx. Prerendered once per post. A route
 * handler doesn't inherit its layout's params, so it re-exports them; that is
 * also why the alt is one shared line (generateImageMetadata would replace
 * this generateStaticParams with its own).
 */

export const dynamicParams = false;
export { generateStaticParams } from './layout';
export const alt = OG_TEXT.postCardAlt;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

type Params = { slug: string };

async function postFor(slug: string) {
  try {
    return (await loadBlogPost(slug)).frontmatter;
  } catch (err) {
    if (err instanceof ContentError && err.code === 'missing') return null;
    throw err;
  }
}

export default async function Image({ params }: { params: Promise<Params> }) {
  const post = await postFor((await params).slug);
  if (!post) return new Response(null, { status: 404 });
  const [cover, logo] = await Promise.all([loadCover(post.cover), loadLogo()]);
  return ogImage(
    <OgCard
      logo={logo}
      background={<CoverArt src={cover} />}
      eyebrow={OG_TEXT.postEyebrow}
      title={post.title}
    />,
  );
}
