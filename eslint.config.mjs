import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettierConfig from 'eslint-config-prettier';
import unusedImports from 'eslint-plugin-unused-imports';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // Reglas Reha.mx — alineadas con CLAUDE.md
  // El plugin `import` ya viene cargado por eslint-config-next/typescript;
  // solo declaramos los plugins extra (unused-imports) y configuramos sus reglas.
  {
    plugins: {
      'unused-imports': unusedImports,
    },
    settings: {
      'import/resolver': {
        typescript: { project: './tsconfig.json' },
        node: true,
      },
    },
    rules: {
      // Regla 1 CLAUDE.md: TS estricto sin any
      '@typescript-eslint/no-explicit-any': 'error',

      // Type imports separados (tree-shaking + claridad)
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],

      // Imports limpios (auto-fix on save)
      'unused-imports/no-unused-imports': 'error',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],

      // Regla 4 CLAUDE.md: no barrel files (no defaults excepto en archivos Next)
      'import/no-default-export': 'error',

      // Orden de imports estable
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'type'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
          pathGroups: [{ pattern: '@/**', group: 'internal', position: 'after' }],
          pathGroupsExcludedImportTypes: ['type'],
        },
      ],

      // Regla 11 CLAUDE.md: service role SOLO en admin
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/lib/supabase/service'],
              message:
                'Service role key SOLO en server/actions/admin/** y app/(admin)/**. Usa @/lib/supabase/server (RSC) o @/lib/supabase/client (browser).',
            },
          ],
        },
      ],
    },
  },

  // Excepciones a no-default-export — Next App Router exige defaults aquí
  {
    files: [
      'app/**/page.tsx',
      'app/**/layout.tsx',
      'app/**/error.tsx',
      'app/**/not-found.tsx',
      'app/**/loading.tsx',
      'app/**/route.ts',
      'app/**/template.tsx',
      'app/**/default.tsx',
      'app/**/global-error.tsx',
      'app/**/opengraph-image.tsx',
      'app/**/icon.tsx',
      'app/**/apple-icon.tsx',
      'app/**/sitemap.ts',
      'app/**/robots.ts',
      'app/**/manifest.ts',
      'middleware.ts',
      'next.config.ts',
      'next.config.mjs',
      '*.config.ts',
      '*.config.mjs',
      '*.config.js',
    ],
    rules: {
      'import/no-default-export': 'off',
    },
  },

  // Excepción al service role: los admin SÍ pueden importarlo
  {
    files: ['server/actions/admin/**', 'app/(admin)/**'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },

  // Apaga reglas stylistic que chocan con Prettier — DEBE IR AL FINAL
  prettierConfig,

  // Ignorar prototipo HTML y artefactos de build
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'docs/prototype-reference/**']),
]);

export default eslintConfig;
