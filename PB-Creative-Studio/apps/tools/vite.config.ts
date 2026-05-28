import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ═══════════════════════════════════════════════════════════════
//  DevForge Tools — Vite Config
//  Google PageSpeed 100 build configuration
// ═══════════════════════════════════════════════════════════════
export default defineConfig(({ mode }) => ({
  base: '/tool/',
  plugins: [
    react(),
    {
      name: 'redirect-to-base',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url) {
            const url = new URL(req.url, 'http://localhost');
            if (url.pathname === '/' || url.pathname === '/tool') {
              res.writeHead(302, { Location: '/tool/' + url.search });
              res.end();
              return;
            }
          }
          next();
        });
      }
    }
  ],

  build: {
    chunkSizeWarningLimit: 500,
    assetsInlineLimit: 8192,
    cssCodeSplit: true,
    cssMinify: true,
    reportCompressedSize: false,

    rollupOptions: {
      output: {
        manualChunks(id) {
          // React core
          if (id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/react/') ||
              id.includes('node_modules/scheduler/')) {
            return 'vendor-react';
          }
          // Chart.js — heavy, used only in tool pages
          if (id.includes('node_modules/chart.js/') ||
              id.includes('node_modules/react-chartjs-2/')) {
            return 'vendor-charts';
          }
          // React Router
          if (id.includes('node_modules/react-router-dom/') ||
              id.includes('node_modules/react-router/')) {
            return 'vendor-router';
          }
          // Icons
          if (id.includes('node_modules/lucide-react/')) {
            return 'vendor-icons';
          }
          // Other deps
          if (id.includes('node_modules/')) {
            return 'vendor-common';
          }
          // Tool pages — each gets its own lazy chunk
          if (id.includes('/pages/SIPCalculator')) return 'tool-sip';
          if (id.includes('/pages/CompoundInterest')) return 'tool-compound';
          if (id.includes('/pages/PropFirm')) return 'tool-propfirm';
        },

        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },

    ...(mode === 'production' ? {
      minify: 'esbuild',
      esbuildOptions: {
        drop: ['console', 'debugger'],
        treeShaking: true,
        minifyIdentifiers: true,
        minifySyntax: true,
        minifyWhitespace: true,
      },
    } : {}),
  },
}))

