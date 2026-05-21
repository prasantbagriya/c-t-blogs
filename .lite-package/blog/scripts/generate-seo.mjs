import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import path from 'path';

const BASE_URL = 'https://chatwizs.com';

function escapeXml(unsafe) {
  if (unsafe === undefined || unsafe === null) return '';
  return String(unsafe).replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

async function generateSeoAssets() {
  console.log('--- GENERATING STATIC SEO ASSETS (ADVANCED V2.0) ---');
  
  const dataDir = path.join(process.cwd(), 'data');
  const postsPath = path.join(dataDir, 'posts.json');
  const storiesPath = path.join(dataDir, 'stories.json');

  let posts = [];
  let stories = [];

  try {
    if (existsSync(postsPath)) {
      posts = JSON.parse(readFileSync(postsPath, 'utf-8'));
    }
    if (existsSync(storiesPath)) {
      stories = JSON.parse(readFileSync(storiesPath, 'utf-8'));
    }
  } catch (e) {
    console.error('Error reading data for sitemap:', e);
  }

  const publishedPosts = posts.filter(p => p && p.published);
  const publishedStories = stories.filter(s => s && s.published);

  // 1. Standard Sitemap (with Image and Geographic hreflang support)
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${BASE_URL}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="en-IN" href="${BASE_URL}/" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}/" />
  </url>
  <url>
    <loc>${BASE_URL}/blog</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="en-IN" href="${BASE_URL}/blog" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}/blog" />
  </url>
  <url>
    <loc>${BASE_URL}/stories</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="en-IN" href="${BASE_URL}/stories" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}/stories" />
  </url>
  <url><loc>${BASE_URL}/about</loc><lastmod>${new Date().toISOString().split('T')[0]}</lastmod><priority>0.7</priority></url>
  <url><loc>${BASE_URL}/contact</loc><lastmod>${new Date().toISOString().split('T')[0]}</lastmod><priority>0.5</priority></url>
  <url><loc>${BASE_URL}/editorial-policy</loc><lastmod>${new Date().toISOString().split('T')[0]}</lastmod><changefreq>yearly</changefreq><priority>0.6</priority></url>
  <url><loc>${BASE_URL}/fact-checking-policy</loc><lastmod>${new Date().toISOString().split('T')[0]}</lastmod><changefreq>yearly</changefreq><priority>0.6</priority></url>
  <url><loc>${BASE_URL}/privacy</loc><lastmod>${new Date().toISOString().split('T')[0]}</lastmod><changefreq>yearly</changefreq><priority>0.4</priority></url>
  <url><loc>${BASE_URL}/terms</loc><lastmod>${new Date().toISOString().split('T')[0]}</lastmod><changefreq>yearly</changefreq><priority>0.4</priority></url>
  ${publishedPosts.map(p => {
    const loc = escapeXml(`${BASE_URL}/blog/${p.slug}`);
    const imgLoc = escapeXml(p.coverImage.startsWith('http') ? p.coverImage : BASE_URL + p.coverImage);
    const title = escapeXml(p.title);
    const targetLang = p.targetLanguage || 'en-IN';
    return `
  <url>
    <loc>${loc}</loc>
    <lastmod>${p.lastModified || p.date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="${targetLang}" href="${loc}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${loc}" />
    <image:image>
      <image:loc>${imgLoc}</image:loc>
      <image:title>${title}</image:title>
    </image:image>
  </url>`;
  }).join('')}
  ${publishedStories.map(s => {
    const loc = escapeXml(`${BASE_URL}/stories/${s.slug}`);
    const imgLoc = escapeXml(s.posterImage.startsWith('http') ? s.posterImage : BASE_URL + s.posterImage);
    const title = escapeXml(s.title);
    return `
  <url>
    <loc>${loc}</loc>
    <lastmod>${s.lastModified || s.date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="en-IN" href="${loc}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${loc}" />
    <image:image>
      <image:loc>${imgLoc}</image:loc>
      <image:title>${title}</image:title>
    </image:image>
  </url>`;
  }).join('')}
</urlset>`;

  // 2. News Sitemap (Hardened for Google News Approval)
  let newsSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  ${publishedPosts.slice(0, 100).map(p => {
    const loc = escapeXml(`${BASE_URL}/blog/${p.slug}`);
    const title = escapeXml(p.title);
    return `
  <url>
    <loc>${loc}</loc>
    <news:news>
      <news:publication>
        <news:name>ChatWizs</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${new Date(p.date).toISOString()}</news:publication_date>
      <news:title>${title}</news:title>
    </news:news>
  </url>`;
  }).join('')}
</urlset>`;

  // 3. RSS Feed (Full Content Simulation for Feed Readers)
  let rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/">
<channel>
  <title>ChatWizs Blog</title>
  <link>${BASE_URL}</link>
  <description>Expert SEO and Technology Insights for 2026</description>
  <language>en-us</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />
  ${publishedPosts.slice(0, 20).map(p => {
    const title = escapeXml(p.title);
    const link = escapeXml(`${BASE_URL}/blog/${p.slug}`);
    const creator = escapeXml(p.author || 'ChatWizs Team');
    const category = escapeXml(p.category);
    return `
  <item>
    <title>${title}</title>
    <link>${link}</link>
    <description><![CDATA[${p.excerpt}]]></description>
    <pubDate>${new Date(p.date).toUTCString()}</pubDate>
    <guid isPermaLink="true">${link}</guid>
    <dc:creator>${creator}</dc:creator>
    <category>${category}</category>
  </item>`;
  }).join('')}
</channel>
</rss>`;

  // 4. Robots.txt (Crawler Efficiency Tuning)
  let robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/admin
Disallow: /auth
Disallow: /_next
Disallow: /api/

# Googlebot-specific: allow JS/CSS for rendering
User-agent: Googlebot
Allow: /_next/static/
Allow: /api/public/

# Crawl delay for non-priority bots
User-agent: Bingbot
Crawl-delay: 10

# Sitemaps
Sitemap: ${BASE_URL}/sitemap.xml
Sitemap: ${BASE_URL}/news-sitemap.xml`;

  const publicDir = path.join(process.cwd(), 'public');
  if (!existsSync(publicDir)) mkdirSync(publicDir);

  writeFileSync(path.join(publicDir, 'feed.xml'), rss);
  writeFileSync(path.join(publicDir, 'robots.txt'), robots);
  
  console.log('✅ Advanced SEO Assets Successfully Deployed');
}

generateSeoAssets().catch(console.error);
