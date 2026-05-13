import { createBrowserClient } from '@supabase/ssr';

/**
 * Cliente Supabase para BROWSER (Client Components, hooks).
 *
 * Usa la anon key. Las cookies de sesión las gestiona @supabase/ssr
 * automáticamente. Cualquier query respeta RLS porque el JWT del usuario
 * va en cada request.
 *
 * IMPORTANTE: Next.js / Turbopack solo inyecta variables NEXT_PUBLIC_* al
 * bundle del cliente cuando se accede como `process.env.VAR_NAME` directo
 * (NO con bracket notation `process.env[key]`). Por eso aquí NO usamos
 * `requireEnv()` de lib/utils/env — accedemos directo.
 *
 * No usar desde Server Components — usar `lib/supabase/server.ts`.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url === undefined || url.length === 0) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL no está definido. Verificá que está en .env.local y que reiniciaste pnpm dev después de agregarlo.',
    );
  }
  if (anonKey === undefined || anonKey.length === 0) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY no está definido en .env.local');
  }
  return createBrowserClient(url, anonKey);
}
