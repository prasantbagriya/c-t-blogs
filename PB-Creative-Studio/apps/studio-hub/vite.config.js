import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/hub/',
  plugins: [
    react(),
    {
      name: 'redirect-to-base',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url) {
            const url = new URL(req.url, 'http://localhost');
            if (url.pathname === '/' || url.pathname === '/hub') {
              res.writeHead(302, { Location: '/hub/' + url.search });
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
    cssMinify: 'esbuild'
  }
})
