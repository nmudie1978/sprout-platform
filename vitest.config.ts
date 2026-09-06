import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
    exclude: ['node_modules', '.next', 'dist'],
    /**
     * Vitest defaults to 5s. Several matching tests rank the full
     * 1,615-career catalog — `adversarial-scenarios` does it once per
     * persona — which takes a few hundred ms alone but crosses 5s when 174
     * test files run in parallel on a loaded machine. That produced two
     * spurious pre-commit failures on a docs-only change, and a green suite
     * moments earlier, which is the worst kind of signal: it teaches you to
     * ignore red.
     *
     * 20s is comfortably above the real cost and still well below anything
     * that would hide a genuine hang.
     */
    testTimeout: 20_000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/types/*',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
