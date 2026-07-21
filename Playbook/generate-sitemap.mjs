import admin from 'firebase-admin';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Firebase Admin (Using your project ID from .env)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(), // Assumes you have GOOGLE_APPLICATION_CREDENTIALS set or you're running locally.
    projectId: process.env.VITE_FIREBASE_PROJECT_ID
  });
}

const db = admin.firestore();

async function generateSitemap() {
  console.log("Fetching active playbooks for sitemap...");
  const snapshot = await db.collection("playbooks").where("isActive", "==", true).get();
  
  const siteUrl = "https://your-domain.com"; // Replace with your actual domain when deploying
  
  const urls = snapshot.docs.map(doc => {
    // Generate a clean URL for the playbook
    return `  <url>
    <loc>${siteUrl}/playbook?id=${doc.id}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
${urls.join('\n')}
</urlset>`;

  fs.writeFileSync('public/sitemap.xml', sitemap);
  console.log(`Successfully generated sitemap.xml with ${snapshot.size + 1} URLs.`);
}

generateSitemap().catch(console.error);
