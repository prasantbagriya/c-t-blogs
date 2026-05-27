import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const blogPort = env.BLOG_PORT || '4000';
  const blogProxy = {
    target: `http://127.0.0.1:${blogPort}`,
    changeOrigin: true,
    secure: false,
  };
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      // ── Code Splitting for better PageSpeed scores ──────────────────
      chunkSizeWarningLimit: 700,
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Vendor: React ecosystem
            if (id.includes('node_modules/react-dom/') || id.includes('node_modules/react/') || id.includes('node_modules/react-router-dom/') || id.includes('node_modules/scheduler/')) {
              return 'vendor-react';
            }
            // Vendor: Animation
            if (id.includes('node_modules/motion/') || id.includes('node_modules/framer-motion/')) {
              return 'vendor-motion';
            }
            // Vendor: Firebase
            if (id.includes('node_modules/firebase/')) {
              return 'vendor-firebase';
            }
            // Vendor: Charts
            if (id.includes('node_modules/recharts/') || id.includes('node_modules/d3-') || id.includes('node_modules/victory-')) {
              return 'vendor-charts';
            }
            // Vendor: Flow canvas
            if (id.includes('node_modules/@xyflow/') || id.includes('node_modules/reactflow/')) {
              return 'vendor-flow';
            }
            // Vendor: Icons
            if (id.includes('node_modules/lucide-react/')) {
              return 'vendor-icons';
            }
            // Vendor: PDF/Export tools
            if (id.includes('node_modules/html2canvas/') || id.includes('node_modules/jspdf/')) {
              return 'vendor-pdf';
            }
            // Vendor: All other libraries
            if (id.includes('node_modules/')) {
              return 'vendor-common';
            }

            // App: Social platform components
            if (id.includes('/components/instagram/') || id.includes('/components/threads/')) {
              return 'chunk-social';
            }
            // App: Flow Builder
            if (id.includes('/components/FlowBuilderView') || id.includes('/components/flow/')) {
              return 'chunk-flow-builder';
            }
            // App: API layer
            if (id.includes('/src/api/')) {
              return 'chunk-api';
            }
            // App: Dashboard
            if (id.includes('/components/dashboard/') || id.includes('/components/InboxView') || id.includes('/components/CRMView')) {
              return 'chunk-dashboard';
            }
          },
        },
      },
      // Minify CSS aggressively
      cssMinify: true,
      // Split CSS per chunk for better caching
      cssCodeSplit: true,
      // Inline small assets to avoid extra requests (increased to 8KB)
      assetsInlineLimit: 8192,
      // Skip reporting compressed sizes — speeds up build
      reportCompressedSize: false,
      // P-3 FIX: Strip all console.log and debugger from production build
      // This removes ~25 debug statements — faster execution, no info leaks
      ...(mode === 'production' ? {
        minify: 'esbuild',
        esbuildOptions: {
          drop: ['console', 'debugger'],
          // Tree-shake more aggressively
          treeShaking: true,
          // Minify identifiers
          minifyIdentifiers: true,
          minifySyntax: true,
          minifyWhitespace: true,
        },
      } : {}),
    },
    server: {
      host: '127.0.0.1',
      watch: {
        ignored: ['**/server/**', '**/node_modules/**', '**/dist/**'],
      },
      hmr: {
        protocol: 'ws',
      },
      proxy: {
        '/api/admin': blogProxy,
        '/api/auth/login': blogProxy,
        '/api/og': blogProxy,
        '/api': {
          target: 'http://127.0.0.1:3001',
          changeOrigin: true,
          secure: false,
        },
        '/uploads': {
          target: 'http://127.0.0.1:3001',
          changeOrigin: true,
          secure: false,
        },
        '/shopify-login': {
          target: 'http://127.0.0.1:3001',
          changeOrigin: true,
          secure: false,
        },
        '/sdk': {
          target: 'http://127.0.0.1:3001',
          changeOrigin: true,
          secure: false,
        },
        '/blog': blogProxy,
        '/admin': blogProxy,
        '/auth': blogProxy,
        '/category': blogProxy,
        '/author': blogProxy,
        '/stories': blogProxy,
        '/search': blogProxy,
        '/sitemap.xml': blogProxy,
        '/feed.xml': blogProxy,
        '/news-sitemap.xml': blogProxy,
        '/_next': blogProxy,
      },
    },
  };
});
