/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte(), tailwindcss()],
  base: './',
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../shared'),
      '@gphone/sdk': path.resolve(__dirname, './src/sdk/index.ts')
    },
    conditions: ['browser']
  },
  build: {
    outDir: '../dist/web',
    emptyOutDir: true,
    target: 'chrome92',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts']
  }
})
