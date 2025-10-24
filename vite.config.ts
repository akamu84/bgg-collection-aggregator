import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-vite-plugin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), TanStackRouterVite()],
  server: {
    proxy: {
      '/bgg': {
        target: 'https://boardgamegeek.com/xmlapi2',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/bgg/, ''),
      },
    },
  },
})
