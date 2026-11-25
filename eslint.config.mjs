import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import { corePurity } from './tooling/core-purity.mjs';

export default defineConfig(
  {
    ignores: ['dist/**', 'coverage/**', 'node_modules/**', 'public/fonts/**'],
  },
  {
    files: ['**/*.{js,mjs}'],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: {
        Buffer: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
      },
    },
  },
  {
    files: ['**/*.ts'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  {
    files: ['src/core/**/*.{ts,js,mjs}'],
    plugins: {
      echoloop: {
        rules: { 'core-purity': corePurity },
      },
    },
    rules: {
      'echoloop/core-purity': 'error',
      'no-eval': 'error',
      'no-new-func': 'error',
      'no-restricted-globals': [
        'error',
        'Date',
        'performance',
        'window',
        'document',
        'globalThis',
        'self',
        'global',
        'process',
        'crypto',
        'fetch',
        'URL',
        'localStorage',
        'sessionStorage',
        'setTimeout',
        'setInterval',
        'requestAnimationFrame',
        'require',
      ],
    },
  },
);
