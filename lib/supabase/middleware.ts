import { createServerClient } from '@supabase/ssr';
import { type NextRequest, type NextResponse } from 'next/server';

import { requireEnv } from '@/lib/utils/env';

/**
 * Refresh de sesión Supabase desde el middleware Next.js.
 *
 * El middleware raíz (middleware.ts) llama a esta función para mantener
 * la cookie de sesión fresca en cada request. Si el access token expiró,
 * @supabase/ssr lo renueva automáticamente con el refresh token.
 *
 * Devuelve `userId` (o null si no hay sesión) — útil para que el middleware
 * decida si redirigir a /login en rutas protegidas (lógica que se agrega
 * cuando tengamos roles, Paso 8+).
 */
export async function refreshAuthSession(
  request: NextRequest,
  response: NextResponse,
): Promise<{ userId: string | null }> {
  const supabase = createServerClient(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set({ name, value, ...options });
          });
        },
      },
    },
  );

  // getUser() valida el JWT contra el server (vs getSession que solo lee cookie)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { userId: user?.id ?? null };
}
