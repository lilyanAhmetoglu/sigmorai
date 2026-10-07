import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { NewsletterBox } from '@/components/blog/newsletter-box';
import { PostCard } from '@/components/blog/post-card';
import { PostScene } from '@/components/blog/post-scene';
import { PostToc } from '@/components/blog/post-toc';
import { QuestBox } from '@/components/blog/quest-box';
import { MarketingHeader } from '@/components/hud/marketing-header';
import { JsonLd } from '@/components/json-ld';
import { LessonBody } from '@/components/quest/lesson-body';
import { SourceList } from '@/components/quest/source-list';
import { ShareButtons } from '@/components/share-buttons';
import {
  BLOG_HREF,
  BLOG_RELATED_COUNT,
  BLOG_TEXT,
  blogHref,
  MAIN_CONTENT_ID,
  SHARE_TEXT,
  SITE_NAME,
  SITE_URL,
} from '@/lib/constants';
import { postHeadings, relatedPosts, toBlogCard } from '@/lib/content/blog';
import { articleJsonLd } from '@/lib/content/json-ld';
import { ContentError, listBlogPosts, loadBlogPost, loadLesson } from '@/lib/content/load';
import { socialMetadata } from '@/lib/og/metadata';
import { dateLabel } from '@/lib/utils';

/** Prerendered per post: dynamicParams + generateStaticParams are in layout.tsx (the share image uses them too). */

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
  const pageTitle = `${title} · ${SITE_NAME}`;
  return {
    title: pageTitle,
    description,
    alternates: { canonical: blogHref(slug) },
    ...socialMetadata({ title: pageTitle, description, url: blogHref(slug), type: 'article' }),
  };
}

/**
 * One blog post (Sigmorai Blog.dc.html → isPost): breadcrumb, title,
 * summary, author line, the realm's scene, the body (plain Markdown, no
 * DialogBox) with its sources, an "On this page" list and TRY THE QUEST
 * beside it, then Keep reading and the newsletter box. Static.
 * Product choice: the newsletter box is on the post page too, though the
 * design's post view ends at Keep reading (a reader who just finished a post
 * is the best moment to sign up). See docs/plans/blog-newsletter-design-plan.md.
 */
export default async function BlogPostPage({ params }: PageProps<'/blog/[slug]'>) {
  const { slug } = await params;
  const data = await getPost(slug);
  if (!data) notFound();
  const { post, sources } = data;
  const card = toBlogCard(post);
  const { place } = card;
  const headings = [
    ...postHeadings(post.body),
    { id: BLOG_TEXT.sourcesId, text: BLOG_TEXT.sourcesTitle },
  ];
  const related = relatedPosts((await listBlogPosts()).map(toBlogCard), slug, BLOG_RELATED_COUNT);

  return (
    <>
      <JsonLd data={articleJsonLd(post, SITE_URL)} />
      <MarketingHeader />
      <main id={MAIN_CONTENT_ID} tabIndex={-1} className="blog-main" data-page="post">
        <nav aria-label={BLOG_TEXT.breadcrumbLabel}>
          <ol className="post-breadcrumb" data-accent={place.accent}>
            <li>
              <Link href={BLOG_HREF}>{BLOG_TEXT.breadcrumbBlog}</Link>
            </li>
            <li aria-hidden="true">{BLOG_TEXT.breadcrumbSep}</li>
            <li data-realm>{place.name}</li>
            <li aria-hidden="true">{BLOG_TEXT.breadcrumbSep}</li>
            <li aria-current="page">{post.frontmatter.title}</li>
          </ol>
        </nav>

        <header className="post-header">
          <h1 className="post-title">{post.frontmatter.title}</h1>
          <p className="post-summary">{post.frontmatter.description}</p>
          <div className="post-author">
            <Image
              src="/logo/sigmorai-mark.svg"
              alt=""
              width={40}
              height={40}
              unoptimized
              className="post-author-mark pixel"
            />
            <div className="post-author-text">
              <p className="post-author-name">{BLOG_TEXT.author}</p>
              <p className="post-meta">
                <span className="sr-only">{BLOG_TEXT.publishedLabel} </span>
                <time dateTime={post.date}>{dateLabel(post.date)}</time>
                <span aria-hidden="true"> · </span>
                {BLOG_TEXT.readTime(card.minutes)}
                <span aria-hidden="true"> · </span>
                {BLOG_TEXT.sourcedNote}
              </p>
            </div>
          </div>
        </header>

        <PostScene
          cover={card.cover}
          sizes="(min-width: 1200px) 1104px, 100vw"
          preload
          className="post-hero"
        />

        <div className="post-layout">
          <article className="post-article">
            <LessonBody body={post.body} />
            <section
              id={BLOG_TEXT.sourcesId}
              className="post-sources"
              aria-labelledby="post-sources-title"
            >
              <h2 id="post-sources-title" className="post-sources-title">
                {BLOG_TEXT.sourcesTitle}
              </h2>
              <SourceList sources={sources} intro={BLOG_TEXT.sourcesIntro} />
            </section>
          </article>

          {/* Under lg the aside uses display:contents (blog.css): the TOC sits above the article, TRY THE QUEST below it. */}
          <aside className="post-aside">
            <PostToc headings={headings} />
            <QuestBox place={place} lesson={post.frontmatter.lesson} />
            <ShareButtons
              target={{ url: blogHref(slug), text: SHARE_TEXT.post(post.frontmatter.title) }}
            />
          </aside>
        </div>

        {related.length > 0 && (
          <section className="post-related" aria-labelledby="related-title">
            <h2 id="related-title" className="post-related-title">
              {BLOG_TEXT.relatedTitle}
            </h2>
            <ul className="post-grid">
              {related.map((r) => (
                <li key={r.slug}>
                  <PostCard post={r} variant="compact" />
                </li>
              ))}
            </ul>
          </section>
        )}

        <NewsletterBox />
      </main>
    </>
  );
}
