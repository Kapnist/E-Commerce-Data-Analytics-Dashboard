import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/E-Commerce-Data-Analytics-Dashboard/',
  optimizeDeps: {
    include: ['react-simple-maps', 'react-is', 'prop-types']
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
})
