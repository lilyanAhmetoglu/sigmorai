import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { MarketingHeader } from '@/components/hud/marketing-header';
import { Panel } from '@/components/panel';
import { PixelButton } from '@/components/pixel-button';
import { LessonBody } from '@/components/quest/lesson-body';
import { SourceList } from '@/components/quest/source-list';
import {
  BLOG_HREF,
  BLOG_TEXT,
  blogHref,
  MAIN_CONTENT_ID,
  questHref,
  SITE_NAME,
} from '@/lib/constants';
import { ContentError, listBlogPosts, loadBlogPost, loadLesson } from '@/lib/content/load';
import { dateLabel } from '@/lib/utils';

/** Every post is prerendered at build time; any other slug is a 404. */
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await listBlogPosts()).map(({ slug }) => ({ slug }));
}

/** The post and its lesson (for the sources). One read per render: metadata and page share it. */
const getPost = cache(async (slug: string) => {
  try {
    const post = await loadBlogPost(slug);
    const lesson = await loadLesson(post.frontmatter.lesson);
    return { post, sources: lesson.frontmatter.sources };
  } catch (err) {
    if (err instanceof ContentError && err.code === 'missing') return null;
    throw err;
  }
});

export async function generateMetadata({ params }: PageProps<'/blog/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPost(slug);
  if (!data) return {};
  const { title, description } = data.post.frontmatter;
  return {
    title: `${title} · ${SITE_NAME}`,
    description,
    alternates: { canonical: blogHref(slug) },
  };
}

/**
 * One blog post: date, title, summary, the body (plain Markdown, no
 * DialogBox), a link to its lesson, and the lesson's sources. Static.
 */
export default async function BlogPostPage({ params }: PageProps<'/blog/[slug]'>) {
  const { slug } = await params;
  const data = await getPost(slug);
  if (!data) notFound();
  const { post, sources } = data;
  const { title, description, lesson } = post.frontmatter;

  return (
    <>
      <MarketingHeader />
      <main
        id={MAIN_CONTENT_ID}
        tabIndex={-1}
        className="max-w-reading mx-auto flex w-full min-w-0 flex-1 flex-col gap-6 px-4 py-8"
      >
        <Link
          href={BLOG_HREF}
          className="text-body inline-flex min-h-11 items-center gap-2 self-start"
        >
          <span aria-hidden="true">{BLOG_TEXT.backIcon}</span>
          {BLOG_TEXT.back}
        </Link>
        <div className="flex flex-col gap-3">
          <p className="page-eyebrow">
            <span className="sr-only">{BLOG_TEXT.publishedLabel} </span>
            <time dateTime={post.date}>{dateLabel(post.date)}</time>
          </p>
          <h1 className="page-title">{title}</h1>
          <p className="page-intro">{description}</p>
        </div>

        <LessonBody body={post.body} />

        <PixelButton href={questHref(lesson)} className="self-start">
          {BLOG_TEXT.openLesson}
        </PixelButton>

        <Panel title={BLOG_TEXT.sourcesTitle} titleAs="h2">
          <SourceList sources={sources} intro={BLOG_TEXT.sourcesIntro} />
        </Panel>
      </main>
    </>
  );
}
