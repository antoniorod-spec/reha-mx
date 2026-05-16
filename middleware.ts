import { NextResponse, type NextRequest } from 'next/server';

import { TENANT_SLUG_HEADER } from '@/lib/tenant/context';
import { resolveTenant, type ResolveOutput } from '@/lib/tenant/resolver';

/**
 * Middleware Next.js — combina dos responsabilidades por request:
 *
 *   1. RESOLUCIÓN DE TENANT — mapea host/pathname a tenant_slug y lo expone
 *      en el header `x-tenant-slug` para que Server Components/Actions lo lean
 *      vía `getTenantContext()` (lib/tenant/context).
 *
 *   2. REFRESH DE SESIÓN SUPABASE — llama a refreshAuthSession() para mantener
 *      cookies de auth frescas en cada request (rotación automática del access
 *      token via refresh token cuando expira).
 *
 * Orden: primero construir la response con tenant headers + rewrites, después
 * inyectar cookies de auth refreshadas en la misma response.
 *
 * Comportamiento por categoría del resolver:
 *   tenant         → setea header (rewrite /t/[slug]/* → /* si source=path)
 *   custom-domain  → DB lookup; si existe, setea header; si no, 404
 *   public         → pasa sin header (marketing rehai.app, localhost)
 *   reserved       → pasa sin header (admin/www/api/app — su routing los maneja)
 *
 * Runtime: Node.js via Fluid Compute (Next 16 default). Permite usar postgres-js
 * y Drizzle directamente, sin adaptar a edge.
 */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  try {
    const host = request.headers.get('host') ?? '';
    const pathname = request.nextUrl.pathname;

    const result = resolveTenant({ host, pathname });
    return await buildResponseForTenant(request, result);
  } catch (error) {
    // Último cinturón: cualquier excepción no manejada deja pasar la request
    // sin headers de tenant. Loguear con console.error porque no tenemos
    // Sentry todavía (Paso 12).
    console.error('[middleware] uncaught error:', error);
    return NextResponse.next();
  }
}

/**
 * Construye la `NextResponse` según el tipo de tenant resuelto.
 * Separada del middleware principal para que el flow de auth refresh
 * sea siempre el último paso, independiente del routing.
 */
async function buildResponseForTenant(
  request: NextRequest,
  result: ResolveOutput,
): Promise<NextResponse> {
  switch (result.type) {
    case 'tenant': {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set(TENANT_SLUG_HEADER, result.tenantSlug);

      // Si el tenant viene de /t/[slug]/*, rewrite internamente a la ruta sin
      // el prefijo. Así app/(app)/dashboard/page.tsx sirve tanto a
      // movewell.rehai.app/dashboard como a localhost:3000/t/movewell/dashboard.
      if (result.source === 'path') {
        const rewriteUrl = request.nextUrl.clone();
        rewriteUrl.pathname = result.pathname;
        return NextResponse.rewrite(rewriteUrl, {
          request: { headers: requestHeaders },
        });
      }

      return NextResponse.next({
        request: { headers: requestHeaders },
      });
    }

    case 'custom-domain': {
      // Import dinámico: postgres-js solo se carga si REALMENTE hay un custom
      // domain. Para rehai.vercel.app y otros hosts no-tenant, ni siquiera
      // entramos aquí (el resolver los trata como 'public').
      try {
        const { getOrganizationByCustomDomain } = await import('@/lib/tenant/queries');
        const org = await getOrganizationByCustomDomain(result.host);
        if (org === null) {
          return NextResponse.json(
            { error: 'Domain not configured', host: result.host },
            { status: 404 },
          );
        }
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set(TENANT_SLUG_HEADER, org.slug);
        return NextResponse.next({
          request: { headers: requestHeaders },
        });
      } catch {
        // Si la DB cae o tarda demasiado no podemos romper TODO el middleware.
        // Devolvemos NextResponse.next() sin tenant header.
        return NextResponse.next();
      }
    }

    case 'public':
    case 'reserved':
      return NextResponse.next();
  }
}

/**
 * Matcher: excluye assets estáticos y archivos con extensión.
 * El middleware corre en TODA ruta de aplicación + API + páginas.
 */
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)'],
};
