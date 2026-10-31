import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      '**/.claude/**',
      '**/dist/**',
      '**/.static/**',
      '**/.wrangler/**',
      '**/build/**',
      '**/.astro/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/test-results/**',
      '**/playwright-report/**',
      'audit/evidence/**/standalone/**',
    ],
  },
  {
    files: ['quality/evidence/**/*.{js,mjs}'],
    languageOptions: {
      globals: {
        URL: 'readonly',
        console: 'readonly',
        process: 'readonly',
        structuredClone: 'readonly',
      },
    },
    rules: {
      'no-redeclare': ['error', { builtinGlobals: false }],
    },
  },
  {
    files: [
      'quality/evidence/step-45/public-v49/high-findings-reaudit/reaudit.mjs',
      'quality/evidence/step-45/public-v49/flagship/inspect-direction-previews.mjs',
    ],
    languageOptions: {
      globals: {
        document: 'readonly',
        getComputedStyle: 'readonly',
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  }
);
