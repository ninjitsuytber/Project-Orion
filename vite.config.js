import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 5173,
    strictPort: true,
    watch: {
      ignored: [
        '**/backend/**',
        '**/__pycache__/**',
        '**/dist/**',
        '**/*.py',
        '**/*.pyc',
        '**/*.sql',
      ],
    },
    hmr: {
      timeout: 10000,
    },
  },
})
