/**
 * Tenant resolver — pure function (sin IO).
 *
 * Mapea un request entrante (host + pathname) a una de cuatro categorías:
 *
 *   - 'tenant':         slug determinado por subdomain o path prefix /t/[slug]
 *   - 'custom-domain':  host es candidato a custom domain — requiere lookup en DB
 *   - 'public':         marketing público (rehai.app, www.rehai.app, localhost)
 *   - 'reserved':       subdomain reservado (admin, api, app, cdn, www)
 *
 * El middleware Next.js consume el resultado y decide qué hacer:
 *   tenant         → setear context, render app del tenant
 *   custom-domain  → query getOrganizationByCustomDomain, redirect o 404
 *   public         → render marketing
 *   reserved       → ruteo específico (admin tiene su propia app)
 *
 * No hace network ni DB calls. Tests unitarios sin mocks (Paso 11).
 */

const APEX_HOST = 'rehai.app';

/** Subdomains que NO son tenants — son hosts del producto Rehai mismo. */
const RESERVED_SUBDOMAINS = new Set(['www', 'admin', 'api', 'cdn', 'app']);

/** Hosts de desarrollo que se tratan como public (marketing) sin path prefix. */
const DEV_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0']);

/**
 * Sufijos de hosts de plataforma que NO son tenants — son los dominios de Vercel
 * para deploy previews y production aliases. Sin esto, el middleware los trata
 * como custom-domain y pega a la DB en cada request (causando timeouts cuando
 * la red está degradada).
 */
const PLATFORM_HOST_SUFFIXES = ['.vercel.app'];

/** Slug válido: letras, números, guiones; 1-63 chars (DNS subdomain limit). */
const SLUG_REGEX = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

export type TenantSource = 'subdomain' | 'path';

export type ResolveOutput =
  | { type: 'tenant'; tenantSlug: string; source: TenantSource; pathname: string }
  | { type: 'custom-domain'; host: string; pathname: string }
  | { type: 'public'; pathname: string }
  | { type: 'reserved'; subdomain: string; pathname: string };

interface ResolveInput {
  /** Hostname del request, puede incluir puerto. Ej: 'movewell.rehai.app', 'localhost:3000' */
  host: string;
  /** Pathname del request, debe empezar con '/'. Ej: '/dashboard', '/t/movewell/agenda' */
  pathname: string;
}

export function resolveTenant({ host, pathname }: ResolveInput): ResolveOutput {
  const cleanHost = stripPort(host).toLowerCase();
  const safePath = pathname.length > 0 ? pathname : '/';

  // 1. Path prefix /t/[slug]/* — precedencia máxima (override en cualquier host).
  //    Útil en dev: localhost:3000/t/movewell/dashboard
  const pathMatch = safePath.match(/^\/t\/([^/]+)(\/.*)?$/);
  if (pathMatch) {
    const rawSlug = pathMatch[1] ?? '';
    const slug = rawSlug.toLowerCase();
    if (SLUG_REGEX.test(slug)) {
      return {
        type: 'tenant',
        tenantSlug: slug,
        source: 'path',
        pathname: pathMatch[2] ?? '/',
      };
    }
    // Slug inválido en /t/[slug]: fallthrough — el caller decide (probablemente 404)
  }

  // 2. Apex y www → marketing público
  if (cleanHost === APEX_HOST || cleanHost === `www.${APEX_HOST}`) {
    return { type: 'public', pathname: safePath };
  }

  // 3. Subdomain bajo rehai.app
  const apexSuffix = `.${APEX_HOST}`;
  if (cleanHost.endsWith(apexSuffix)) {
    const sub = cleanHost.slice(0, -apexSuffix.length);
    // Solo subdomain de un nivel (movewell.rehai.app, NO foo.bar.rehai.app)
    if (sub.includes('.')) {
      return { type: 'reserved', subdomain: sub, pathname: safePath };
    }
    if (RESERVED_SUBDOMAINS.has(sub)) {
      return { type: 'reserved', subdomain: sub, pathname: safePath };
    }
    if (SLUG_REGEX.test(sub)) {
      return { type: 'tenant', tenantSlug: sub, source: 'subdomain', pathname: safePath };
    }
    // Subdomain inválido (ej. con caracteres raros) — tratar como reserved
    return { type: 'reserved', subdomain: sub, pathname: safePath };
  }

  // 4. Hosts de desarrollo (sin path prefix tenant)
  if (DEV_HOSTS.has(cleanHost)) {
    return { type: 'public', pathname: safePath };
  }

  // 5. Hosts de plataforma (Vercel) → tratar como public (no son tenants).
  for (const suffix of PLATFORM_HOST_SUFFIXES) {
    if (cleanHost === suffix.slice(1) || cleanHost.endsWith(suffix)) {
      return { type: 'public', pathname: safePath };
    }
  }

  // 6. Otro hostname → candidato a custom domain. Middleware hace lookup en DB.
  return { type: 'custom-domain', host: cleanHost, pathname: safePath };
}

function stripPort(host: string): string {
  const colon = host.indexOf(':');
  return colon === -1 ? host : host.slice(0, colon);
}
