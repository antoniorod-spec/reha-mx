import { createServerClient } from '@supabase/ssr';
import { type NextRequest, type NextResponse } from 'next/server';

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
 *
 * IMPORTANTE: usa `process.env.NAME` directo (no `requireEnv` con corchetes)
 * porque el bundler de Next.js solo inlinea acceso por punto a NEXT_PUBLIC_*
 * en el código que corre fuera del servidor Node tradicional (middleware/edge).
 */
export async function refreshAuthSession(
  request: NextRequest,
  response: NextResponse,
): Promise<{ userId: string | null }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // En middleware no podemos romper el request — devolvemos sesión vacía.
    // Esto solo pasaría si las env vars no están configuradas en Vercel.
    return { userId: null };
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
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
  });

  // getUser() valida el JWT contra el server (vs getSession que solo lee cookie)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { userId: user?.id ?? null };
}
