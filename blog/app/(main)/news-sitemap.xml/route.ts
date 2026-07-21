import { getPosts } from '@/lib/db';
import { NextResponse } from 'next/server';

const BASE_URL = 'https://chatwizs.com';
const PUBLICATION_NAME = 'ChatWizs';

export const dynamic = 'force-dynamic';
export const revalidate = 1800; // Regenerate every 30 minutes

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const posts = await getPosts();
  
  // ✅ Google News requirements: Must only include articles published in the last 48 hours
  // Fallback: If no articles are in the last 48 hours, show the latest 5 published articles to prevent blank sitemap errors.
  const now = new Date();
  const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

  let newsPosts = posts.filter(p => {
    if (!p.published) return false;
    const pubDate = new Date(p.date);
    return pubDate >= fortyEightHoursAgo;
  });

  // Strict Google News compliance: We strictly only include articles published in the last 48 hours.
  // Including older articles as a fallback causes Google Search Console to throw "Publication date too old" validation errors.

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  ${newsPosts
    .map(post => {
      const loc = `${BASE_URL}/blog/${post.slug}`;
      const pubDate = new Date(post.date).toISOString(); // Format: YYYY-MM-DDThh:mm:ssTZD
      return `
  <url>
    <loc>${loc}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(PUBLICATION_NAME)}</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${escapeXml(post.title)}</news:title>
    </news:news>
  </url>`;
    })
    .join('')}
</urlset>`;

  return new NextResponse(sitemapXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
