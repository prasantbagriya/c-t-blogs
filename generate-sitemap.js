import fs from 'fs';
import path from 'path';

const SITE_URL = 'https://chatwizs.com'; // Extracted from canonical URL in posts.json

const staticRoutes = [
  '/',
  '/services',
  '/about-us',
  '/contact-us',
  '/privacy-policy',
  '/terms-of-service',
  '/artists',
  '/success-stories',
  '/pricing',
  '/careers',
  '/deletion',
  '/whatsapp-link-generator',
  '/whatsapp-direct-message',
  '/whatsapp-form-generator',
  '/tool',
  '/tool/sip-calculator',
  '/tool/compound-interest',
  '/tool/prop-firm',
  '/youtubevideodownload',
  '/get-started',
  '/blog',
  '/playbook',
  '/playbook/login',
  '/playbook/admin',
  '/portal',
  '/portal/student/login',
  '/portal/admin/login',
  '/portal/about-us',
  '/portal/contact-us',
  '/portal/privacy-policy',
  '/portal/terms-and-conditions',
  '/portal/cookies-policy',
  '/portal/refund-policy'
];

async function generateSitemap() {
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Add static routes
  for (const route of staticRoutes) {
    sitemap += `  <url>\n    <loc>${SITE_URL}${route}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${route === '/' ? '1.0' : '0.8'}</priority>\n  </url>\n`;
  }

  // Add blog routes
  const postsPath = path.join(process.cwd(), 'blog', 'data', 'posts.json');
  if (fs.existsSync(postsPath)) {
    const postsData = fs.readFileSync(postsPath, 'utf8');
    const posts = JSON.parse(postsData);
    
    for (const post of posts) {
      if (post.published && post.slug) {
        sitemap += `  <url>\n    <loc>${SITE_URL}/blog/${post.slug}</loc>\n    <lastmod>${post.lastModified || post.date}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
      }
    }
  }

  // Add playbook routes
  const playbooksPath = path.join(process.cwd(), 'server', 'data', 'playbooks.json');
  if (fs.existsSync(playbooksPath)) {
    const playbooksData = fs.readFileSync(playbooksPath, 'utf8');
    const playbooks = JSON.parse(playbooksData);
    
    for (const playbook of playbooks) {
      if (playbook.isActive && playbook.slug) {
        // Use the updated timestamp for lastmod
        const dateObj = new Date(playbook.updatedAt || playbook.createdAt);
        const lastmod = isNaN(dateObj.getTime()) ? new Date().toISOString() : dateObj.toISOString();
        sitemap += `  <url>\n    <loc>${SITE_URL}/playbook/${playbook.slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
      }
    }
  }

  sitemap += `</urlset>`;

  // Write to public directory for Vite
  const publicPath = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicPath)) {
    fs.mkdirSync(publicPath, { recursive: true });
  }
  
  fs.writeFileSync(path.join(publicPath, 'sitemap.xml'), sitemap);
  console.log('Sitemap successfully generated at public/sitemap.xml');
}

generateSitemap();
