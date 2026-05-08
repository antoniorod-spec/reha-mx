import { config as loadEnv } from 'dotenv';

import type { Config } from 'drizzle-kit';

// drizzle-kit es un binario externo: cargar .env.local explícitamente
loadEnv({ path: '.env.local' });

/**
 * Drizzle config para Rehai.
 *
 * Conecta al SESSION POOLER (5532) — soporta prepared statements y todo lo
 * que drizzle-kit necesita para introspección, generate, push, migrate.
 *
 * El runtime de la app (Server Components/Actions) usa el TRANSACTION POOLER
 * (6643) en lib/db/client.ts con `prepare: false`.
 */
export default {
  dialect: 'postgresql',
  schema: './lib/db/schema/*.ts',
  out: './lib/db/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
  },
  verbose: true,
  strict: true,
} satisfies Config;
