import Link from 'next/link';
import { BLOG_TEXT, blogHref } from '@/lib/constants';
import type { BlogCardView } from '@/lib/types';
import { dateLabel } from '@/lib/utils';
import { PostScene } from './post-scene';

type Props = {
  post: BlogCardView;
  /** `full`: the list card (scene, summary, date). `compact`: Keep reading (realm, title, read time). */
  variant?: 'full' | 'compact';
  /** The card title's heading level: h3 under a section h2. */
  headingAs?: 'h2' | 'h3';
};

/**
 * A post in the blog list or in Keep reading (Sigmorai Blog.dc.html → posts,
 * related). The title is the link; its ::after stretches over the whole
 * card, so the tap target is the card. Styles: blog.css.
 */
export function PostCard({ post, variant = 'full', headingAs: Heading = 'h3' }: Props) {
  const full = variant === 'full';
  return (
    <article className="post-card" data-variant={variant} data-accent={post.place.accent}>
      {full && (
        <PostScene
          cover={post.cover}
          sizes="(min-width: 768px) 360px, 100vw"
          className="post-card-scene"
        />
      )}
      <div className="post-card-body">
        <p className="post-tag">{post.place.name}</p>
        <Heading className="post-card-title">
          <Link href={blogHref(post.slug)} className="post-card-link">
            {post.title}
          </Link>
        </Heading>
        {full && <p className="post-card-summary">{post.description}</p>}
        <p className="post-meta">
          {full && (
            <>
              <span className="sr-only">{BLOG_TEXT.publishedLabel} </span>
              <time dateTime={post.date}>{dateLabel(post.date)}</time>
              <span aria-hidden="true"> · </span>
            </>
          )}
          {BLOG_TEXT.readTime(post.minutes)}
        </p>
      </div>
    </article>
  );
}
