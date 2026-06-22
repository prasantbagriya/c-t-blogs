/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  turbopack: {
    root: __dirname,
  },
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  trailingSlash: true,
  
  images: {
    // FIX: Set unoptimized: true to prevent 500 Internal Server Errors on Hostinger.
    // Sharp binaries built on Windows don't work on Linux, and image optimization uses too much RAM.
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 604800,
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**.googleusercontent.com' },
      { protocol: 'https', hostname: '**.githubusercontent.com' },
      { protocol: 'https', hostname: 'chatwizs.com' },
      { protocol: 'https', hostname: '**.cloudinary.com' }, // Future CDN
      { protocol: 'https', hostname: '**.imgur.com' },
    ],
  },
  
  reactCompiler: false,
  experimental: {
    // FIX: Auto-detect CPU count for optimal build parallelism
    // (was hardcoded to 1 which is very slow on multi-core machines)
    cpus: Math.max(1, (require('os').cpus().length || 1) - 1),
    workerThreads: true,
    optimizePackageImports: ['date-fns', '@radix-ui/react-icons'],
    serverActions: {
      bodySizeLimit: '10mb',
      allowedOrigins: ['chatwizs.com', 'www.chatwizs.com', 'localhost:3001', 'localhost:4000', '127.0.0.1:4000', 'localhost:4289', '127.0.0.1:4289']
    },
    // FIX: Router cache staleTimes — reduce re-fetching on back navigation
    staleTimes: {
      dynamic: 30,   // 30s for dynamic pages
      static: 300,   // 5 min for static pages (increased from 3 min)
    },
  },
  async redirects() {
    return [
      {
        source: '/blog/admin/login',
        destination: '/blog/auth/login',
        permanent: true,
      },
      {
        source: '/admin/login',
        destination: '/blog/auth/login',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.chatwizs.com' }],
        destination: 'https://chatwizs.com/:path*',
        permanent: true,
      },
    ];
  },

  // ✅ Security & Performance Headers — Google Page Experience + Trust Signals
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // ✅ Prevent clickjacking (security trust signal)
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // ✅ Prevent MIME type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // ✅ XSS protection for older browsers
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          // ✅ Referrer policy for privacy compliance
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // ✅ Permissions policy — restrict unnecessary browser APIs
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
          // ✅ HSTS (only effective when served over HTTPS) - apply only in production
          ...(process.env.NODE_ENV === 'production' ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }] : []),
          // ✅ Content-Security-Policy — critical Google security trust signal
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://cdn.ampproject.org https://pagead2.googlesyndication.com https://*.googlesyndication.com https://adservice.google.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https: http:",
              "media-src 'self' https:",
              "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net https://pagead2.googlesyndication.com",
              "frame-src 'self' https://*.youtube.com https://*.youtube-nocookie.com https://googleads.g.doubleclick.net https://*.doubleclick.net https://*.google.com https://*.googlesyndication.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self' http://localhost:* http://127.0.0.1:* https://chatwizs.com",
              process.env.NODE_ENV === 'production' ? "upgrade-insecure-requests" : ""
            ].filter(Boolean).join('; '),
          },
        ],
      },
      // ✅ Admin pages: noindex via X-Robots-Tag header and NO CACHE to prevent Nginx caching the login redirect
      {
        source: '/blog/admin/(.*)',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
        ],
      },
      {
        source: '/blog/admin',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
        ],
      },
      {
        source: '/blog/auth/(.*)',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
        ],
      },
      {
        source: '/blog/auth',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
        ],
      },
      // ✅ Static assets: aggressive caching for CWV
      {
        source: '/icons/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/uploads/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
        ],
      },
      // ✅ Sitemap + Feed: cache for 1 hour
      {
        source: '/sitemap.xml',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600, stale-while-revalidate=86400' },
        ],
      },
      {
        source: '/feed.xml',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600, stale-while-revalidate=86400' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
