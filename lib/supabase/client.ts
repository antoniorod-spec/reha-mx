import { createBrowserClient } from '@supabase/ssr';

import { requireEnv } from '@/lib/utils/env';

/**
 * Cliente Supabase para BROWSER (Client Components, hooks).
 *
 * Usa la anon key. Las cookies de sesión las gestiona @supabase/ssr
 * automáticamente. Cualquier query respeta RLS porque el JWT del usuario
 * va en cada request.
 *
 * No usar desde Server Components — usar `lib/supabase/server.ts`.
 */
export function createClient() {
  return createBrowserClient(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  );
}
