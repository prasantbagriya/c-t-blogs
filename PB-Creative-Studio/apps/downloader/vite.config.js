import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

// https://vite.dev/config/
export default defineConfig({
  base: '/youtubevideodownload/',
  plugins: [react()],
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
  css: {
    postcss: {
      plugins: [tailwindcss(), autoprefixer()],
    },
  },
})
