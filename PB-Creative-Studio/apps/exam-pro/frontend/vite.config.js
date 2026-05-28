import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ═══════════════════════════════════════════════════════════════
//  EduExam Pro — Vite Config
//  Google PageSpeed 100 build configuration
// ═══════════════════════════════════════════════════════════════
export default defineConfig(({ mode }) => ({
  base: '/portal/',
  plugins: [
    react(),
    {
      name: 'redirect-to-base',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url) {
            const url = new URL(req.url, 'http://localhost');
            if (url.pathname === '/' || url.pathname === '/portal') {
              res.writeHead(302, { Location: '/portal/' + url.search });
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
    chunkSizeWarningLimit: 600,
    assetsInlineLimit: 8192,
    cssCodeSplit: true,
    cssMinify: true,
    reportCompressedSize: false,

    rollupOptions: {
      output: {
        manualChunks(id) {
          // React core (smallest, most stable)
          if (id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/react/') ||
              id.includes('node_modules/scheduler/')) {
            return 'vendor-react';
          }
          // Chart.js + react-chartjs-2 (~200KB — keep separate!)
          if (id.includes('node_modules/chart.js/') ||
              id.includes('node_modules/react-chartjs-2/')) {
            return 'vendor-charts';
          }
          // React Router (separate — used only after login)
          if (id.includes('node_modules/react-router-dom/') ||
              id.includes('node_modules/react-router/')) {
            return 'vendor-router';
          }
          // Lucide icons
          if (id.includes('node_modules/lucide-react/')) {
            return 'vendor-icons';
          }
          // Axios + other utilities
          if (id.includes('node_modules/')) {
            return 'vendor-common';
          }
          // App: Admin pages (only loaded for admin users)
          if (id.includes('/pages/admin/')) {
            return 'chunk-admin';
          }
          // App: Student pages (only loaded for students)
          if (id.includes('/pages/student/')) {
            return 'chunk-student';
          }
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

  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:3500',
        changeOrigin: true,
      }
    }
  }
}))

