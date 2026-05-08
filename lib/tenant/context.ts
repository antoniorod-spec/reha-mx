import { headers } from 'next/headers';
import { cache } from 'react';

import { getOrganizationBySlug } from './queries';

import type { Organization } from '@/lib/db/schema/organizations';

/**
 * Tenant context para Server Components, Server Actions y route handlers.
 *
 * Patrón Next.js 16 idiomático: el middleware (Sub-paso 5d) setea el header
 * `x-tenant-slug` en el request. Este módulo lee el header y carga la
 * organización completa con `cache()` — UNA fetch por request, deduplicada.
 *
 * REGLA CLAUDE.md #8: Server Actions toman `organizationId` SIEMPRE desde
 * `getTenantContext()`, NUNCA desde input del cliente. Esto previene el bypass
 * de aislamiento multi-tenant.
 *
 * Uso:
 *   const { organizationId } = await getTenantContext();   // lanza si no hay tenant
 *   const ctx = await tryGetTenantContext();               // null en rutas públicas
 */

/** Header key que el middleware setea con el slug del tenant resuelto. */
export const TENANT_SLUG_HEADER = 'x-tenant-slug';

export interface TenantContext {
  organizationId: string;
  tenantSlug: string;
  organization: Organization;
}

/**
 * Devuelve el tenant del request actual.
 *
 * Lanza si NO hay tenant en headers o la org no existe / está suspendida.
 * Usar `tryGetTenantContext()` en rutas que pueden ser públicas (marketing).
 */
export async function getTenantContext(): Promise<TenantContext> {
  const ctx = await tryGetTenantContext();
  if (ctx === null) {
    throw new Error(
      'getTenantContext() llamado sin tenant. ' +
        'Verificá que el middleware setea x-tenant-slug o usá tryGetTenantContext() en rutas públicas.',
    );
  }
  return ctx;
}

/**
 * Versión safe — devuelve null en rutas públicas o si la org no existe.
 *
 * Implementada como función llamada por la versión cacheada para que la
 * deduplicación de `cache()` funcione por slug (mismo slug = misma fetch).
 */
export async function tryGetTenantContext(): Promise<TenantContext | null> {
  const headerList = await headers();
  const slug = headerList.get(TENANT_SLUG_HEADER);
  if (slug === null || slug.length === 0) return null;
  return loadTenantBySlug(slug);
}

/**
 * Carga la org por slug y construye el TenantContext.
 * `cache()` deduplica: si dos Server Components piden el mismo slug en el
 * mismo render pass, solo hace 1 query a Postgres.
 */
const loadTenantBySlug = cache(async (slug: string): Promise<TenantContext | null> => {
  const org = await getOrganizationBySlug(slug);
  if (org === null) return null;
  return {
    organizationId: org.id,
    tenantSlug: org.slug,
    organization: org,
  };
});
