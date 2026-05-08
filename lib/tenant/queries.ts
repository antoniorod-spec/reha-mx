import { eq } from 'drizzle-orm';

import { db } from '@/lib/db/client';
import { organizations, type Organization } from '@/lib/db/schema/organizations';
import { tenantDomains } from '@/lib/db/schema/tenant-domains';

/**
 * Queries del tenant resolver — corren contra Postgres (transaction pooler).
 * Se usan desde el middleware Next.js (Sub-paso 5d).
 *
 * Las RLS policies que escribimos en Paso 8 NO bloquean estas queries
 * porque las hace el rol de la app (no auth.uid()). El resolver opera
 * antes de saber quién es el usuario.
 */

/**
 * Busca una organización por su slug ('movewell', 'demo-rehab').
 * Devuelve null si no existe o está suspendida (acceso bloqueado).
 */
export async function getOrganizationBySlug(slug: string): Promise<Organization | null> {
  const rows = await db.select().from(organizations).where(eq(organizations.slug, slug)).limit(1);

  const org = rows[0];
  if (org === undefined) return null;
  if (org.subscriptionStatus === 'suspended') return null;
  return org;
}

/**
 * Busca la organización dueña de un custom domain ('app.movewell.mx').
 * Requiere que el dominio esté verificado (verified_at no nulo).
 */
export async function getOrganizationByCustomDomain(domain: string): Promise<Organization | null> {
  const rows = await db
    .select({
      id: organizations.id,
      slug: organizations.slug,
      name: organizations.name,
      subscriptionStatus: organizations.subscriptionStatus,
      createdAt: organizations.createdAt,
      updatedAt: organizations.updatedAt,
    })
    .from(tenantDomains)
    .innerJoin(organizations, eq(tenantDomains.organizationId, organizations.id))
    .where(eq(tenantDomains.domain, domain))
    .limit(1);

  const row = rows[0];
  if (row === undefined) return null;
  if (row.subscriptionStatus === 'suspended') return null;
  return row;
}
