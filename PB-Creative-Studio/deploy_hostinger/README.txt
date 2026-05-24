# PB-Creative-Studio — Hostinger Deployment Guide

## Steps:
1. Upload this ZIP to Hostinger Node.js app root
2. In Hostinger control panel ? Node.js ? set:
   - Entry point: server/app.js
   - Node version: 18+
3. Run in terminal: npm install
4. Click "Restart App"

## Structure:
- server/app.js      ? Main Node.js backend
- apps/*/dist/       ? Built frontend files
- package.json       ? Root dependencies

## URLs after deploy:
- /                  ? Homepage
- /youtubevideodownload/  ? YouTube Downloader
- /tool/             ? Utility Tools Suite
- /health            ? Health check endpoint
