import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_|error',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      'prefer-const': 'off',
      'no-unused-vars': 'off',
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'next/link',
              message:
                "Use { Link } from '@/components/Link': it prefetches on hover instead of in the viewport.",
            },
          ],
        },
      ],
    },
  },
  {
    // the wrapper itself, and the header nav (Header, NavLink), which keeps
    // viewport prefetching
    files: [
      'src/components/Link/**',
      'src/components/Header/**',
      'src/components/NavLink/**',
    ],
    rules: { 'no-restricted-imports': 'off' },
  },
]);

export default eslintConfig;
