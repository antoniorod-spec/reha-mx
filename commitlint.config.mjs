/**
 * Commitlint config — Conventional Commits.
 * Tipos permitidos: feat, fix, refactor, docs, test, chore, perf, ci, build, style, revert.
 *
 * Ejemplos:
 *   feat(agenda): agregar drag & drop de citas
 *   fix(rls): corregir policy de patients para rol practitioner
 *   chore: bump dependencies
 *   docs(claude): actualizar regla 11 sobre service role
 */

/** @type {import('@commitlint/types').UserConfig} */
const config = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Subject hasta 100 chars (default 72 es corto para PR titles descriptivos)
    'subject-max-length': [2, 'always', 100],
    'header-max-length': [2, 'always', 120],
    // Permitir sentence-case y lower-case en subject (no obligar lower-case)
    'subject-case': [2, 'never', ['pascal-case', 'upper-case']],
  },
};

export default config;
