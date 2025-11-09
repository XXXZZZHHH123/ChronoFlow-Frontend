import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [
    react(),
    // read `baseUrl` + `paths` from tsconfig so "@/..." works in tests
    tsconfigPaths(),
  ],
  // (optional) explicit fallback alias; harmless if also using tsconfigPaths
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['e2e/**', 'playwright/**', 'node_modules/**', 'dist/**'],
    coverage: {
      provider: 'v8',
      all: false,
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.{test,spec}.{ts,tsx}',
        'src/**/__tests__/**',
        'src/**/*.d.ts',
        'src/**/*.stories.@(ts|tsx)',
        'src/**/mocks/**',
        'src/**/types/**',
        'src/**/generated/**',
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/**/index.ts',
      ],
      reportsDirectory: './coverage/unit',
      reporter: ['text', 'html', 'lcov'],
      thresholds: { lines: 70, branches: 60, functions: 60, statements: 70 },
    },
  },
})