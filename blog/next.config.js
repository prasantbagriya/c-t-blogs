/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  
  images: {
    // ✅ FIX: Image optimization ENABLED (was incorrectly disabled — major LCP/performance loss)
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 86400, // 24-hour browser cache for images
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**.googleusercontent.com' },
      { protocol: 'https', hostname: '**.githubusercontent.com' },
      { protocol: 'https', hostname: 'chatwizs.com' },
    ],
  },
  
  reactCompiler: false,
  experimental: {
    cpus: 1,
    workerThreads: false,
    optimizePackageImports: ['lucide-react', 'framer-motion', 'date-fns'],
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },

  async redirects() {
    return [
      {
        source: '/admin/login',
        destination: '/auth/login',
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
          // ✅ HSTS (only effective when served over HTTPS)
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
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
              "form-action 'self'",
              "upgrade-insecure-requests",
            ].join('; '),
          },
        ],
      },
      // ✅ Admin pages: noindex via X-Robots-Tag header
      {
        source: '/admin/(.*)',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
      {
        source: '/auth/(.*)',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
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
