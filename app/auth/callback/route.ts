import { NextResponse, type NextRequest } from 'next/server';

import { createClient } from '@/lib/supabase/server';

/**
 * Auth callback — recibe el code del magic link y lo intercambia por sesión.
 *
 * Flow:
 *   1. Usuario hace click en magic link del email → llega aquí con ?code=xxx
 *   2. exchangeCodeForSession setea cookies de sesión (vía @supabase/ssr)
 *   3. Redirect a `next` (default /) — la página destino lee la sesión
 *      via createClient() o getUser()
 *
 * Manejo de errores: si Supabase rechaza el code (expirado o ya usado),
 * redirige a /login?error=expired para que el usuario pida nuevo magic link.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const url = request.nextUrl;
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/';

  if (code === null || code.length === 0) {
    return NextResponse.redirect(new URL('/login?error=missing-code', request.url));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error !== null) {
    // Code expirado o ya usado — Supabase no permite reusarlos
    return NextResponse.redirect(
      new URL(`/login?error=expired&reason=${encodeURIComponent(error.message)}`, request.url),
    );
  }

  // `next` permite que el origen del login indique destino post-auth
  // (p.ej. desde una página protegida que redirige a /login?next=/dashboard).
  // Validamos que sea una ruta interna para evitar open redirect.
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/';
  return NextResponse.redirect(new URL(safeNext, request.url));
}
