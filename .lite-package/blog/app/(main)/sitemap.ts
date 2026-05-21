import { MetadataRoute } from 'next';
import { getPosts, getStories } from '@/lib/db';

const BASE_URL = 'https://chatwizs.com';

// ✅ DYNAMIC SITEMAP: Auto-generated from live database
// Google gets accurate lastmod → better crawl budget allocation
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Regenerate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, stories] = await Promise.all([getPosts(), getStories()]);

  // ✅ GSC: Only include published AND indexable pages (filter noIndex)
  const publishedPosts = posts.filter(p => p.published && !p.isNoIndex);
  const publishedStories = stories.filter(s => s.published && !s.isNoIndex);

  // ✅ Static core pages
  // NOTE: changefreq and priority REMOVED — Google explicitly ignores both
  // https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
    },
    {
      url: `${BASE_URL}/stories`,
      lastModified: new Date(),
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date('2025-01-01'),
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date('2025-01-01'),
    },
    {
      url: `${BASE_URL}/editorial-policy`,
      lastModified: new Date('2025-01-01'),
    },
    {
      url: `${BASE_URL}/fact-checking-policy`,
      lastModified: new Date('2025-01-01'),
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date('2025-01-01'),
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date('2025-01-01'),
    },
  ];

  // ✅ Dynamic blog post pages (only indexable)
  const postPages: MetadataRoute.Sitemap = publishedPosts.map(post => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.lastModified
      ? new Date(post.lastModified)
      : new Date(post.date),
  }));

  // ✅ Dynamic category pages — hardened against missing category crash
  const categories = Array.from(
    new Set(
      publishedPosts
        .filter(p => p && typeof p.category === 'string' && p.category.trim() !== '')
        .map(p => p.category.toLowerCase().replace(/ /g, '-'))
    )
  );
  const categoryPages: MetadataRoute.Sitemap = categories.map(cat => ({
    url: `${BASE_URL}/category/${cat}`,
    lastModified: new Date(),
  }));

  // ✅ Dynamic author pages
  const authorSlugs = Array.from(
    new Set(
      publishedPosts
        .filter(p => p.author)
        .map(p => p.author.toLowerCase().replace(/ /g, '-'))
    )
  );
  const authorPages: MetadataRoute.Sitemap = authorSlugs.map(slug => ({
    url: `${BASE_URL}/author/${slug}`,
    lastModified: new Date(),
  }));

  // ✅ Dynamic web stories pages (only indexable)
  const storyPages: MetadataRoute.Sitemap = publishedStories.map(story => ({
    url: `${BASE_URL}/stories/${story.slug}`,
    lastModified: story.lastModified
      ? new Date(story.lastModified)
      : new Date(story.date),
  }));

  return [
    ...staticPages,
    ...postPages,
    ...categoryPages,
    ...authorPages,
    ...storyPages,
  ];
}
