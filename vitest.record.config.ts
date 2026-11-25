import { defineConfig } from 'vitest/config';

console.warn(
  'GOLDEN RECORD MODE — explicit recording only. Preserve existing hashes.',
);

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/golden/**/*.record.ts'],
    passWithNoTests: false,
    fileParallelism: false,
  },
});
