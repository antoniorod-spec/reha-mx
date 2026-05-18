import 'server-only';

import { and, eq } from 'drizzle-orm';

import { db } from '@/lib/db/client';
import { members, type Member } from '@/lib/db/schema/members';
import { organizations, type Organization } from '@/lib/db/schema/organizations';
import { createClient } from '@/lib/supabase/server';
import { tryGetTenantContext } from '@/lib/tenant/context';

/**
 * Resuelve la organización "activa" del usuario actual desde un Server Component.
 *
 * Estrategia en cascada:
 *   1. Si el middleware resolvió tenant (subdomain o path /t/[slug]) → usar ese.
 *   2. Fallback: primera membership ACTIVA del usuario en Supabase.
 *
 * Esto permite que mientras no tengamos custom domain (`rehai.app` o
 * `*.rehai.app`), los usuarios entren a `rehai.vercel.app/pacientes` y se les
 * resuelva su clínica automáticamente. Cuando configuremos subdomains reales
 * (Fase 1 final), getTenantContext() toma el control.
 *
 * Devuelve `null` si el usuario no está autenticado o no es miembro activo
 * de ninguna org. El caller decide redirect a `/login` o mostrar onboarding.
 */
export interface CurrentUserOrg {
  userId: string;
  email: string;
  organization: Organization;
  membership: Pick<Member, 'role' | 'status'>;
}

export async function getCurrentUserOrg(): Promise<CurrentUserOrg | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user === null) return null;

  const tenantCtx = await tryGetTenantContext();

  if (tenantCtx !== null) {
    // El middleware ya resolvió tenant — solo verificamos que el user sea
    // miembro activo de ese tenant.
    const rows = await db
      .select({
        role: members.role,
        status: members.status,
      })
      .from(members)
      .where(
        and(
          eq(members.userId, user.id),
          eq(members.organizationId, tenantCtx.organizationId),
          eq(members.status, 'active'),
        ),
      )
      .limit(1);

    const m = rows[0];
    if (!m) return null;

    return {
      userId: user.id,
      email: user.email ?? '',
      organization: tenantCtx.organization,
      membership: m,
    };
  }

  // Sin tenant en headers — buscar primera membership activa del usuario.
  const rows = await db
    .select({
      org: organizations,
      role: members.role,
      status: members.status,
    })
    .from(members)
    .innerJoin(organizations, eq(members.organizationId, organizations.id))
    .where(and(eq(members.userId, user.id), eq(members.status, 'active')))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  return {
    userId: user.id,
    email: user.email ?? '',
    organization: row.org,
    membership: { role: row.role, status: row.status },
  };
}
