import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

// https://vite.dev/config/
export default defineConfig({
  base: '/youtubevideodownload/',
  plugins: [
    react(),
    {
      name: 'redirect-to-base',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url) {
            const url = new URL(req.url, 'http://localhost');
            if (url.pathname === '/' || url.pathname === '/youtubevideodownload') {
              res.writeHead(302, { Location: '/youtubevideodownload/' + url.search });
              res.end();
              return;
            }
          }
          next();
        });
      }
    }
  ],
  server: {
    proxy: {
      '/youtubevideodownload/info': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/youtubevideodownload/download': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: '../../server/public/youtubevideodownload',
    emptyOutDir: true,
  },
  css: {
    postcss: {
      plugins: [tailwindcss(), autoprefixer()],
    },
  },
})
