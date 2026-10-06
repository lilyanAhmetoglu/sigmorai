/**
 * schema.org structured data (JSON-LD) for search engines and AI search.
 * Pure: the pages pass the site URL and the post; <JsonLd> renders it.
 * Only two shapes (SIG-39): WebSite + Organization on the landing page, and
 * BlogPosting (a kind of Article) on each blog post. No Course schema.
 */
import { blogHref, SITE_DESCRIPTION, SITE_NAME } from '@/lib/constants';
import type { BlogPost } from '@/lib/types';
import { absoluteUrl } from '@/lib/utils';

export type JsonLdObject = { '@context': 'https://schema.org' } & Record<string, unknown>;

const CONTEXT = 'https://schema.org' as const;
const organizationId = (siteUrl: string) => `${absoluteUrl(siteUrl, '/')}#organization`;

/** The landing page: who runs the site, and the site itself. */
export function siteJsonLd(siteUrl: string): JsonLdObject {
  const url = absoluteUrl(siteUrl, '/');
  return {
    '@context': CONTEXT,
    '@graph': [
      { '@type': 'Organization', '@id': organizationId(siteUrl), name: SITE_NAME, url },
      {
        '@type': 'WebSite',
        '@id': `${url}#website`,
        name: SITE_NAME,
        url,
        description: SITE_DESCRIPTION,
        inLanguage: 'en',
        publisher: { '@id': organizationId(siteUrl) },
      },
    ],
  };
}

type ArticlePost = Pick<BlogPost, 'date' | 'slug'> & {
  frontmatter: Pick<BlogPost['frontmatter'], 'title' | 'description'>;
};

/** One blog post. Posts have no author field, so the author is the site. */
export function articleJsonLd(post: ArticlePost, siteUrl: string): JsonLdObject {
  const url = absoluteUrl(siteUrl, blogHref(post.slug));
  const site = { '@type': 'Organization', '@id': organizationId(siteUrl), name: SITE_NAME };
  return {
    '@context': CONTEXT,
    '@type': 'BlogPosting',
    headline: post.frontmatter.title,
    description: post.frontmatter.description,
    datePublished: post.date,
    url,
    mainEntityOfPage: url,
    inLanguage: 'en',
    author: site,
    publisher: site,
  };
}

/**
 * JSON for a <script type="application/ld+json">. `<` becomes < so a
 * value can never close the script tag (Next.js JSON-LD guide).
 */
export const serializeJsonLd = (data: JsonLdObject) =>
  JSON.stringify(data).replace(/</g, '\\u003c');
