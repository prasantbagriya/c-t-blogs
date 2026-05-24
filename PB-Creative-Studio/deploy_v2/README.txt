# PB Creative Studio — Hostinger Deployment

## Hostinger Setup:
1. Upload & extract this ZIP in your Node.js app root
2. Entry File: app.js  (root level — NOT server/app.js)
3. Node.js version: 18+
4. Run: npm install
5. Restart the app

## Structure:
app.js                        ? ENTRY POINT (root)
package.json
apps/
  homepage/dist/              ? Homepage static files
  downloader/dist/            ? YouTube Downloader static files
  tools/dist/                 ? Tools Suite static files

## Live Routes:
/                             ? Homepage
/youtubevideodownload/        ? YouTube Downloader
/tool/                        ? Utility Tools
/health                       ? Server health check
