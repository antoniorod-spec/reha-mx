import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

import { requireEnv } from '@/lib/utils/env';

/**
 * Cliente Supabase para SERVER (RSC, Server Actions, route handlers).
 *
 * Usa anon key. La sesión del usuario viene en cookies; @supabase/ssr las
 * lee/escribe via el adapter `cookies()` de Next. RLS aplica con la
 * identidad del usuario autenticado.
 *
 * No usar desde Client Components — usar `lib/supabase/client.ts`.
 * Para operaciones admin que bypassean RLS — usar `lib/supabase/service.ts`.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // En Server Components no se pueden mutar cookies — el middleware
            // se encarga del refresh. Este catch evita el error en RSC.
          }
        },
      },
    },
  );
}
