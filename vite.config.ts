import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-vite-plugin'

// https://vite.dev/config/
export default defineConfig({
  // Base path for GitHub Pages project site: https://<user>.github.io/bgg-collection-aggregator/
  base: '/bgg-collection-aggregator/',
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
