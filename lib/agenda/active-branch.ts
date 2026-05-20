import 'server-only';

import { and, eq } from 'drizzle-orm';
import { cookies } from 'next/headers';

import { db } from '@/lib/db/client';
import { branches, type Branch } from '@/lib/db/schema/branches';

/**
 * Branch "activo" del workspace — persistido en cookie por usuario+browser.
 *
 * Valores:
 *   - cookie ausente o "all" → vista consolidada (sin filtro).
 *   - cookie con slug → se busca el branch en la org actual; si no existe
 *     (ej. cambió de org, fue borrado), se trata como vista consolidada.
 *
 * El nombre de cookie usa prefijo `rehai-` para no chocar con cookies de
 * tenant/auth de Supabase.
 */
export const ACTIVE_BRANCH_COOKIE = 'rehai-active-branch';
export const ACTIVE_BRANCH_ALL = 'all';

export async function getActiveBranch(organizationId: string): Promise<Branch | null> {
  const store = await cookies();
  const slug = store.get(ACTIVE_BRANCH_COOKIE)?.value;
  if (!slug || slug === ACTIVE_BRANCH_ALL) return null;

  const rows = await db
    .select()
    .from(branches)
    .where(and(eq(branches.organizationId, organizationId), eq(branches.slug, slug)))
    .limit(1);

  return rows[0] ?? null;
}
