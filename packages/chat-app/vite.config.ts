import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      'openai-api-mock': path.resolve(__dirname, '../openai-api-mock/dist/index.js'),
    },
  },
}) 