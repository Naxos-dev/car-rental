import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    // Keeps API calls same-origin from the browser's point of view (localhost:5173) so the
    // Content-Security-Policy's connect-src 'self' covers them without being relaxed — Vite
    // forwards to the local Express server (npm run dev:api) behind the scenes.
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
})
