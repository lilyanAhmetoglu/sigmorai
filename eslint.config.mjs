import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettierConfig from 'eslint-config-prettier';

// Every model call goes through lib/mentor, every code run through lib/runner,
// and every database read/write through db/ + lib/actions (AGENTS.md → Layout).
// UI and pure domain code never import a provider SDK or the DB client.
const SERVER_ONLY = [
  '@clerk/nextjs/server',
  '@anthropic-ai/sdk',
  'e2b',
  '@e2b/code-interpreter',
  '@vercel/blob',
  '@/db',
];

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  prettierConfig,
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'drizzle/**',
    '.claude/skills/*/templates/**',
    'design/**',
    '.claude/worktrees/**',
  ]),
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      // Zod schemas and their inferred types share a name on purpose.
      '@typescript-eslint/no-redeclare': 'off',
      'no-duplicate-imports': 'error',
    },
  },
  {
    files: [
      'components/**',
      'lib/xp/**',
      'lib/sprite/**',
      'lib/utils/**',
      'lib/types/**',
      'lib/constants/**',
      'app/**/page.tsx',
      'app/**/layout.tsx',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: SERVER_ONLY.map((name) => ({
            name,
            message:
              'Go through lib/mentor, lib/runner, lib/actions or lib/data — never call a provider or the DB from UI or domain code.',
          })),
        },
      ],
    },
  },
]);
