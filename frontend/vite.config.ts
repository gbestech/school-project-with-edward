// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import tailwindcss from '@tailwindcss/vite'

// export default defineConfig({
//   plugins: [
//     react(),
//     tailwindcss(),
//   ],
// })

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // ✅ Required for aliasing

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // ✅ This enables @/ to point to src/
    },
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/media': {
        target: process.env.VITE_API_URL || 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    rollupOptions: {
      external: ["react-to-print"],
    },
  },
})
