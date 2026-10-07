import { Badge } from '@/components/badge';
import { PixelButton } from '@/components/pixel-button';
import { BLOG_TEXT, blogHref } from '@/lib/constants';
import type { BlogCardView } from '@/lib/types';
import { dateLabel } from '@/lib/utils';
import { PostScene } from './post-scene';

/**
 * The newest post, big (Sigmorai Blog.dc.html → featured): scene beside the
 * text on a wide screen, above it on a phone. Styles: blog.css.
 */
export function FeaturedPost({ post }: { post: BlogCardView }) {
  return (
    <article
      className="featured-post"
      data-accent={post.place.accent}
      aria-labelledby="featured-title"
    >
      <PostScene
        cover={post.cover}
        sizes="(min-width: 1024px) 600px, 100vw"
        preload
        className="featured-post-scene"
      />
      <div className="featured-post-body">
        <p className="featured-post-tags">
          <Badge accent="xp">{BLOG_TEXT.featured}</Badge>
          <span className="post-tag">{post.place.name}</span>
        </p>
        <h2 id="featured-title" className="featured-post-title">
          {post.title}
        </h2>
        <p className="featured-post-summary">{post.description}</p>
        <p className="post-meta">
          <span className="sr-only">{BLOG_TEXT.publishedLabel} </span>
          <time dateTime={post.date}>{dateLabel(post.date)}</time>
          <span aria-hidden="true"> · </span>
          {BLOG_TEXT.readTime(post.minutes)}
        </p>
        <div>
          <PixelButton href={blogHref(post.slug)} aria-describedby="featured-title">
            {BLOG_TEXT.readGuide}
            <span aria-hidden="true">{BLOG_TEXT.readGuideIcon}</span>
          </PixelButton>
        </div>
      </div>
    </article>
  );
}
