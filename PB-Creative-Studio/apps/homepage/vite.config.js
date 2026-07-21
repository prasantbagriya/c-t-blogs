import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ═══════════════════════════════════════════════════════════════
//  Studio Homepage — Vite Config
//  Google PageSpeed 100 build configuration
// ═══════════════════════════════════════════════════════════════
export default defineConfig(({ mode }) => ({
  plugins: [react()],

  build: {
    outDir: '../../server/public',
    emptyOutDir: false,
    // Warn when chunks > 600KB
    chunkSizeWarningLimit: 600,

    // Inline small assets (< 8KB) to reduce HTTP requests
    assetsInlineLimit: 8192,

    // Split CSS per chunk for better caching
    cssCodeSplit: true,

    // Minify CSS aggressively
    cssMinify: true,

    // Skip compressed size reporting (speeds up build)
    reportCompressedSize: false,

    rollupOptions: {
      output: {
        // Manual chunk splitting for optimal caching
        manualChunks(id) {
          // React core — changes least often
          if (id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/react/') ||
              id.includes('node_modules/scheduler/')) {
            return 'vendor-react';
          }
          // Framer Motion — heavy animation library (150KB+)
          if (id.includes('node_modules/framer-motion/') ||
              id.includes('node_modules/motion/')) {
            return 'vendor-motion';
          }
          // Lucide icons
          if (id.includes('node_modules/lucide-react/')) {
            return 'vendor-icons';
          }
          // All other node_modules
          if (id.includes('node_modules/')) {
            return 'vendor-common';
          }
        },

        // Consistent file naming for long-term caching
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },

    // Production-only: aggressive minification + tree shaking
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

