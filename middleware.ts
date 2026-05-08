import { NextResponse, type NextRequest } from 'next/server';

import { TENANT_SLUG_HEADER } from '@/lib/tenant/context';
import { getOrganizationByCustomDomain } from '@/lib/tenant/queries';
import { resolveTenant } from '@/lib/tenant/resolver';

/**
 * Middleware Next.js — resuelve el tenant en cada request y pasa el slug al
 * handler vía header `x-tenant-slug`. Server Components/Actions lo consumen
 * con `getTenantContext()` desde `@/lib/tenant/context`.
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
  const host = request.headers.get('host') ?? '';
  const pathname = request.nextUrl.pathname;

  const result = resolveTenant({ host, pathname });

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
      const org = await getOrganizationByCustomDomain(result.host);
      if (org === null) {
        // Custom domain apunta a Rehai pero no está en tenant_domains
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
