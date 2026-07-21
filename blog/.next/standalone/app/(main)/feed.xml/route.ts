import { getPosts } from '@/lib/db';
import { NextResponse } from 'next/server';

const BASE_URL = 'https://chatwizs.com';
const FEED_TITLE = 'ChatWizs — Expert SEO & Tech Insights';
const FEED_DESCRIPTION = 'Expert-verified articles on SEO, technology, and digital marketing. Built for Google 2026 EEAT standards.';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

// ✅ Escape XML special characters
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
  const publishedPosts = posts
    .filter(p => p.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 20); // Latest 20 posts in feed

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${escapeXml(FEED_TITLE)}</title>
    <link>${BASE_URL}</link>
    <description>${escapeXml(FEED_DESCRIPTION)}</description>
    <language>en-US</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${BASE_URL}/logo.png</url>
      <title>${escapeXml(FEED_TITLE)}</title>
      <link>${BASE_URL}</link>
      <width>512</width>
      <height>512</height>
    </image>
    <managingEditor>editorial@chatwizs.com (ChatWizs Editorial Team)</managingEditor>
    <webMaster>support@chatwizs.com (ChatWizs)</webMaster>
    <category>Technology</category>
    <category>SEO</category>
    <ttl>60</ttl>
    ${publishedPosts
      .map(post => {
        const postUrl = `${BASE_URL}/blog/${post.slug}`;
        const pubDate = new Date(post.date).toUTCString();
        const excerpt = escapeXml(post.metaDescription || post.excerpt || '');
        return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description>${excerpt}</description>
      <content:encoded><![CDATA[${post.content}]]></content:encoded>
      <pubDate>${pubDate}</pubDate>
      <dc:creator>${escapeXml(post.author || 'ChatWizs Editorial Team')}</dc:creator>
      <category>${escapeXml(post.category)}</category>
      ${(post.tags || []).map(tag => `<category>${escapeXml(tag)}</category>`).join('\n      ')}
      <media:thumbnail url="${post.coverImage}" />
      <media:content url="${post.coverImage}" medium="image"/>
    </item>`;
      })
      .join('')}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
