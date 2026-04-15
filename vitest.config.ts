import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // happy-dom: supports localStorage + crypto.subtle (better than jsdom for this project)
    environment: 'happy-dom',
    globals: true,
    include: ['src/__tests__/**/*.test.ts', 'src/__tests__/**/*.test.tsx'],
    exclude: ['dist', '.astro', 'node_modules'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/lib/**', 'src/data/**'],
      exclude: ['src/lib/billing-pdf.ts', 'src/lib/billing-seed.ts'],
    },
    setupFiles: ['src/__tests__/setup.ts'],
  },
});
