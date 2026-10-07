import { listBlogPosts } from '@/lib/content/load';

/**
 * Every post is prerendered at build time; any other slug is a 404. Here, not
 * in page.tsx, so the child routes get the same params: the share image
 * (opengraph-image.tsx) is prerendered once per post.
 */
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await listBlogPosts()).map(({ slug }) => ({ slug }));
}

export default function BlogPostLayout({ children }: LayoutProps<'/blog/[slug]'>) {
  return children;
}
