import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from '@/lib/db/schema';

/**
 * Cliente Drizzle conectado al TRANSACTION POOLER (Supavisor :6643).
 *
 * Usar desde Server Components, Server Actions y route handlers autenticados.
 * Las queries van con la identidad del usuario autenticado (RLS aplica).
 *
 * IMPORTANTE:
 * - prepare: false → transaction pooler no soporta prepared statements.
 * - ssl: false → Supavisor self-hosted no tiene TLS habilitado todavía
 *   (TODO antes de Fase 6 / go-live MoveWell).
 *
 * Las MIGRATIONS usan el SESSION POOLER (DATABASE_URL, puerto 5532) vía
 * drizzle-kit y drizzle.config.ts. NO usar este cliente para migrar.
 */
const url = process.env.DATABASE_POOL_URL;
if (!url) {
  throw new Error(
    'DATABASE_POOL_URL no está configurado. Definir en .env.local con el transaction pooler de Supavisor.',
  );
}

const queryClient = postgres(url, {
  prepare: false,
  ssl: false,
  max: 10,
});

export const db = drizzle(queryClient, { schema });

export type Database = typeof db;
