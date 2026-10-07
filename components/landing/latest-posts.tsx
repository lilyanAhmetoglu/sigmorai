import { PostCard } from '@/components/blog/post-card';
import { PixelButton } from '@/components/pixel-button';
import { BLOG_HREF, LANDING_TEXT } from '@/lib/constants';
import type { BlogCardView } from '@/lib/types';

type Props = { posts: readonly BlogCardView[] };

/**
 * The newest blog posts (blog cards, h3 under this section's h2), then a
 * link to the blog. Renders nothing when there are no posts yet.
 * Styles: blog.css (.post-grid, .post-card) + landing.css.
 */
export function LatestPosts({ posts }: Props) {
  if (posts.length === 0) return null;
  return (
    <section className="landing-section" aria-labelledby="posts-title">
      <div className="landing-section-head">
        <p className="landing-kicker">{LANDING_TEXT.blogEyebrow}</p>
        <h2 id="posts-title" className="landing-h2">
          {LANDING_TEXT.blogTitle}
        </h2>
      </div>
      <ul className="post-grid">
        {posts.map((post) => (
          <li key={post.slug}>
            <PostCard post={post} />
          </li>
        ))}
      </ul>
      <div className="landing-cta">
        <PixelButton href={BLOG_HREF} variant="secondary">
          {LANDING_TEXT.blogAll}
        </PixelButton>
      </div>
    </section>
  );
}
